import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

dotenv.config();

// Simple SHA-256 hashing for local simulation
function generateHash(text: string, salt: string): string {
  return crypto
    .createHmac("sha256", salt)
    .update(text)
    .digest("hex");
}

const PORT = 3000;
const DNI_SALT_LOCAL = process.env.DNI_SALT || "autosol_local_salt_123_xyz";

// In-memory simulation database for local testing when Apps Script is not configured
const mockClientes = [
  {
    token: "TOKEN123",
    dni: "12345678", // Will hash this to compare
    nombre: "Juan Carlos Pérez",
    modelo: "Polo Trendline 1.6",
    asesor: "Abigail Wierna",
    montoCuota2: "145.000,00",
    medioPagoPrevisto: "Débito Automático",
    estado: "Pendiente",
    intentos: 0
  },
  {
    token: "TOKEN456",
    dni: "87654321",
    nombre: "María Florencia Rodríguez",
    modelo: "Amarok Comfortline V6",
    asesor: "Carlos Gomez",
    montoCuota2: "320.000,00",
    medioPagoPrevisto: "Transferencia",
    estado: "Pendiente",
    intentos: 0
  },
  {
    token: "TOKEN789",
    dni: "11223344",
    nombre: "Pedro Antonio Soler",
    modelo: "Taos Highline 250 TSI",
    asesor: "Ana Martínez",
    montoCuota2: "260.000,00",
    medioPagoPrevisto: "Pago por Cupón",
    estado: "Respondido",
    intentos: 0
  }
];

