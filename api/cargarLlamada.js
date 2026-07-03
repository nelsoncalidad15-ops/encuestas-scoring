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
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) return JSON.parse(req.body);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 204, {});
  if (req.method !== "POST") return json(res, 405, { status: "ERROR", message: "Metodo no permitido" });

  try {
    const body = await readBody(req);
    const { token } = body;

    if (!token) return json(res, 400, { status: "ERROR", message: "Token requerido" });
    if (!process.env.APPS_SCRIPT_URL || !process.env.BACKEND_SECRET) {
      return json(res, 500, { status: "ERROR", message: "Faltan APPS_SCRIPT_URL o BACKEND_SECRET en Vercel." });
    }

    const response = await fetch(process.env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "cargarLlamada",
        backendSecret: process.env.BACKEND_SECRET,
        token,
      }),
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      return json(res, 502, { status: "ERROR", message: "Apps Script devolvio una respuesta invalida", raw });
    }

    if (!response.ok) {
      return json(res, 502, { status: "ERROR", message: data.message || "Apps Script devolvio un error", appsScriptStatus: response.status });
    }

    return json(res, 200, data);
  } catch (error) {
    return json(res, 500, { status: "ERROR", message: error?.message || "No se pudo cargar la llamada" });
  }
}
