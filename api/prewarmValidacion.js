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
    const token = String((body && body.token) || "").trim();
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const backendSecret = process.env.BACKEND_SECRET;

    if (!token || !appsScriptUrl || !backendSecret) {
      return json(res, 200, { status: "SKIPPED" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    try {
      await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "warmup", backendSecret, token }),
        signal: controller.signal,
      });
    } catch (error) {
      // El objetivo es solo despertar el runtime remoto; ignoramos errores.
    } finally {
      clearTimeout(timeout);
    }

    return json(res, 200, { status: "OK" });
  } catch (error) {
    return json(res, 200, { status: "OK" });
  }
}