const mockRespuestas: Record<string, any> = {};

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route: Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.APPS_SCRIPT_URL ? "live" : "mock" });
  });

  // Local Netlify Function Simulation: validarCliente
  app.post("/.netlify/functions/validarCliente", async (req, res) => {
    const { token, dni } = req.body;
    console.log(`[Local Netlify Function] validarCliente called for token: ${token}`);

    if (!token || !dni) {
      return res.status(400).json({ status: "ERROR", message: "Faltan datos obligatorios" });
    }

    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const backendSecret = process.env.BACKEND_SECRET || "CAMBIAR_POR_CLAVE_SEGURA";

    // If live Apps Script is configured, proxy the request there
    if (appsScriptUrl && appsScriptUrl !== "https://script.google.com/macros/s/XXXXX/exec") {
      try {
        console.log(`[Proxy] Forwarding to Apps Script: ${appsScriptUrl}`);
        const response = await fetch(appsScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "validarCliente",
            backendSecret,
            token,
            dni
          })
        });
        const data = await response.json();
        return res.json(data);
      } catch (error: any) {
        console.error("[Proxy Error] Error contacting Apps Script:", error);
        return res.status(500).json({ status: "ERROR", message: "Error al conectar con el backend de Google Sheets" });
      }
    }

    // Otherwise, simulate locally for instant preview responsiveness
    const client = mockClientes.find((c) => c.token === token);
    if (!client) {
      return res.json({ status: "TOKEN_INVALIDO" });
    }

    // if (client.estado === "Respondido") {
    //   return res.json({ status: "YA_RESPONDIO" });
    // }

    // Normalizar DNI
    const normDniInput = dni.replace(/\D/g, "");
    const normClientDni = client.dni.replace(/\D/g, "");

    if (normDniInput !== normClientDni) {
      client.intentos += 1;
      return res.json({ status: "DNI_INVALIDO" });
    }

    // Success! Return only non-sensitive safe data
    return res.json({
      status: "OK",
      cliente: {
        nombre: client.nombre,
        modelo: client.modelo,
        asesor: client.asesor,
        montoCuota2: client.montoCuota2,
        medioPagoPrevisto: client.medioPagoPrevisto
      },
      vendedores: [
        "ARIADNA PETRUCIOLI",
        "BRIAN DOUTHAT",
        "EMILSE DIAZ",
        "GASTON BASTOS",
        "HORACIO ZELAYA",
        "JOSE SALUZZO",
        "RODRIGO VILLAFAÑE",
        "VANESA ZAMBRANO"
      ]
    });
  });

  // Local Netlify Function Simulation: enviarEncuesta
  app.post("/.netlify/functions/enviarEncuesta", async (req, res) => {
    const { token, dni, respuestas } = req.body;
    console.log(`[Local Netlify Function] enviarEncuesta called for token: ${token}`);

    if (!token || !dni || !respuestas) {
      return res.status(400).json({ status: "ERROR", message: "Faltan datos de la encuesta" });
    }

    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const backendSecret = process.env.BACKEND_SECRET || "CAMBIAR_POR_CLAVE_SEGURA";

    // If live Apps Script is configured, proxy the request there
    if (appsScriptUrl && appsScriptUrl !== "https://script.google.com/macros/s/XXXXX/exec") {
      try {
        console.log(`[Proxy] Forwarding survey to Apps Script: ${appsScriptUrl}`);
        const response = await fetch(appsScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "guardarEncuesta",
            backendSecret,
            token,
            dni,
            respuestas
          })
        });
        const data = await response.json();
        return res.json(data);
      } catch (error: any) {
        console.error("[Proxy Error] Error submitting survey to Apps Script:", error);
        return res.status(500).json({ status: "ERROR", message: "Error al guardar encuesta en el servidor" });
      }
    }

    // Otherwise, simulate local saving and scoring computation
    const client = mockClientes.find((c) => c.token === token);
    if (!client) {
      return res.json({ status: "TOKEN_INVALIDO" });
    }

    // if (client.estado === "Respondido") {
    //   return res.json({ status: "YA_RESPONDIO" });
    // }

    const normDniInput = dni.replace(/\D/g, "");
    const normClientDni = client.dni.replace(/\D/g, "");

    if (normDniInput !== normClientDni) {
      return res.json({ status: "DNI_INVALIDO" });
    }

    // Local Scoring Calculation Engine (identical to Apps Script rules)
    let scoringResult = "Pasó scoring";
    let scoringReason = "Validación conforme.";
    let requiresRecontact = "No";
    let areaToReview = "Sin revisión";
    let internalObservation = "";

    const q1 = respuestas.q1 || "";
    const q2 = respuestas.q2 || "";
    const q3 = respuestas.q3 || "";
    const q4 = respuestas.q4 || "";
    const q5 = respuestas.q5 || "";
    const q6 = respuestas.q6 || "";
    const q8 = respuestas.q8 || "";
    const q8c = respuestas.q8c || "";
    const q9 = respuestas.q9 || "";
    const q10 = parseInt(respuestas.q10 || "5", 10);
    const q11 = respuestas.q11 || "";
    const q12 = respuestas.q12 || "";
    const q13 = respuestas.q13 || "";
    const q15 = respuestas.q15 || "";
    const q16 = respuestas.q16 || "";
    const q17 = respuestas.q17 || "";

    const containsNegativeKeywords = (text: string) => {
      const keywords = ["reclamo", "problema", "no me explicaron", "nadie me llamó", "disconforme", "mentira", "engaño", "no entiendo", "duda", "molestia"];
      const lower = text.toLowerCase();
      return keywords.some((kw) => lower.includes(kw));
    };

    const hasPaymentDoubts = (text: string) => {
      const keywords = ["duda", "no sé", "no se", "mal cobrado", "error", "diferente", "mas", "más", "menos"];
      const lower = text.toLowerCase();
      return keywords.some((kw) => lower.includes(kw));
    };

    // Rule 3: REQUIERE REVISIÓN (Lowest Priority alert)
    if (
      q10 === 1 || q10 === 2 ||
      q2 === "No recuerdo" ||
      q3 === "No recuerdo" ||
      q4 === "Parcialmente" ||
      q5 === "No recuerdo" ||
      q11 === "Parcialmente" ||
      (q12 && q12.toLowerCase() !== "no" && q12.trim() !== "") ||
      q13 === "Sí"
    ) {
      scoringResult = "Requiere revisión";
      areaToReview = "Asesor comercial";
      scoringReason = "Alertas menores detectadas (calificación baja o falta de recuerdo).";
      if (q13 === "Sí") areaToReview = "Entrega / usado";
      if (q5 === "No recuerdo") areaToReview = "Asesor comercial";
    }

    // Rule 2: REQUIERE RECONTACTO (Medium Priority alert)
    if (
      q17 === "Sí" ||
      q8c === "No" || q8c === "Parcialmente" ||
      containsNegativeKeywords(q16) ||
      hasPaymentDoubts(q6)
    ) {
      scoringResult = "Requiere recontacto";
      requiresRecontact = "Sí";
      areaToReview = q17 === "Sí" ? "Contact Center" : "Gestión de pagos";
      scoringReason = "El cliente solicita recontacto o presenta dudas críticas de pago/débito.";
    }

    // Rule 1: NO PASÓ SCORING (Maximum Priority alert)
    if (
      q1 === "No" ||
      q2 === "No" ||
      q3 === "No" ||
      q4 === "No" ||
      q5 === "No" ||
      (!q9 || q9.toLowerCase().includes("vacio") || q9.toLowerCase().includes("no se") || q9.toLowerCase().trim() === "") ||
      q15 === "Se lo prometieron pero no lo recibió"
    ) {
      scoringResult = "No pasó scoring";
      areaToReview = "Administración Plan de Ahorro";
      scoringReason = "No conformidad en cláusulas fundamentales de suscripción o beneficio no recibido.";
      if (!q9 || q9.trim() === "") {
        scoringReason = "No identifica vendedor en la encuesta.";
        areaToReview = "Asesor comercial";
      }
    }

    // Update in-memory mock client status
    client.estado = "Respondido";
    mockRespuestas[token] = {
      respuestas,
      scoring: {
        resultado: scoringResult,
        motivo: scoringReason,
        requiereRecontacto: requiresRecontact,
        area: areaToReview,
        observacion: q16
      }
    };

    console.log(`[Local Simulation] Survey saved. Result: ${scoringResult} (${scoringReason})`);

    return res.json({
      status: "OK",
      scoringResult
    });
  });

  // Set up Vite development server middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
    if (!process.env.APPS_SCRIPT_URL) {
      console.log(`[Server] Mode: SIMULATED DATABASE (No APPS_SCRIPT_URL found in .env).`);
      console.log(`[Server] Try these tokens in preview URL:`);
      console.log(`  - http://localhost:3000/?t=TOKEN123  (DNI: 12345678)`);
      console.log(`  - http://localhost:3000/?t=TOKEN456  (DNI: 87654321)`);
    } else {
      console.log(`[Server] Mode: LIVE (Proxying requests to ${process.env.APPS_SCRIPT_URL})`);
    }
  });
}

startServer();
