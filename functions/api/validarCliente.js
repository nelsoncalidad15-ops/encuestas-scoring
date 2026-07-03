function buildJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Cache-Control': 'no-store'
    }
  });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { token, dni } = await request.json();

    if (!token || !dni) {
      return buildJson({ status: 'ERROR', message: 'Token y DNI son requeridos' }, 400);
    }

    if (!env.APPS_SCRIPT_URL || !env.BACKEND_SECRET) {
      return buildJson({ status: 'ERROR', message: 'Faltan variables APPS_SCRIPT_URL o BACKEND_SECRET' }, 500);
    }

    const response = await fetch(env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'validarCliente',
        backendSecret: env.BACKEND_SECRET,
        token,
        dni
      })
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      return buildJson({ status: 'ERROR', message: 'Apps Script devolvio una respuesta invalida', raw }, 502);
    }

    if (!response.ok) {
      return buildJson({
        status: 'ERROR',
        message: data.message || 'Apps Script devolvio un error',
        appsScriptStatus: response.status
      }, 502);
    }

    return buildJson(data, 200);
  } catch (error) {
    return buildJson({ status: 'ERROR', message: error?.message || 'No se pudo completar la validacion' }, 500);
  }
}
