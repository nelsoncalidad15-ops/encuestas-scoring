function json(res, status, payload) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.send(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function parseAppsScriptPayload(raw) {
  const text = String(raw || "").replace(/^\uFEFF/, "").trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch (innerError) {
        return null;
      }
    }
    return null;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function previewForLog(raw) {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .slice(0, 300);
}

async function requestAppsScript({ appsScriptUrl, payload, action }) {
  // Solo la validacion es segura para reintentar: no modifica datos. Evitamos
  // repetir el guardado de una encuesta si la primera llamada quedo en curso.
  const attempts = action === "validarCliente" ? 2 : 1;
  let lastResult = null;
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    // Dos intentos de 27 s entran dentro del limite de 60 s de Vercel y evitan
    // que una ejecucion de Google bloqueada consuma todo el tiempo disponible.
    const timeout = action === "validarCliente"
      ? setTimeout(() => controller.abort(), 27000)
      : null;
    const startedAt = Date.now();

    try {
      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const raw = await response.text();
      const data = parseAppsScriptPayload(raw);
      const elapsedMs = Date.now() - startedAt;

      console.info("[apps-script]", {
        action,
        attempt,
        status: response.status,
        elapsedMs,
        json: Boolean(data),
      });

      lastResult = { response, raw, data };
      if (response.ok && data) return lastResult;

      if (attempt < attempts) {
        console.warn("[apps-script] Reintentando validacion", {
          action,
          attempt,
          status: response.status,
          elapsedMs,
          responsePreview: previewForLog(raw),
        });
        await wait(700);
      }
    } catch (error) {
      lastError = error;
      console.warn("[apps-script] Error en intento", {
        action,
        attempt,
        elapsedMs: Date.now() - startedAt,
        error: error?.name || "Error",
      });
      if (attempt < attempts) await wait(700);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  if (lastResult) return lastResult;
  throw lastError || new Error("Apps Script no respondio");
}

export async function handleProxy(req, res, action) {
  if (req.method === "OPTIONS") {
    return json(res, 204, {});
  }

  if (req.method !== "POST") {
    return json(res, 405, { status: "ERROR", message: "Metodo no permitido" });
  }

  try {
    const body = await readBody(req);
    const { token, dni, respuestas } = body;

    if (!token || !dni || (action === "guardarEncuesta" && !respuestas)) {
      return json(res, 400, {
        status: "ERROR",
        message: action === "guardarEncuesta"
          ? "Token, DNI y respuestas son requeridos"
          : "Token y DNI son requeridos",
      });
    }

    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const backendSecret = process.env.BACKEND_SECRET;

    if (!appsScriptUrl || !backendSecret) {
      return json(res, 500, {
        status: "ERROR",
        message: "Faltan APPS_SCRIPT_URL o BACKEND_SECRET en Vercel.",
      });
    }

    const result = await requestAppsScript({
      appsScriptUrl,
      action,
      payload: {
        action,
        backendSecret,
        token,
        dni,
        ...(action === "guardarEncuesta" ? { respuestas } : {}),
      },
    });
    const { response, raw, data } = result;

    if (!data) {
      console.error("[apps-script] Respuesta no JSON", {
        action,
        status: response.status,
        responsePreview: previewForLog(raw),
      });
      return json(res, 502, {
        status: "ERROR",
        message: "Apps Script devolvio una respuesta invalida",
        appsScriptStatus: response.status,
      });
    }

    if (!response.ok) {
      return json(res, 502, {
        status: "ERROR",
        message: data.message || "Apps Script devolvio un error",
        appsScriptStatus: response.status,
      });
    }

    return json(res, 200, data);
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    console.error("[apps-script] No se pudo completar la solicitud", {
      action,
      error: error?.name || "Error",
    });
    return json(res, 500, {
      status: "ERROR",
      message: timedOut
        ? "La validacion esta demorando mas de lo habitual. Intente nuevamente en unos segundos."
        : "No se pudo completar la solicitud",
    });
  }
}
