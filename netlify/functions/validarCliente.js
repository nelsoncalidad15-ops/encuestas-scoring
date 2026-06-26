function getCorsOrigin(event) {
  const configuredOrigins = [
    process.env.SITE_ORIGIN,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL
  ].filter(Boolean);
  const requestOrigin = event.headers.origin || event.headers.Origin;

  if (requestOrigin && configuredOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return configuredOrigins[0] || "null";
}

exports.handler = async (event, context) => {
  // CORS Headers
  const corsOrigin = getCorsOrigin(event);
  const headers = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ status: "ERROR", message: "Método no permitido" })
    };
  }

  try {
    const { token, dni } = JSON.parse(event.body || "{}");

    // Validate inputs
    if (!token || !dni) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ status: "ERROR", message: "Token y DNI son requeridos" })
      };
    }

    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const backendSecret = process.env.BACKEND_SECRET;

    if (!appsScriptUrl || !backendSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          status: "ERROR", 
          message: "Configuracion incorrecta del servidor: faltan variables seguras en Netlify." 
        })
      };
    }

    // Mask DNI for logs
    const maskedDni = dni.length > 4 ? `${dni.slice(0, 2)}***${dni.slice(-2)}` : "***";
    console.log(`[validarCliente] Forwarding to Apps Script for token: ${token}, DNI: ${maskedDni}`);

    // Call Apps Script
    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "validarCliente",
        backendSecret,
        token,
        dni
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[validarCliente] Apps Script returned error status: ${response.status}`, errorText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ 
          status: "ERROR", 
          message: "El servidor de base de datos devolvió un error de comunicación." 
        })
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error("[validarCliente] Internal Function Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        status: "ERROR", 
        message: "No se pudo completar la validación en este momento." 
      })
    };
  }
};
