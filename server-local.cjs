const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

function clearBrokenLocalProxyEnv() {
  const proxyKeys = [
    "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY",
    "http_proxy", "https_proxy", "all_proxy",
    "GIT_HTTP_PROXY", "GIT_HTTPS_PROXY"
  ];
  for (const key of proxyKeys) {
    const value = process.env[key];
    if (value && value.includes("127.0.0.1:9")) {
      delete process.env[key];
    }
  }
}

clearBrokenLocalProxyEnv();

const PORT = 3000;
const ROOT = process.cwd();
const DNI_SALT_LOCAL = process.env.DNI_SALT || "autosol_local_salt_123_xyz";

function generateHash(text, salt) {
  return crypto.createHmac("sha256", salt).update(text).digest("hex");
}

const mockClientes = [
  {
    token: "TOKEN123",
    dni: "12345678",
    nombre: "Cliente Demo Uno",
    modelo: "NIVUS SENSE 170 TSI MT 80/20 CTA 8/12/24",
    asesor: "Asesor Demo",
    montoCuota2: "185000",
    medioPagoPrevisto: "Debito Automatico",
    estado: "Pendiente",
    intentos: 0
  }
];

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(ROOT, { index: false }));
app.use("/assets", express.static(path.join(ROOT, "assets")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.APPS_SCRIPT_URL ? "live" : "mock", server: "local-direct" });
});

app.post("/.netlify/functions/validarCliente", async (req, res) => {
  const { token, dni } = req.body || {};
  if (!token || !dni) {
    return res.status(400).json({ status: "ERROR", message: "Faltan datos obligatorios" });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  const backendSecret = process.env.BACKEND_SECRET || "";

  if (appsScriptUrl && backendSecret) {
    try {
      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validarCliente", backendSecret, token, dni })
      });
      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        return res.status(502).json({ status: "ERROR", message: "Apps Script devolvio una respuesta invalida", raw });
      }
      return res.status(response.ok ? 200 : 502).json(data);
    } catch (error) {
      return res.status(500).json({ status: "ERROR", message: "Error al conectar con el backend de Google Sheets", detail: String(error && error.message || error) });
    }
  }

  const cliente = mockClientes.find((c) => c.token === token);
  if (!cliente) return res.json({ status: "TOKEN_INVALIDO" });
  if (String(dni).replace(/D/g, "") !== String(cliente.dni).replace(/D/g, "")) return res.json({ status: "DNI_INVALIDO" });

  return res.json({
    status: "OK",
    cliente: {
      nombre: cliente.nombre,
      modelo: cliente.modelo,
      asesor: cliente.asesor,
      montoCuota2: cliente.montoCuota2,
      medioPagoPrevisto: cliente.medioPagoPrevisto
    }
  });
});

app.post("/.netlify/functions/enviarEncuesta", async (req, res) => {
  const { token, dni, respuestas } = req.body || {};
  if (!token || !dni || !respuestas) {
    return res.status(400).json({ status: "ERROR", message: "Faltan datos de la encuesta" });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  const backendSecret = process.env.BACKEND_SECRET || "";

  if (appsScriptUrl && backendSecret) {
    try {
      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "guardarEncuesta", backendSecret, token, dni, respuestas })
      });
      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        return res.status(502).json({ status: "ERROR", message: "Apps Script devolvio una respuesta invalida", raw });
      }
      return res.status(response.ok ? 200 : 502).json(data);
    } catch (error) {
      return res.status(500).json({ status: "ERROR", message: "Error al guardar encuesta en Google Sheets", detail: String(error && error.message || error) });
    }
  }

  return res.json({ status: "OK", scoringResult: "Mock" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT, "index.html"));
});

app.listen(PORT, "127.0.0.1", () => {
  console.log("[local-direct] http://127.0.0.1:" + PORT);
});
