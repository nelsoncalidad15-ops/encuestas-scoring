/**************************************************************
 * BLOQUE FINAL - NUEVA DINAMICA SOLICITUDES + TMK
 * Pegar AL FINAL de Code.gs para reemplazar la logica de:
 * - Base_Clientes
 * - Seguimiento_CC
 *
 * Hojas base:
 * - SOLICITUDES JUJUY
 * - SOLICITUDES SALTA
 *
 * Hojas operativas:
 * - TMK - JUJUY
 * - TMK - SALTA
 **************************************************************/

var NOMBRE_CONTACT = typeof NOMBRE_CONTACT !== "undefined" ? NOMBRE_CONTACT : "Abigail Wierna";

var SOLICITUDES_CONFIG = [
  { base: "SOLICITUDES JUJUY", tmk: "TMK - JUJUY", sucursal: "JUJUY" },
  { base: "SOLICITUDES SALTA", tmk: "TMK - SALTA", sucursal: "SALTA" }
];

var COL_INICIO_LINKS = 26; // Columna Z

var HEADERS_LINKS_SOLICITUDES = [
  "ID_CLIENTE",
  "TOKEN",
  "DNI_HASH",
  "LINK_ENCUESTA",
  "ENVIAR WPP",
  "ESTADO_ENCUESTA",
  "FECHA_ENVIO_LINK"
];

var HEADERS_SOLICITUDES_MODELO = [
  "MES",
  "Nº",
  "FECHA",
  "NOMBRE Y APELLIDO",
  "DNI",
  "FECHA DE NACIMIENTO",
  "DOMICILIO",
  "MAIL",
  "TELEFONO",
  "Modelo suscripto/ plan",
  "TIPO DE PAGO",
  "N° DE SOLICITUD",
  "N° DE CLIENTE",
  "1º Cuota",
  "Imp. Cobrado 1º",
  "Saldo 1º Cuota",
  "CUOTA 2",
  "NOMBRE DEL VENDEDOR",
  "SIAC",
  "TMK",
  "SALESFORCE",
  "FINALIZADA",
  "Observaciones"
];

var HEADERS_TMK = [
  "SUCURSAL",
  "MES",
  "Nº",
  "FECHA",
  "NOMBRE Y APELLIDO",
  "DNI",
  "MAIL",
  "TELEFONO",
  "Modelo suscripto/ plan",
  "TIPO DE PAGO",
  "N° DE SOLICITUD",
  "N° DE CLIENTE",
  "CUOTA 2",
  "NOMBRE DEL VENDEDOR",
  "ID_CLIENTE",
  "TOKEN",
  "DNI_HASH",
  "LINK_ENCUESTA",
  "ENVIAR WPP",
  "ESTADO_ENCUESTA",
  "FECHA_ENVIO_LINK",
  "Q1_Conocia_plan_exclusivo",
  "Q2_Informaron_licitacion_cuota_2",
  "Q3_Informaron_adjudicacion_asegurada",
  "Q4_Informaron_monto_cuota_2",
  "Q4A_Monto_estimado_cuota_2",
  "Q5_Monto_primera_cuota",
  "Q5A_Acepto_debito_automatico",
  "Q5B_Fecha_pago_primera_cuota",
  "Q6_Quien_es_vendedor",
  "Q7_Tuvo_otro_plan_reciente",
  "Q7A_Detalle_otro_plan",
  "Q8_Como_conocio_propuesta",
  "Q9_Necesita_recontacto",
  "Q10_Observaciones_cliente",
  "RESULTADO_SCORING",
  "MOTIVO_RESULTADO",
  "REQUIERE_RECONTACTO",
  "AREA_A_REVISAR",
  "OBSERVACION_INTERNA",
  "FECHA_RESPUESTA_WEB",
  "FECHA_REALIZACION_SCORING",
  "CANAL_SCORING",
  "DECISION_FINAL",
  "MOTIVO_DECISION",
  "FECHA_DECISION",
  "GESTIONADO_POR",
  "OBSERVACION_TMK",
  "ESTADO_TMK",
  "PROXIMA_ACCION",
  "PRIORIDAD",
  "FECHA_PROXIMO_CONTACTO",
  "FECHA_ULTIMO_ENVIO_WPP",
  "CANTIDAD_INTENTOS_WPP",
  "ULTIMO_CONTACTO_TMK"
];

var HEADERS_RESPUESTAS_SCORING = [
  "ID_RESPUESTA", "ID_CLIENTE", "TOKEN_HASH", "DNI_HASH", "Fecha respuesta", "Nombre y Apellido",
  "Modelo suscripto", "Nombre del Asesor", "Monto_2da_cuota_base",
  "Q1_Conocia_plan_exclusivo", "Q2_Informaron_licitacion_cuota_2", "Q3_Informaron_adjudicacion_asegurada",
  "Q4_Informaron_monto_cuota_2", "Q4A_Monto_estimado_cuota_2",
  "Q5_Monto_primera_cuota", "Q5A_Acepto_debito_automatico", "Q5B_Fecha_pago_primera_cuota",
  "Q6_Quien_es_vendedor", "Q7_Tuvo_otro_plan_reciente", "Q7A_Detalle_otro_plan",
  "Q8_Como_conocio_propuesta", "Q9_Necesita_recontacto", "Q10_Observaciones_cliente",
  "RESULTADO_SCORING", "MOTIVO_RESULTADO", "REQUIERE_RECONTACTO", "AREA_A_REVISAR", "OBSERVACION_INTERNA"
];

var TMK_VIEW_SHEETS = [
  { name: "TMK - RECHAZADOS", mode: "RECHAZADOS" },
  { name: "TMK - REVISAR", mode: "REVISAR" }
];

var LEGACY_TMK_QUESTION_HEADERS = [
  "Q4_Diferencia_licitar_adjudicar",
  "Q5_Informaron_monto_cuota_2",
  "Q6_Primera_cuota_monto_medio",
  "Q7_Fecha_pago_primera_cuota",
  "Q8_Como_seguira_pagando",
  "Q8B_Firmo_anexo_debito",
  "Q8C_Entendio_debito",
  "Q9_Quien_es_vendedor",
  "Q10_Calificacion_vendedor",
  "Q11_Explico_caracteristicas_unidad",
  "Q12_Otro_plan_reciente",
  "Q13_Tiene_usado",
  "Q13A_Vehiculo_usado",
  "Q14_Como_conocio_propuesta",
  "Q15_Recibio_beneficio_regalo",
  "Q15A_Detalle_beneficio",
  "Q16_Observaciones_cliente",
  "Q17_Necesita_recontacto"
];

var ALIASES = {
  MES: ["MES", "Mes"],
  NRO: ["Nº", "N°", "NÂº", "NÂ°", "NRO", "N"],
  FECHA: ["FECHA", "fecha de carga de planilla"],
  NOMBRE: ["NOMBRE Y APELLIDO", "Nombre y Apellido", "Nombre y apellido"],
  DNI: ["DNI"],
  FECHA_NACIMIENTO: ["FECHA DE NACIMIENTO"],
  DOMICILIO: ["DOMICILIO", "DOMICILIO "],
  MAIL: ["MAIL", "Mail", "E-mail", "Email"],
  TELEFONO: ["TELEFONO", "TELÉFONO", "TELÃ‰FONO", "Celular", "CELULAR", "Telefono", "Teléfono", "TelÃ©fono"],
  MODELO: ["Modelo suscripto/ plan", "Modelo suscripto/falta plan", "MODELO"],
  TIPO_PAGO: ["TIPO DE PAGO", "¿Como seguira pagando su plan?", "¿Cómo seguirá pagando su plan?", "Â¿Como seguira pagando su plan?", "Â¿CÃ³mo seguirÃ¡ pagando su plan?"],
  SOLICITUD: ["N° DE SOLICITUD", "Nº DE SOLICITUD", "NÂ° DE SOLICITUD", "NÂº DE SOLICITUD", "Nro de solicitud", "NRO DE SOLICITUD"],
  NRO_CLIENTE: ["N° DE CLIENTE", "Nº DE CLIENTE", "NÂ° DE CLIENTE", "NÂº DE CLIENTE", "NRO DE CLIENTE"],
  CUOTA_1: ["1º Cuota", "1Â° Cuota", "1 Cuota"],
  IMP_COBRADO_1: ["Imp. Cobrado 1º", "Imp. Cobrado 1Â°"],
  SALDO_1: ["Saldo 1º Cuota", "Saldo 1Â° Cuota"],
  CUOTA_2: ["CUOTA 2", "Monto 2da cuota (aprox)", "Monto 2da cuota"],
  VENDEDOR: ["NOMBRE DEL VENDEDOR", "Nombre del Asesor", "Nombre del Vendedor"],
  SIAC: ["SIAC"],
  TMK: ["TMK"],
  SALESFORCE: ["SALESFORCE"],
  FINALIZADA: ["FINALIZADA"],
  OBS: ["Observaciones", "Observaciones"],
  ID_CLIENTE: ["ID_CLIENTE"],
  TOKEN: ["TOKEN"],
  DNI_HASH: ["DNI_HASH"],
  LINK_ENCUESTA: ["LINK_ENCUESTA"],
  ENVIAR_WPP: ["ENVIAR WPP", "ENVIAR_WPP", "WhatsApp"],
  ESTADO_ENCUESTA: ["ESTADO_ENCUESTA"],
  FECHA_ENVIO_LINK: ["FECHA_ENVIO_LINK"]
};

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("Encuestas Autosol")
      .addItem("1. Preparar planilla", "setupInicialDesdeMenu")
      .addItem("2. Generar links nuevos + actualizar TMK", "procesarNuevosIngresosDesdeMenu")
      .addItem("3. Actualizar hojas TMK", "actualizarHojasTMKDesdeMenu")
      .addItem("4. Actualizar vistas RECHAZADOS / REVISAR", "actualizarVistasTMKDesdeMenu")
      .addItem("5. Procesar scoring telefonico TMK", "procesarScoringTelefonicoTMKDesdeMenu")
      .addSeparator()
      .addItem("6. Reparar links y WhatsApp", "regenerarLinksExistentesDesdeMenu")
      .addItem("7. Instalar automatico cada 5 min", "instalarRevisionAutomaticaBaseClientesDesdeMenu")
      .addItem("8. Eliminar automatico", "eliminarRevisionAutomaticaBaseClientesDesdeMenu")
      .addToUi();
  } catch (e) {
    Logger.log("No se pudo crear el menu: " + e);
  }
}

function mostrarToast(mensaje) {
  try {
    SpreadsheetApp.getActive().toast(mensaje, "Encuestas Autosol", 7);
  } catch (e) {
    Logger.log(mensaje);
  }
}

function setupInicialDesdeMenu() {
  mostrarToast(setupInicial());
}

function procesarNuevosIngresosDesdeMenu() {
  mostrarToast(procesarNuevosIngresos());
}

function actualizarHojasTMKDesdeMenu() {
  mostrarToast(actualizarHojasTMK());
}

function actualizarVistasTMKDesdeMenu() {
  mostrarToast(actualizarVistasTMK_());
}

function procesarScoringTelefonicoTMKDesdeMenu() {
  mostrarToast(procesarScoringTelefonicoTMK());
}

function regenerarLinksExistentesDesdeMenu() {
  mostrarToast(regenerarLinksExistentes());
}

function instalarRevisionAutomaticaBaseClientesDesdeMenu() {
  mostrarToast(instalarRevisionAutomaticaBaseClientes());
}

function eliminarRevisionAutomaticaBaseClientesDesdeMenu() {
  mostrarToast(eliminarRevisionAutomaticaBaseClientes());
}

function getSpreadsheet() {
  var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (sheetId) return SpreadsheetApp.openById(sheetId);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function setupInicial() {
  ensureSheets();
  ensureHeaders();
  if (typeof actualizarCatalogoPreguntas === "function") {
    try { actualizarCatalogoPreguntas(); } catch (e) { Logger.log(e); }
  }
  actualizarHojasTMK();
  return "Planilla preparada: Solicitudes + TMK listas. Ya no se usa Base_Clientes ni Seguimiento_CC.";
}

function ensureSheets() {
  var ss = getSpreadsheet();
  var required = ["Respuestas_Scoring", "Preguntas", "Log_Seguridad"];

  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    if (!ss.getSheetByName(SOLICITUDES_CONFIG[i].base)) ss.insertSheet(SOLICITUDES_CONFIG[i].base);
    if (!ss.getSheetByName(SOLICITUDES_CONFIG[i].tmk)) ss.insertSheet(SOLICITUDES_CONFIG[i].tmk);
  }

  for (var v = 0; v < TMK_VIEW_SHEETS.length; v++) {
    if (!ss.getSheetByName(TMK_VIEW_SHEETS[v].name)) ss.insertSheet(TMK_VIEW_SHEETS[v].name);
  }

  for (var j = 0; j < required.length; j++) {
    if (!ss.getSheetByName(required[j])) ss.insertSheet(required[j]);
  }
}

function ensureHeaders() {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    var sh = getSheet(SOLICITUDES_CONFIG[i].base);
    prepararEncabezadosSolicitud_(sh);
    asegurarHeadersLinksSolicitud_(sh);

    var tmk = getSheet(SOLICITUDES_CONFIG[i].tmk);
    ensureHeadersPresent_(tmk, HEADERS_TMK);
  }

  for (var v = 0; v < TMK_VIEW_SHEETS.length; v++) {
    ensureHeadersPresent_(getSheet(TMK_VIEW_SHEETS[v].name), HEADERS_TMK);
  }

  ensureHeadersPresent_(getSheet("Respuestas_Scoring"), HEADERS_RESPUESTAS_SCORING);
  ensureHeadersPresent_(getSheet("Preguntas"), ["Codigo", "Bloque", "Orden", "Pregunta", "Tipo", "Opciones", "Obligatoria", "Condicion", "Columna_respuesta", "Activa"]);
  ensureHeadersPresent_(getSheet("Log_Seguridad"), ["Fecha", "Token", "DNI_HASH", "Resultado", "Detalle", "Origen"]);
  formatearSolicitudes_();
  formatearHojasTMK_();
  formatearVistasTMK_();
}

function prepararEncabezadosSolicitud_(sheet) {
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, HEADERS_SOLICITUDES_MODELO.length).setValues([HEADERS_SOLICITUDES_MODELO]);
  }
  sheet.setFrozenRows(1);
}

function asegurarHeadersLinksSolicitud_(sheet) {
  sheet.getRange(1, COL_INICIO_LINKS, 1, HEADERS_LINKS_SOLICITUDES.length).setValues([HEADERS_LINKS_SOLICITUDES]);
  sheet.getRange(1, COL_INICIO_LINKS, 1, HEADERS_LINKS_SOLICITUDES.length)
    .setFontWeight("bold")
    .setBackground("#e0f2fe")
    .setHorizontalAlignment("center");
}

function ensureHeadersPresent_(sheet, headers) {
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#eef2f7");
    return;
  }

  var current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  var existing = {};
  for (var i = 0; i < current.length; i++) {
    if (current[i]) existing[current[i].toString().trim()] = true;
  }

  var missing = [];
  for (var j = 0; j < headers.length; j++) {
    if (!existing[headers[j]]) missing.push(headers[j]);
  }

  if (missing.length > 0) {
    sheet.getRange(1, sheet.getLastColumn() + 1, 1, missing.length).setValues([missing]);
  }

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold").setBackground("#eef2f7");
}

function ensureHeadersPresent(sheetName, headers) {
  return ensureHeadersPresent_(getSheet(sheetName), headers);
}


function cargarVendedoresDefault_() {
  return;
}

function normalizarHeader_(texto) {
  if (texto === null || texto === undefined) return "";
  var s = texto.toString().trim().toUpperCase();
  try {
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch (e) {}
  s = s.replace(/\s+/g, " ");
  s = s.replace(/[º°]/g, "°");
  return s;
}

function getHeaderMapFlexible_(sheet) {
  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var exact = {};
  var normalized = {};
  for (var i = 0; i < headers.length; i++) {
    if (!headers[i]) continue;
    var raw = headers[i].toString().trim();
    exact[raw] = i + 1;
    normalized[normalizarHeader_(raw)] = i + 1;
  }
  return { exact: exact, normalized: normalized, headers: headers };
}

function getCol_(headerMap, aliases) {
  if (!aliases) return 0;
  if (typeof aliases === "string") aliases = [aliases];
  for (var i = 0; i < aliases.length; i++) {
    var a = aliases[i];
    if (headerMap.exact[a]) return headerMap.exact[a];
    var n = normalizarHeader_(a);
    if (headerMap.normalized[n]) return headerMap.normalized[n];
  }
  return 0;
}

function getVal_(rowValues, headerMap, aliases) {
  var col = getCol_(headerMap, aliases);
  if (!col) return "";
  return rowValues[col - 1];
}

function setVal_(sheet, rowIndex, headerMap, aliases, value) {
  var col = getCol_(headerMap, aliases);
  if (!col) return false;
  sheet.getRange(rowIndex, col).setValue(value);
  return true;
}

function normalizarDni(dni) {
  if (!dni) return "";
  return dni.toString().replace(/\D/g, "");
}

function generarHash(valor) {
  var salt = PropertiesService.getScriptProperties().getProperty("DNI_SALT");
  if (!salt) throw new Error("Falta configurar DNI_SALT en Script Properties.");

  var rawHash = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_256,
    normalizarDni(valor),
    salt
  );

  var hash = "";
  for (var i = 0; i < rawHash.length; i++) {
    var byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    var byteString = byteVal.toString(16);
    if (byteString.length === 1) byteString = "0" + byteString;
    hash += byteString;
  }
  return hash;
}

function generarHashDniParaCarga(dni) {
  return generarHash(dni);
}

function normalizarNetlifyBaseUrl() {
  var raw = PropertiesService.getScriptProperties().getProperty("NETLIFY_BASE_URL");
  if (!raw) throw new Error("NETLIFY_BASE_URL no esta configurado en Script Properties.");

  var url = raw.toString().trim();
  url = url.replace(/\/+$/, "");
  url = url.replace(/\?.*$/, "");

  if (!/^https:\/\//i.test(url)) throw new Error("NETLIFY_BASE_URL invalido: debe comenzar con https:// y hoy vale: " + url);
  return url + "/";
}

function construirTextoBotonEncuesta() {
  return "Abrir encuesta";
}

function setCeldaLinkEncuesta(sheet, rowIndex, colIndex, url) {
  var richText = SpreadsheetApp.newRichTextValue()
    .setText(construirTextoBotonEncuesta())
    .setLinkUrl(url)
    .build();
  sheet.getRange(rowIndex, colIndex).setRichTextValue(richText);
}

function construirTextoBotonWhatsApp(nombreCompleto) {
  if (!nombreCompleto) return "Enviar WhatsApp";
  var nombre = nombreCompleto.toString().trim().split(/\s+/)[0];
  return "Enviar WPP a " + nombre;
}

function setCeldaLinkWhatsApp(sheet, rowIndex, colIndex, url, nombreCompleto) {
  var richText = SpreadsheetApp.newRichTextValue()
    .setText(construirTextoBotonWhatsApp(nombreCompleto))
    .setLinkUrl(url)
    .build();
  sheet.getRange(rowIndex, colIndex).setRichTextValue(richText);
}

function normalizarTelefonoWhatsapp_(telefono) {
  if (!telefono) return "";
  var n = telefono.toString().replace(/\D/g, "");
  if (!n) return "";

  while (n.charAt(0) === "0") n = n.substring(1);

  // Si viene como 388xxxxxxx o 11xxxxxxxx, agregamos 549.
  if (n.length === 10) return "549" + n;

  // Si viene con 0 adelante y quedo en 10, ya se resolvio arriba.
  // Si viene como 54 + numero movil sin 9, agregamos 9 despues del 54.
  if (n.indexOf("54") === 0 && n.indexOf("549") !== 0) {
    return "549" + n.substring(2);
  }

  // Si ya viene como 549..., lo dejamos.
  if (n.indexOf("549") === 0) return n;

  // Fallback Argentina.
  if (n.length >= 8 && n.length <= 11) return "549" + n;
  return n;
}

function construirMensajeWhatsApp_(nombre, linkEncuesta) {
  return "Hola, Sr./Sra. " + nombre + ". Mi nombre es " + NOMBRE_CONTACT + ", me comunico desde Autosol.\n\n" +
    "Le compartimos el link para realizar la validacion de su suscripcion al Plan de Ahorro:\n\n" +
    linkEncuesta + "\n\n" +
    "La encuesta es breve y nos permite confirmar que la informacion de su plan fue correctamente explicada y registrada. Para ingresar, debera colocar su DNI unicamente como validacion de identidad.\n\n" +
    "Muchas gracias. Saludos cordiales.";
}

function crearLinkWhatsApp_(telefono, nombre, linkEncuesta) {
  var tel = normalizarTelefonoWhatsapp_(telefono);
  if (!tel || !linkEncuesta) return "";
  return "https://wa.me/" + tel + "?text=" + encodeURIComponent(construirMensajeWhatsApp_(nombre, linkEncuesta));
}

function getConfigPorBase_(baseName) {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    if (SOLICITUDES_CONFIG[i].base === baseName) return SOLICITUDES_CONFIG[i];
  }
  return null;
}

function buscarFilaPorToken(token) {
  if (!token) return null;
  ensureSheets();
  ensureHeaders();

  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var config = SOLICITUDES_CONFIG[c];
    var sheet = getSheet(config.base);
    var headerMap = getHeaderMapFlexible_(sheet);
    var tokenCol = getCol_(headerMap, ALIASES.TOKEN);
    if (!tokenCol || sheet.getLastRow() < 2) continue;

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    for (var i = 0; i < data.length; i++) {
      var rowToken = data[i][tokenCol - 1];
      if (rowToken && rowToken.toString().trim() === token.toString().trim()) {
        return {
          rowIndex: i + 2,
          values: data[i],
          headerMap: headerMap,
          sheet: sheet,
          baseName: config.base,
          tmkName: config.tmk,
          sucursal: config.sucursal
        };
      }
    }
  }
  return null;
}

function doPost(e) {
  try {
    ensureSheets();
    ensureHeaders();
    if (typeof ensureQuestionCatalogSeeded === "function") {
      try { ensureQuestionCatalogSeeded(); } catch (seedErr) { Logger.log(seedErr); }
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var backendSecret = payload.backendSecret;

    var correctSecret = PropertiesService.getScriptProperties().getProperty("BACKEND_SECRET");
    if (!correctSecret || backendSecret !== correctSecret) {
      return jsonResponse({ status: "ERROR", message: "No autorizado. Credenciales de backend incorrectas." });
    }

    if (action === "validarCliente") return validarCliente(payload.token, payload.dni);
    if (action === "guardarEncuesta") return guardarEncuesta(payload.token, payload.dni, payload.respuestas);

    return jsonResponse({ status: "ERROR", message: "Accion no reconocida." });
  } catch (err) {
    registrarLog("SYSTEM", "", "ERROR", err.toString(), "Apps Script - doPost");
    return jsonResponse({ status: "ERROR", message: "Excepcion en servidor: " + err.toString() });
  }
}

function validarCliente(token, dni) {
  var dniHashInput = generarHash(dni);
  var rowData = buscarFilaPorToken(token);

  if (!rowData) {
    registrarLog(token, dniHashInput, "TOKEN_INVALIDO", "Token no encontrado en SOLICITUDES JUJUY/SALTA", "validarCliente");
    return jsonResponse({ status: "TOKEN_INVALIDO" });
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var dniHashSheet = getVal_(rowValues, headerMap, ALIASES.DNI_HASH);
  var estadoEncuesta = getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA);

  if (estadoEncuesta === "Respondido") {
    registrarLog(token, dniHashInput, "YA_RESPONDIO", "El cliente ya habia completado la encuesta", "validarCliente");
    return jsonResponse({ status: "YA_RESPONDIO" });
  }

  var dniHashSheetStr = dniHashSheet ? dniHashSheet.toString().trim() : "";
  var esValido = (dniHashInput === dniHashSheetStr) || (normalizarDni(dni) === normalizarDni(dniHashSheetStr));

  if (!esValido) {
    registrarLog(token, dniHashInput, "DNI_INVALIDO", "DNI no coincide con DNI_HASH guardado", "validarCliente");
    return jsonResponse({ status: "DNI_INVALIDO" });
  }

  var clienteSeguro = {
    nombre: getVal_(rowValues, headerMap, ALIASES.NOMBRE),
    modelo: getVal_(rowValues, headerMap, ALIASES.MODELO),
    asesor: getVal_(rowValues, headerMap, ALIASES.VENDEDOR),
    montoCuota2: getVal_(rowValues, headerMap, ALIASES.CUOTA_2),
    medioPagoPrevisto: getVal_(rowValues, headerMap, ALIASES.TIPO_PAGO)
  };

  registrarLog(token, dniHashInput, "OK", "Cliente validado desde " + rowData.baseName, "validarCliente");
  return jsonResponse({
    status: "OK",
    cliente: clienteSeguro
  });
}

function guardarEncuesta(token, dni, respuestas) {
  var dniHashInput = generarHash(dni);
  var rowData = buscarFilaPorToken(token);
  if (!rowData) {
    registrarLog(token, dniHashInput, "TOKEN_INVALIDO", "Token inexistente al intentar guardar", "guardarEncuesta");
    return jsonResponse({ status: "TOKEN_INVALIDO" });
  }
  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var dniHashSheet = getVal_(rowValues, headerMap, ALIASES.DNI_HASH);
  var estadoEncuesta = getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA);
  if (estadoEncuesta === "Respondido") {
    registrarLog(token, dniHashInput, "YA_RESPONDIO", "Encuesta duplicada rechazada al guardar", "guardarEncuesta");
    return jsonResponse({ status: "YA_RESPONDIO" });
  }
  var dniHashSheetStr = dniHashSheet ? dniHashSheet.toString().trim() : "";
  var esValido = (dniHashInput === dniHashSheetStr) || (normalizarDni(dni) === normalizarDni(dniHashSheetStr));
  if (!esValido) {
    registrarLog(token, dniHashInput, "DNI_INVALIDO", "DNI incorrecto al intentar guardar", "guardarEncuesta");
    return jsonResponse({ status: "DNI_INVALIDO" });
  }
  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoring(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoring_(rowData, scoring, "WEB");
  volcarRespuestaEnTMK_(rowData, respuestas, scoring, "WEB");
  actualizarVistasTMK_();
  registrarLog(token, dniHashInput, "OK", "Encuesta procesada: " + scoring.resultado, "guardarEncuesta");
  return jsonResponse({ status: "OK", scoringResult: scoring.resultado });
}

function construirClienteInfoDesdeRowData_(rowData) {
  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  return {
    idCliente: getVal_(rowValues, headerMap, ALIASES.ID_CLIENTE),
    nombre: getVal_(rowValues, headerMap, ALIASES.NOMBRE),
    modelo: getVal_(rowValues, headerMap, ALIASES.MODELO),
    asesor: getVal_(rowValues, headerMap, ALIASES.VENDEDOR),
    montoCuota2Base: getVal_(rowValues, headerMap, ALIASES.CUOTA_2),
    token: getVal_(rowValues, headerMap, ALIASES.TOKEN),
    dniHash: getVal_(rowValues, headerMap, ALIASES.DNI_HASH)
  };
}

function guardarRespuestaScoring(cliente, respuestas, scoring) {
  ensureHeaders();
  var sheet = getSheet("Respuestas_Scoring");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = [];
  var idRespuesta = "R-" + Utilities.getUuid().slice(0, 8).toUpperCase();
  var fechaActual = new Date();

  for (var i = 0; i < headers.length; i++) {
    var h = headers[i];
    var val = "";
    switch (h) {
      case "ID_RESPUESTA": val = idRespuesta; break;
      case "ID_CLIENTE": val = cliente.idCliente; break;
      case "TOKEN_HASH": val = cliente.token; break;
      case "DNI_HASH": val = cliente.dniHash; break;
      case "Fecha respuesta": val = fechaActual; break;
      case "Nombre y Apellido": val = cliente.nombre; break;
      case "Modelo suscripto": val = cliente.modelo; break;
      case "Nombre del Asesor": val = cliente.asesor; break;
      case "Monto_2da_cuota_base": val = cliente.montoCuota2Base; break;
      case "Q1_Conocia_plan_exclusivo": val = respuestas.q1; break;
      case "Q2_Informaron_licitacion_cuota_2": val = respuestas.q2; break;
      case "Q3_Informaron_adjudicacion_asegurada": val = respuestas.q3; break;
      case "Q4_Informaron_monto_cuota_2": val = respuestas.q4; break;
      case "Q4A_Monto_estimado_cuota_2": val = respuestas.q4a || ""; break;
      case "Q5_Monto_primera_cuota": val = respuestas.q5; break;
      case "Q5A_Acepto_debito_automatico": val = respuestas.q5a; break;
      case "Q5B_Fecha_pago_primera_cuota": val = respuestas.q5b; break;
      case "Q6_Quien_es_vendedor": val = respuestas.q6; break;
      case "Q7_Tuvo_otro_plan_reciente": val = respuestas.q7; break;
      case "Q7A_Detalle_otro_plan": val = respuestas.q7a || ""; break;
      case "Q8_Como_conocio_propuesta": val = respuestas.q8; break;
      case "Q9_Necesita_recontacto": val = respuestas.q9; break;
      case "Q10_Observaciones_cliente": val = respuestas.q10 || ""; break;
      case "RESULTADO_SCORING": val = scoring.resultado; break;
      case "MOTIVO_RESULTADO": val = scoring.motivo; break;
      case "REQUIERE_RECONTACTO": val = scoring.requiereRecontacto; break;
      case "AREA_A_REVISAR": val = scoring.area; break;
      case "OBSERVACION_INTERNA": val = scoring.observacion; break;
      default: val = "";
    }
    newRow.push(val);
  }

  sheet.appendRow(newRow);
}

function procesarNuevosIngresos() {
  var resultado = generarLinksInterno();
  var sync = actualizarHojasTMK();
  if (resultado.error) return "Error: " + resultado.error;

  var msg = "Links nuevos generados: " + resultado.count + ".";
  if (resultado.skippedNoDni > 0) msg += " Filas sin DNI omitidas: " + resultado.skippedNoDni + ".";
  msg += " " + sync;
  return msg;
}

function generarLinks() {
  return procesarNuevosIngresos();
}

function generarLinksInterno() {
  ensureSheets();
  ensureHeaders();

  var netlifyBaseUrl;
  try {
    netlifyBaseUrl = normalizarNetlifyBaseUrl();
  } catch (error) {
    return { error: error.message, count: 0, skippedNoDni: 0 };
  }

  var total = 0;
  var skippedNoDni = 0;

  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var config = SOLICITUDES_CONFIG[c];
    var sheet = getSheet(config.base);
    asegurarHeadersLinksSolicitud_(sheet);

    var headerMap = getHeaderMapFlexible_(sheet);
    if (sheet.getLastRow() < 2) continue;

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

    for (var i = 0; i < data.length; i++) {
      var rowIndex = i + 2;
      var row = data[i];

      var nombre = getVal_(row, headerMap, ALIASES.NOMBRE);
      var telefono = getVal_(row, headerMap, ALIASES.TELEFONO);
      var dni = getVal_(row, headerMap, ALIASES.DNI);
      var dniHashExistente = getVal_(row, headerMap, ALIASES.DNI_HASH);
      var tokenExistente = getVal_(row, headerMap, ALIASES.TOKEN);
      var linkExistente = getVal_(row, headerMap, ALIASES.LINK_ENCUESTA);
      var solicitud = getVal_(row, headerMap, ALIASES.SOLICITUD);

      if (!nombre || !telefono) continue;
      if (tokenExistente && linkExistente) continue;

      if (!dni && !dniHashExistente) {
        skippedNoDni++;
        continue;
      }

      var token = tokenExistente || ("T" + Utilities.getUuid().slice(0, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000));
      var link = netlifyBaseUrl + "?t=" + token;
      var idCliente = construirIdCliente_(config.sucursal, solicitud, dni);
      var dniHash = dniHashExistente || generarHashDniParaCarga(dni);
      var waLink = crearLinkWhatsApp_(telefono, nombre, link);

      setVal_(sheet, rowIndex, headerMap, ALIASES.ID_CLIENTE, idCliente);
      setVal_(sheet, rowIndex, headerMap, ALIASES.TOKEN, token);
      setVal_(sheet, rowIndex, headerMap, ALIASES.DNI_HASH, dniHash);
      setCeldaLinkEncuesta(sheet, rowIndex, getCol_(headerMap, ALIASES.LINK_ENCUESTA), link);
      if (waLink) setCeldaLinkWhatsApp(sheet, rowIndex, getCol_(headerMap, ALIASES.ENVIAR_WPP), waLink, nombre);
      setVal_(sheet, rowIndex, headerMap, ALIASES.ESTADO_ENCUESTA, "Link generado");
      setVal_(sheet, rowIndex, headerMap, ALIASES.FECHA_ENVIO_LINK, new Date());

      total++;
    }
  }

  return { error: "", count: total, skippedNoDni: skippedNoDni };
}

function construirIdCliente_(sucursal, solicitud, dni) {
  var s = solicitud ? solicitud.toString().replace(/\D/g, "") : "";
  if (s) return sucursal + "-SOL-" + s;
  var d = normalizarDni(dni);
  if (d) return sucursal + "-DNI-" + d;
  return sucursal + "-CLI-" + Utilities.getUuid().slice(0, 8).toUpperCase();
}

function regenerarLinksExistentes() {
  ensureSheets();
  ensureHeaders();

  var netlifyBaseUrl;
  try {
    netlifyBaseUrl = normalizarNetlifyBaseUrl();
  } catch (error) {
    return "Error: " + error.message;
  }

  var count = 0;
  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var config = SOLICITUDES_CONFIG[c];
    var sheet = getSheet(config.base);
    var headerMap = getHeaderMapFlexible_(sheet);
    if (sheet.getLastRow() < 2) continue;

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    for (var i = 0; i < data.length; i++) {
      var rowIndex = i + 2;
      var row = data[i];
      var token = getVal_(row, headerMap, ALIASES.TOKEN);
      if (!token) continue;

      var nombre = getVal_(row, headerMap, ALIASES.NOMBRE);
      var telefono = getVal_(row, headerMap, ALIASES.TELEFONO);
      var link = netlifyBaseUrl + "?t=" + token;
      var waLink = crearLinkWhatsApp_(telefono, nombre, link);

      setCeldaLinkEncuesta(sheet, rowIndex, getCol_(headerMap, ALIASES.LINK_ENCUESTA), link);
      if (waLink) setCeldaLinkWhatsApp(sheet, rowIndex, getCol_(headerMap, ALIASES.ENVIAR_WPP), waLink, nombre);
      count++;
    }
  }

  actualizarHojasTMK();
  return "Se repararon " + count + " links y botones de WhatsApp. TMK actualizado.";
}

function actualizarHojasTMK() {
  ensureSheets();
  ensureHeaders();
  var total = 0;
  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    total += sincronizarTMKDesdeSolicitud_(SOLICITUDES_CONFIG[c]);
  }
  var vistas = actualizarVistasTMK_();
  formatearHojasTMK_();
  return "TMK actualizado. Filas sincronizadas: " + total + ". " + vistas;
}

function actualizarVistasTMK_() {
  ensureSheets();
  ensureHeaders();
  var rows = getAllTmkRows_();
  var mensajes = [];
  for (var i = 0; i < TMK_VIEW_SHEETS.length; i++) {
    var view = TMK_VIEW_SHEETS[i];
    var count = sincronizarVistaTMK_(getSheet(view.name), rows, view.mode);
    mensajes.push(view.name + ": " + count);
  }
  formatearVistasTMK_();
  return "Vistas actualizadas. " + mensajes.join(" | ");
}

function getAllTmkRows_() {
  var rows = [];
  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var sheet = getSheet(SOLICITUDES_CONFIG[c].tmk);
    var map = getHeaderMapFlexible_(sheet);
    if (sheet.getLastRow() < 2) continue;
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    for (var i = 0; i < data.length; i++) {
      rows.push({ sheet: sheet, map: map, rowIndex: i + 2, values: data[i] });
    }
  }
  return rows;
}

function sincronizarVistaTMK_(viewSheet, rows, mode) {
  ensureHeadersPresent_(viewSheet, HEADERS_TMK);
  limpiarDatosTMK_(viewSheet);
  var output = [];
  var pairs = [];
  for (var i = 0; i < rows.length; i++) {
    if (!rowMatchesView_(rows[i].values, rows[i].map, mode)) continue;
    var rowOut = [];
    for (var h = 0; h < HEADERS_TMK.length; h++) {
      rowOut.push(getVal_(rows[i].values, rows[i].map, HEADERS_TMK[h]));
    }
    output.push(rowOut);
    pairs.push({ sourceSheet: rows[i].sheet, sourceRow: rows[i].rowIndex, targetRow: output.length + 1 });
  }
  if (output.length > 0) {
    viewSheet.getRange(2, 1, output.length, HEADERS_TMK.length).setValues(output);
    var mapView = getHeaderMapFlexible_(viewSheet);
    var colEncuesta = getCol_(mapView, "LINK_ENCUESTA");
    var colWpp = getCol_(mapView, "ENVIAR WPP");
    for (var p = 0; p < pairs.length; p++) {
      if (colEncuesta) {
        var rt1 = pairs[p].sourceSheet.getRange(pairs[p].sourceRow, colEncuesta).getRichTextValue();
        if (rt1 && rt1.getLinkUrl()) viewSheet.getRange(pairs[p].targetRow, colEncuesta).setRichTextValue(rt1);
      }
      if (colWpp) {
        var rt2 = pairs[p].sourceSheet.getRange(pairs[p].sourceRow, colWpp).getRichTextValue();
        if (rt2 && rt2.getLinkUrl()) viewSheet.getRange(pairs[p].targetRow, colWpp).setRichTextValue(rt2);
      }
    }
  }
  return output.length;
}

function rowMatchesView_(row, map, mode) {
  var decision = String(getVal_(row, map, "DECISION_FINAL") || "").toUpperCase().trim();
  var recontacto = String(getVal_(row, map, "REQUIERE_RECONTACTO") || "").toUpperCase().trim();
  var estado = String(getVal_(row, map, "ESTADO_TMK") || "").toUpperCase().trim();
  if (mode === "RECHAZADOS") return decision === "RECHAZADO";
  if (mode === "REVISAR") return decision === "REVISAR" || recontacto === "SI" || estado === "RECONTACTAR" || estado === "REVISAR";
  return false;
}

function sincronizarTMKDesdeSolicitud_(config) {
  var baseSheet = getSheet(config.base);
  var tmkSheet = getSheet(config.tmk);
  ensureHeadersPresent_(tmkSheet, HEADERS_TMK);

  var baseMap = getHeaderMapFlexible_(baseSheet);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);

  var existingByKey = cargarFilasExistentesTMK_(tmkSheet, tmkMap);

  if (baseSheet.getLastRow() < 2) {
    limpiarDatosTMK_(tmkSheet);
    return 0;
  }

  var baseData = baseSheet.getRange(2, 1, baseSheet.getLastRow() - 1, baseSheet.getLastColumn()).getValues();
  var output = [];
  var richPairs = [];

  for (var i = 0; i < baseData.length; i++) {
    var row = baseData[i];
    var nombre = getVal_(row, baseMap, ALIASES.NOMBRE);
    var telefono = getVal_(row, baseMap, ALIASES.TELEFONO);
    if (!nombre && !telefono) continue;

    var id = getVal_(row, baseMap, ALIASES.ID_CLIENTE);
    var token = getVal_(row, baseMap, ALIASES.TOKEN);
    var key = id || token || (config.sucursal + "-ROW-" + (i + 2));
    var existing = existingByKey[key] || {};

    var newRow = construirFilaTMK_(config, row, baseMap, existing);
    output.push(newRow);
    richPairs.push({ baseRow: i + 2, tmkRow: output.length + 1 });
  }

  limpiarDatosTMK_(tmkSheet);
  if (output.length > 0) {
    tmkSheet.getRange(2, 1, output.length, HEADERS_TMK.length).setValues(output);

    // Restaurar rich text de links y WhatsApp desde SOLICITUDES.
    var tmkMapFinal = getHeaderMapFlexible_(tmkSheet);
    var colEncuestaTMK = getCol_(tmkMapFinal, "LINK_ENCUESTA");
    var colWppTMK = getCol_(tmkMapFinal, "ENVIAR WPP");
    var colEncuestaBase = getCol_(baseMap, ALIASES.LINK_ENCUESTA);
    var colWppBase = getCol_(baseMap, ALIASES.ENVIAR_WPP);

    for (var r = 0; r < richPairs.length; r++) {
      var pair = richPairs[r];
      if (colEncuestaBase && colEncuestaTMK) {
        var rtEncuesta = baseSheet.getRange(pair.baseRow, colEncuestaBase).getRichTextValue();
        if (rtEncuesta && rtEncuesta.getLinkUrl()) tmkSheet.getRange(pair.tmkRow, colEncuestaTMK).setRichTextValue(rtEncuesta);
      }
      if (colWppBase && colWppTMK) {
        var rtWpp = baseSheet.getRange(pair.baseRow, colWppBase).getRichTextValue();
        if (rtWpp && rtWpp.getLinkUrl()) tmkSheet.getRange(pair.tmkRow, colWppTMK).setRichTextValue(rtWpp);
      }
    }
  }

  return output.length;
}

function cargarFilasExistentesTMK_(sheet, headerMap) {
  var out = {};
  if (sheet.getLastRow() < 2) return out;

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var id = getVal_(row, headerMap, "ID_CLIENTE");
    var token = getVal_(row, headerMap, "TOKEN");
    var key = id || token;
    if (!key) continue;

    var obj = {};
    for (var h = 0; h < HEADERS_TMK.length; h++) {
      var col = getCol_(headerMap, HEADERS_TMK[h]);
      obj[HEADERS_TMK[h]] = col ? row[col - 1] : "";
    }
    out[key] = obj;
  }
  return out;
}

function limpiarDatosTMK_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, Math.max(sheet.getLastColumn(), HEADERS_TMK.length)).clearContent();
}

function construirFilaTMK_(config, baseRow, baseMap, existing) {
  var row = [];
  for (var i = 0; i < HEADERS_TMK.length; i++) {
    var h = HEADERS_TMK[i];
    var val = "";
    switch (h) {
      case "SUCURSAL": val = config.sucursal; break;
      case "MES": val = getVal_(baseRow, baseMap, ALIASES.MES); break;
      case "Nº": val = getVal_(baseRow, baseMap, ALIASES.NRO); break;
      case "FECHA": val = getVal_(baseRow, baseMap, ALIASES.FECHA); break;
      case "NOMBRE Y APELLIDO": val = getVal_(baseRow, baseMap, ALIASES.NOMBRE); break;
      case "DNI": val = getVal_(baseRow, baseMap, ALIASES.DNI); break;
      case "MAIL": val = getVal_(baseRow, baseMap, ALIASES.MAIL); break;
      case "TELEFONO": val = getVal_(baseRow, baseMap, ALIASES.TELEFONO); break;
      case "Modelo suscripto/ plan": val = getVal_(baseRow, baseMap, ALIASES.MODELO); break;
      case "TIPO DE PAGO": val = getVal_(baseRow, baseMap, ALIASES.TIPO_PAGO); break;
      case "N° DE SOLICITUD": val = getVal_(baseRow, baseMap, ALIASES.SOLICITUD); break;
      case "N° DE CLIENTE": val = getVal_(baseRow, baseMap, ALIASES.NRO_CLIENTE); break;
      case "CUOTA 2": val = getVal_(baseRow, baseMap, ALIASES.CUOTA_2); break;
      case "NOMBRE DEL VENDEDOR": val = getVal_(baseRow, baseMap, ALIASES.VENDEDOR); break;
      case "ID_CLIENTE": val = getVal_(baseRow, baseMap, ALIASES.ID_CLIENTE); break;
      case "TOKEN": val = getVal_(baseRow, baseMap, ALIASES.TOKEN); break;
      case "DNI_HASH": val = getVal_(baseRow, baseMap, ALIASES.DNI_HASH); break;
      case "LINK_ENCUESTA": val = construirTextoBotonEncuesta(); break;
      case "ENVIAR WPP": val = construirTextoBotonWhatsApp(getVal_(baseRow, baseMap, ALIASES.NOMBRE)); break;
      case "ESTADO_ENCUESTA": val = getVal_(baseRow, baseMap, ALIASES.ESTADO_ENCUESTA); break;
      case "FECHA_ENVIO_LINK": val = getVal_(baseRow, baseMap, ALIASES.FECHA_ENVIO_LINK); break;
      case "DECISION_FINAL": val = existing[h] || "PENDIENTE"; break;
      case "ESTADO_TMK": val = existing[h] || estadoTmkDefaultDesdeBase_(baseRow, baseMap); break;
      case "PROXIMA_ACCION": val = existing[h] || proximaAccionDefaultDesdeBase_(baseRow, baseMap); break;
      case "PRIORIDAD": val = existing[h] || "Media"; break;
      case "FECHA_PROXIMO_CONTACTO": val = existing[h] || ""; break;
      case "FECHA_ULTIMO_ENVIO_WPP": val = existing[h] || ""; break;
      case "CANTIDAD_INTENTOS_WPP": val = existing[h] || 0; break;
      case "ULTIMO_CONTACTO_TMK": val = existing[h] || ""; break;
      default: val = existing[h] || "";
    }
    row.push(val);
  }
  return row;
}

function actualizarSolicitudConScoring_(rowData, scoring, canal) {
  var sheet = rowData.sheet;
  var headerMap = getHeaderMapFlexible_(sheet);
  setVal_(sheet, rowData.rowIndex, headerMap, ALIASES.ESTADO_ENCUESTA, canal === "WEB" ? "Respondido" : "Scoring telefonico");
}

function estadoTmkDefaultDesdeBase_(baseRow, baseMap) {
  var estadoEncuesta = String(getVal_(baseRow, baseMap, ALIASES.ESTADO_ENCUESTA) || "");
  if (estadoEncuesta === "Respondido") return "Respondido web";
  if (estadoEncuesta === "Scoring telefonico") return "Cerrado";
  if (estadoEncuesta === "Link generado") return "Pendiente envio";
  return "Nuevo";
}

function proximaAccionDefaultDesdeBase_(baseRow, baseMap) {
  var estadoEncuesta = String(getVal_(baseRow, baseMap, ALIASES.ESTADO_ENCUESTA) || "");
  if (estadoEncuesta === "Respondido") return "Cerrar";
  if (estadoEncuesta === "Link generado") return "Enviar WPP";
  return "Generar link";
}

function estadoTmkDesdeResultado_(resultado, canal) {
  if (resultado === "Paso scoring") return "Cerrado";
  if (resultado === "No paso scoring") return "Rechazado";
  if (resultado === "Requiere revision") return "Revisar";
  if (resultado === "Requiere recontacto") return "Recontactar";
  return canal === "WEB" ? "Respondido web" : "Llamar";
}

function proximaAccionDesdeResultado_(resultado) {
  if (resultado === "Paso scoring") return "Cerrar";
  if (resultado === "No paso scoring") return "Revisar rechazo";
  if (resultado === "Requiere revision") return "Recontactar";
  if (resultado === "Requiere recontacto") return "Recontactar";
  return "Esperar respuesta";
}

function prioridadDesdeResultado_(resultado, requiereRecontacto) {
  if (resultado === "No paso scoring") return "Alta";
  if (resultado === "Requiere revision" || resultado === "Requiere recontacto") return "Alta";
  if (String(requiereRecontacto || "").toUpperCase() === "SI") return "Alta";
  if (resultado === "Paso scoring") return "Baja";
  return "Media";
}

function decisionDesdeScoring_(resultado) {
  if (resultado === "Paso scoring") return "ACEPTADO";
  if (resultado === "No paso scoring") return "RECHAZADO";
  if (resultado === "Requiere revision" || resultado === "Requiere recontacto") return "REVISAR";
  return "PENDIENTE";
}

function volcarRespuestaEnTMK_(rowData, respuestas, scoring, canal) {
  actualizarHojasTMK();

  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var targetRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap,
    getVal_(rowData.values, rowData.headerMap, ALIASES.ID_CLIENTE),
    getVal_(rowData.values, rowData.headerMap, ALIASES.TOKEN)
  );
  if (!targetRow) return;

  escribirRespuestasEnFilaTMK_(tmkSheet, targetRow, tmkMap, respuestas, scoring, canal);
  formatearHojasTMK_();
}

function buscarFilaTMKPorIdToken_(sheet, headerMap, idCliente, token) {
  if (sheet.getLastRow() < 2) return 0;
  var idCol = getCol_(headerMap, "ID_CLIENTE");
  var tokenCol = getCol_(headerMap, "TOKEN");
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (var i = 0; i < data.length; i++) {
    var rowId = idCol ? data[i][idCol - 1] : "";
    var rowToken = tokenCol ? data[i][tokenCol - 1] : "";
    if ((idCliente && rowId == idCliente) || (token && rowToken == token)) return i + 2;
  }
  return 0;
}

function escribirRespuestasEnFilaTMK_(sheet, rowIndex, headerMap, respuestas, scoring, canal) {
  var m = {
    "Q1_Conocia_plan_exclusivo": respuestas.q1,
    "Q2_Informaron_licitacion_cuota_2": respuestas.q2,
    "Q3_Informaron_adjudicacion_asegurada": respuestas.q3,
    "Q4_Informaron_monto_cuota_2": respuestas.q4,
    "Q4A_Monto_estimado_cuota_2": respuestas.q4a || "",
    "Q5_Monto_primera_cuota": respuestas.q5,
    "Q5A_Acepto_debito_automatico": respuestas.q5a,
    "Q5B_Fecha_pago_primera_cuota": respuestas.q5b,
    "Q6_Quien_es_vendedor": respuestas.q6,
    "Q7_Tuvo_otro_plan_reciente": respuestas.q7,
    "Q7A_Detalle_otro_plan": respuestas.q7a || "",
    "Q8_Como_conocio_propuesta": respuestas.q8,
    "Q9_Necesita_recontacto": respuestas.q9,
    "Q10_Observaciones_cliente": respuestas.q10 || "",
    "RESULTADO_SCORING": scoring.resultado,
    "MOTIVO_RESULTADO": scoring.motivo,
    "REQUIERE_RECONTACTO": scoring.requiereRecontacto,
    "AREA_A_REVISAR": scoring.area,
    "OBSERVACION_INTERNA": scoring.observacion,
    "FECHA_REALIZACION_SCORING": new Date(),
    "CANAL_SCORING": canal,
    "DECISION_FINAL": decisionDesdeScoring_(scoring.resultado),
    "MOTIVO_DECISION": scoring.motivo,
    "FECHA_DECISION": new Date(),
    "ESTADO_TMK": estadoTmkDesdeResultado_(scoring.resultado, canal),
    "PROXIMA_ACCION": proximaAccionDesdeResultado_(scoring.resultado),
    "PRIORIDAD": prioridadDesdeResultado_(scoring.resultado, scoring.requiereRecontacto),
    "ULTIMO_CONTACTO_TMK": new Date()
  };
  if (canal === "WEB") m["FECHA_RESPUESTA_WEB"] = new Date();
  for (var key in m) {
    var col = getCol_(headerMap, key);
    if (col) sheet.getRange(rowIndex, col).setValue(m[key]);
  }
}

function procesarScoringTelefonicoTMK() {
  ensureSheets();
  ensureHeaders();
  var procesados = 0;
  var omitidos = 0;
  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var config = SOLICITUDES_CONFIG[c];
    var sheet = getSheet(config.tmk);
    var map = getHeaderMapFlexible_(sheet);
    if (sheet.getLastRow() < 2) continue;
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    for (var i = 0; i < data.length; i++) {
      var rowIndex = i + 2;
      var row = data[i];
      var resultadoExistente = getVal_(row, map, "RESULTADO_SCORING");
      var canalExistente = getVal_(row, map, "CANAL_SCORING");
      if (resultadoExistente) continue;
      var respuestas = buildRespuestasFromTMKRow_(row, map);
      if (!respuestasMinimasCompletas_(respuestas)) { omitidos++; continue; }
      var scoring = calcularScoring(respuestas);
      var clienteInfo = construirClienteInfoDesdeTMK_(row, map);
      guardarRespuestaScoring(clienteInfo, respuestas, scoring);
      escribirRespuestasEnFilaTMK_(sheet, rowIndex, map, respuestas, scoring, canalExistente || "TELEFONICO");
      var sourceRow = buscarSolicitudPorIdToken_(clienteInfo.idCliente, clienteInfo.token);
      if (sourceRow) actualizarSolicitudConScoring_(sourceRow, scoring, "TELEFONICO");
      procesados++;
    }
  }
  actualizarVistasTMK_();
  formatearHojasTMK_();
  return "Scoring telefonico procesado: " + procesados + ". Filas omitidas/incompletas: " + omitidos + ".";
}

function buildRespuestasFromTMKRow_(row, map) {
  return {
    q1: getVal_(row, map, "Q1_Conocia_plan_exclusivo"),
    q2: getVal_(row, map, "Q2_Informaron_licitacion_cuota_2"),
    q3: getVal_(row, map, "Q3_Informaron_adjudicacion_asegurada"),
    q4: getVal_(row, map, "Q4_Informaron_monto_cuota_2"),
    q4a: getVal_(row, map, "Q4A_Monto_estimado_cuota_2"),
    q5: getVal_(row, map, "Q5_Monto_primera_cuota"),
    q5a: getVal_(row, map, "Q5A_Acepto_debito_automatico"),
    q5b: getVal_(row, map, "Q5B_Fecha_pago_primera_cuota"),
    q6: getVal_(row, map, "Q6_Quien_es_vendedor"),
    q7: getVal_(row, map, "Q7_Tuvo_otro_plan_reciente"),
    q7a: getVal_(row, map, "Q7A_Detalle_otro_plan"),
    q8: getVal_(row, map, "Q8_Como_conocio_propuesta"),
    q9: getVal_(row, map, "Q9_Necesita_recontacto"),
    q10: getVal_(row, map, "Q10_Observaciones_cliente")
  };
}

function respuestasMinimasCompletas_(r) {
  if (!(r.q1 && r.q2 && r.q3 && r.q4 && r.q5 && r.q5a && r.q5b && r.q6 && r.q7 && r.q8 && r.q9)) return false;
  if (String(r.q4 || "").toUpperCase() === "SI" && !String(r.q4a || "").trim()) return false;
  if (String(r.q7 || "").toUpperCase() === "SI" && !String(r.q7a || "").trim()) return false;
  if (String(r.q9 || "").toUpperCase() === "SI" && !String(r.q10 || "").trim()) return false;
  return true;
}

function construirClienteInfoDesdeTMK_(row, map) {
  return {
    idCliente: getVal_(row, map, "ID_CLIENTE"),
    nombre: getVal_(row, map, "NOMBRE Y APELLIDO"),
    modelo: getVal_(row, map, "Modelo suscripto/ plan"),
    asesor: getVal_(row, map, "NOMBRE DEL VENDEDOR"),
    montoCuota2Base: getVal_(row, map, "CUOTA 2"),
    token: getVal_(row, map, "TOKEN"),
    dniHash: getVal_(row, map, "DNI_HASH")
  };
}

function buscarSolicitudPorIdToken_(idCliente, token) {
  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var config = SOLICITUDES_CONFIG[c];
    var sheet = getSheet(config.base);
    var map = getHeaderMapFlexible_(sheet);
    if (sheet.getLastRow() < 2) continue;
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var id = getVal_(row, map, ALIASES.ID_CLIENTE);
      var tk = getVal_(row, map, ALIASES.TOKEN);
      if ((idCliente && id == idCliente) || (token && tk == token)) {
        return {
          rowIndex: i + 2,
          values: row,
          headerMap: map,
          sheet: sheet,
          baseName: config.base,
          tmkName: config.tmk,
          sucursal: config.sucursal
        };
      }
    }
  }
  return null;
}

function instalarRevisionAutomaticaBaseClientes() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "automatizacionEncuestasSolicitudes") {
      return "El automatico ya estaba instalado.";
    }
  }

  ScriptApp.newTrigger("automatizacionEncuestasSolicitudes")
    .timeBased()
    .everyMinutes(5)
    .create();

  return "Automatico instalado. Cada 5 minutos revisa Solicitudes, genera links y actualiza TMK.";
}

function eliminarRevisionAutomaticaBaseClientes() {
  var triggers = ScriptApp.getProjectTriggers();
  var eliminados = 0;
  var handlers = {
    "automatizacionEncuestasSolicitudes": true,
    "procesarNuevosIngresos": true
  };

  for (var i = 0; i < triggers.length; i++) {
    if (handlers[triggers[i].getHandlerFunction()]) {
      ScriptApp.deleteTrigger(triggers[i]);
      eliminados++;
    }
  }

  if (eliminados === 0) return "No habia automatico instalado.";
  return "Se eliminaron " + eliminados + " triggers automaticos.";
}

function automatizacionEncuestasSolicitudes() {
  procesarNuevosIngresos();
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function registrarLog(token, dniHash, resultado, detalle, origen) {
  try {
    var sheet = getSheet("Log_Seguridad");
    ensureHeadersPresent_(sheet, ["Fecha", "Token", "DNI_HASH", "Resultado", "Detalle", "Origen"]);
    sheet.appendRow([new Date(), token || "N/A", dniHash || "N/A", resultado, detalle, origen || "Backend"]);
  } catch (err) {
    Logger.log("Error al escribir log de seguridad: " + err.toString());
  }
}

function formatearSolicitudes_() {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    var sheet = getSheet(SOLICITUDES_CONFIG[i].base);
    var expectedLastCol = COL_INICIO_LINKS + HEADERS_LINKS_SOLICITUDES.length - 1;
    var lastRow = Math.max(sheet.getLastRow(), 1);
    var lastCol = Math.max(sheet.getLastColumn(), expectedLastCol);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, lastCol)
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");
    sheet.getRange(1, COL_INICIO_LINKS, 1, HEADERS_LINKS_SOLICITUDES.length).setBackground("#dbeafe");
    if (lastRow > 1) sheet.getRange(2, COL_INICIO_LINKS, lastRow - 1, HEADERS_LINKS_SOLICITUDES.length).setBackground("#eff6ff");
    if (lastCol > expectedLastCol) sheet.hideColumns(expectedLastCol + 1, lastCol - expectedLastCol);
    sheet.setColumnWidth(getCol_(getHeaderMapFlexible_(sheet), ALIASES.LINK_ENCUESTA), 130);
    sheet.setColumnWidth(getCol_(getHeaderMapFlexible_(sheet), ALIASES.ENVIAR_WPP), 160);
  }
}

function formatearHojasTMK_() {
  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var sheet = getSheet(SOLICITUDES_CONFIG[c].tmk);
    var lastRow = Math.max(sheet.getLastRow(), 1);
    var lastCol = Math.max(sheet.getLastColumn(), HEADERS_TMK.length);
    var map = getHeaderMapFlexible_(sheet);
    sheet.setFrozenRows(1);
    sheet.setTabColor(SOLICITUDES_CONFIG[c].sucursal === "JUJUY" ? "#2563eb" : "#16a34a");
    if (sheet.getFilter()) sheet.getFilter().remove();
    sheet.getRange(1, 1, lastRow, lastCol).createFilter();
    sheet.getRange(1, 1, 1, lastCol)
      .setFontWeight("bold")
      .setFontColor("#ffffff")
      .setBackground("#0f172a")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, lastCol).setVerticalAlignment("middle").setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    setWidthIfExists_(sheet, map, "NOMBRE Y APELLIDO", 220);
    setWidthIfExists_(sheet, map, "TELEFONO", 115);
    setWidthIfExists_(sheet, map, "LINK_ENCUESTA", 120);
    setWidthIfExists_(sheet, map, "ENVIAR WPP", 160);
    setWidthIfExists_(sheet, map, "MOTIVO_RESULTADO", 350);
    setWidthIfExists_(sheet, map, "OBSERVACION_INTERNA", 300);
    setWidthIfExists_(sheet, map, "OBSERVACION_TMK", 300);
    setWidthIfExists_(sheet, map, "DECISION_FINAL", 130);
    setWidthIfExists_(sheet, map, "ESTADO_TMK", 140);
    setWidthIfExists_(sheet, map, "PROXIMA_ACCION", 150);
    setWidthIfExists_(sheet, map, "PRIORIDAD", 90);
    setWidthIfExists_(sheet, map, "FECHA_PROXIMO_CONTACTO", 130);
    for (var q = 1; q <= 17; q++) {
      for (var h = 0; h < HEADERS_TMK.length; h++) if (HEADERS_TMK[h].indexOf("Q" + q + "_") === 0) setWidthIfExists_(sheet, map, HEADERS_TMK[h], 180);
    }
    pintarColumnaTMK_(sheet, map, "LINK_ENCUESTA", "#eff6ff");
    pintarColumnaTMK_(sheet, map, "ENVIAR WPP", "#eff6ff");
    pintarColumnaTMK_(sheet, map, "RESULTADO_SCORING", "#fefce8");
    pintarColumnaTMK_(sheet, map, "MOTIVO_RESULTADO", "#fefce8");
    pintarColumnaTMK_(sheet, map, "DECISION_FINAL", "#f8fafc");
    pintarColumnaTMK_(sheet, map, "ESTADO_TMK", "#f8fafc");
    aplicarValidacionDecision_(sheet, map);
    aplicarValidacionEstadoTMK_(sheet, map);
    aplicarValidacionProximaAccion_(sheet, map);
    aplicarValidacionPrioridad_(sheet, map);
    aplicarFormatoDecision_(sheet, map);
    aplicarFormatoEstadoTMK_(sheet, map);
    var tokenCol = getCol_(map, "TOKEN");
    var hashCol = getCol_(map, "DNI_HASH");
    if (tokenCol) sheet.hideColumns(tokenCol);
    if (hashCol) sheet.hideColumns(hashCol);
    hideColumnsIfExist_(sheet, map, LEGACY_TMK_QUESTION_HEADERS);
  }
}

function setWidthIfExists_(sheet, map, header, width) {
  var col = getCol_(map, header);
  if (col) sheet.setColumnWidth(col, width);
}

function hideColumnsIfExist_(sheet, map, headers) {
  for (var i = 0; i < headers.length; i++) {
    var col = getCol_(map, headers[i]);
    if (col) sheet.hideColumns(col);
  }
}

function pintarColumnaTMK_(sheet, map, header, color) {
  var col = getCol_(map, header);
  if (col && sheet.getLastRow() > 1) sheet.getRange(2, col, sheet.getLastRow() - 1, 1).setBackground(color);
}

function aplicarValidacionDecision_(sheet, map) {
  var col = getCol_(map, "DECISION_FINAL");
  if (!col || sheet.getLastRow() < 2) return;
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["ACEPTADO", "RECHAZADO", "REVISAR", "PENDIENTE"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, col, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(rule);
}

function aplicarValidacionEstadoTMK_(sheet, map) {
  var col = getCol_(map, "ESTADO_TMK");
  if (!col || sheet.getLastRow() < 2) return;
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(["Nuevo", "Pendiente envio", "Enviado", "Esperando respuesta", "Respondido web", "Llamar", "Recontactar", "Revisar", "Rechazado", "Cerrado"], true).setAllowInvalid(false).build();
  sheet.getRange(2, col, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(rule);
}

function aplicarValidacionProximaAccion_(sheet, map) {
  var col = getCol_(map, "PROXIMA_ACCION");
  if (!col || sheet.getLastRow() < 2) return;
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(["Generar link", "Enviar WPP", "Esperar respuesta", "Llamar", "Recontactar", "Reenviar link", "Revisar rechazo", "Cerrar"], true).setAllowInvalid(false).build();
  sheet.getRange(2, col, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(rule);
}

function aplicarValidacionPrioridad_(sheet, map) {
  var col = getCol_(map, "PRIORIDAD");
  if (!col || sheet.getLastRow() < 2) return;
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(["Alta", "Media", "Baja"], true).setAllowInvalid(false).build();
  sheet.getRange(2, col, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(rule);
}

function aplicarFormatoDecision_(sheet, map) {
  var col = getCol_(map, "DECISION_FINAL");
  if (!col) return;

  var range = sheet.getRange(2, col, Math.max(sheet.getMaxRows() - 1, 1), 1);
  var rules = sheet.getConditionalFormatRules();

  // Limpiamos reglas previas de esta columna para evitar duplicados.
  var nuevas = [];
  for (var i = 0; i < rules.length; i++) {
    var rangos = rules[i].getRanges();
    var tocaDecision = false;
    for (var r = 0; r < rangos.length; r++) {
      if (rangos[r].getSheet().getSheetId() === sheet.getSheetId() &&
          rangos[r].getColumn() <= col &&
          rangos[r].getLastColumn() >= col) {
        tocaDecision = true;
        break;
      }
    }
    if (!tocaDecision) nuevas.push(rules[i]);
  }

  nuevas.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("ACEPTADO")
    .setBackground("#dcfce7")
    .setFontColor("#166534")
    .setRanges([range])
    .build());

  nuevas.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("RECHAZADO")
    .setBackground("#fee2e2")
    .setFontColor("#991b1b")
    .setRanges([range])
    .build());

  nuevas.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("REVISAR")
    .setBackground("#ffedd5")
    .setFontColor("#9a3412")
    .setRanges([range])
    .build());

  nuevas.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("PENDIENTE")
    .setBackground("#fef9c3")
    .setFontColor("#854d0e")
    .setRanges([range])
    .build());

  sheet.setConditionalFormatRules(nuevas);
}

function aplicarFormatoEstadoTMK_(sheet, map) {
  var col = getCol_(map, "ESTADO_TMK");
  if (!col) return;
  var range = sheet.getRange(2, col, Math.max(sheet.getMaxRows() - 1, 1), 1);
  var rules = sheet.getConditionalFormatRules();
  var nuevas = [];
  for (var i = 0; i < rules.length; i++) {
    var rangos = rules[i].getRanges();
    var toca = false;
    for (var r = 0; r < rangos.length; r++) {
      if (rangos[r].getSheet().getSheetId() === sheet.getSheetId() && rangos[r].getColumn() <= col && rangos[r].getLastColumn() >= col) { toca = true; break; }
    }
    if (!toca) nuevas.push(rules[i]);
  }
  nuevas.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Cerrado").setBackground("#dcfce7").setFontColor("#166534").setRanges([range]).build());
  nuevas.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Rechazado").setBackground("#fee2e2").setFontColor("#991b1b").setRanges([range]).build());
  nuevas.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Recontactar").setBackground("#ffedd5").setFontColor("#9a3412").setRanges([range]).build());
  nuevas.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Revisar").setBackground("#fef3c7").setFontColor("#92400e").setRanges([range]).build());
  nuevas.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Pendiente envio").setBackground("#dbeafe").setFontColor("#1d4ed8").setRanges([range]).build());
  nuevas.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Esperando respuesta").setBackground("#e0f2fe").setFontColor("#155e75").setRanges([range]).build());
  sheet.setConditionalFormatRules(nuevas);
}

function formatearVistasTMK_() {
  for (var i = 0; i < TMK_VIEW_SHEETS.length; i++) formatearUnaVistaTMK_(getSheet(TMK_VIEW_SHEETS[i].name), TMK_VIEW_SHEETS[i].mode);
}

function formatearUnaVistaTMK_(sheet, mode) {
  var lastRow = Math.max(sheet.getLastRow(), 1);
  var lastCol = Math.max(sheet.getLastColumn(), HEADERS_TMK.length);
  var map = getHeaderMapFlexible_(sheet);
  sheet.setFrozenRows(1);
  sheet.setTabColor(mode === "RECHAZADOS" ? "#dc2626" : "#f59e0b");
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(1, 1, lastRow, lastCol).createFilter();
  sheet.getRange(1, 1, 1, lastCol).setFontWeight("bold").setFontColor("#ffffff").setBackground(mode === "RECHAZADOS" ? "#7f1d1d" : "#92400e");
  aplicarFormatoDecision_(sheet, map);
  aplicarFormatoEstadoTMK_(sheet, map);
}

function calcularScoring(respuestas) {
  var resultado = "Paso scoring";
  var motivo = "Validacion breve conforme.";
  var requiereRecontacto = "No";
  var area = "Sin revision";

  var q1 = String(respuestas.q1 || "").trim();
  var q2 = String(respuestas.q2 || "").trim();
  var q3 = String(respuestas.q3 || "").trim();
  var q4 = String(respuestas.q4 || "").trim();
  var q4a = String(respuestas.q4a || "").trim();
  var q5a = String(respuestas.q5a || "").trim();
  var q7 = String(respuestas.q7 || "").trim();
  var q7a = String(respuestas.q7a || "").trim();
  var q9 = String(respuestas.q9 || "").trim();
  var q10 = String(respuestas.q10 || "").trim();

  var hallazgosNoPaso = [];
  var hallazgosRevision = [];
  var hallazgosRecontacto = [];
  var observacionesInternas = [];

  var esSi = function(valor) { return String(valor || "").toUpperCase() === "SI"; };
  var esNo = function(valor) { return String(valor || "").toUpperCase() === "NO"; };
  var agregar = function(lista, pregunta, respuesta, detalle) {
    lista.push(pregunta + ": '" + (respuesta || "Sin dato") + "'. " + detalle);
  };
  var enumerar = function(lista) {
    var salida = [];
    for (var i = 0; i < lista.length; i++) salida.push((i + 1) + ". " + lista[i]);
    return salida.join(" | ");
  };
  var contienePalabrasClaveNegativas = function(texto) {
    if (!texto) return false;
    var keywords = ["reclamo", "problema", "mentira", "molesto", "molesta", "disconforme", "no me explicaron", "no entiendo", "duda"];
    var lower = texto.toLowerCase();
    for (var i = 0; i < keywords.length; i++) if (lower.indexOf(keywords[i]) !== -1) return true;
    return false;
  };

  if (esNo(q1)) agregar(hallazgosNoPaso, "Q1", q1, "No reconocio el plan exclusivo informado.");
  if (esNo(q2)) agregar(hallazgosNoPaso, "Q2", q2, "Indica que no le explicaron la licitacion desde cuota 2.");
  if (esNo(q3)) agregar(hallazgosNoPaso, "Q3", q3, "Indica que no le explicaron la adjudicacion asegurada.");
  if (esNo(q4)) agregar(hallazgosNoPaso, "Q4", q4, "Indica que no le informaron el monto estimado de cuota 2.");

  if (esSi(q4) && !q4a) agregar(hallazgosRevision, "Q4A", q4a, "Respondio que si conocia el monto de cuota 2, pero no pudo indicarlo.");
  if (esNo(q5a)) agregar(hallazgosRevision, "Q5A", q5a, "No acepto adhesion al debito automatico.");
  if (esSi(q7)) agregar(hallazgosRevision, "Q7", q7, "Declara otro plan de ahorro reciente para revisar antecedentes.");
  if (esSi(q7) && q7a) observacionesInternas.push("Detalle otro plan: " + q7a);

  if (esSi(q9)) agregar(hallazgosRecontacto, "Q9", q9, "Solicita nuevo contacto del asesor.");
  if (contienePalabrasClaveNegativas(q10)) agregar(hallazgosRecontacto, "Q10", q10, "Observacion sensible del cliente.");
  if (q10) observacionesInternas.push("Observacion cliente: " + q10);

  if (hallazgosNoPaso.length > 0) {
    resultado = "No paso scoring";
    area = "Asesor comercial";
    motivo = enumerar(hallazgosNoPaso);
  } else if (hallazgosRecontacto.length > 0) {
    resultado = "Requiere recontacto";
    requiereRecontacto = "Si";
    area = "Contact Center";
    motivo = enumerar(hallazgosRecontacto);
  } else if (hallazgosRevision.length > 0) {
    resultado = "Requiere revision";
    area = esNo(q5a) ? "Cobranza / debito" : "Scoring";
    motivo = enumerar(hallazgosRevision);
  }

  return {
    resultado: resultado,
    motivo: motivo,
    requiereRecontacto: requiereRecontacto,
    area: area,
    observacion: observacionesInternas.join(" | ")
  };
}

function actualizarCatalogoPreguntas() {
  var headers = ["Codigo", "Bloque", "Orden", "Pregunta", "Tipo", "Opciones", "Obligatoria", "Condicion", "Columna_respuesta", "Activa"];
  ensureHeadersPresent("Preguntas", headers);

  var sheet = getSheet("Preguntas");
  var rows = [
    ["Q1", "Plan", 1, "Le informamos que accedio al plan exclusivo del modelo indicado, por el cual financia un porcentaje del vehiculo. Lo sabia?", "Seleccion", "Si | No", "Si", "Editable", "q1", "Si"],
    ["Q2", "Plan", 2, "Le informaron que puede licitar con ese porcentaje a partir de la cuota 2?", "Seleccion", "Si | No", "Si", "Editable", "q2", "Si"],
    ["Q3", "Plan", 3, "Le informaron que tiene adjudicacion asegurada en cuota 8, 12 o 24 segun el plan?", "Seleccion", "Si | No", "Si", "Editable", "q3", "Si"],
    ["Q4", "Plan", 4, "El vendedor informo el monto estimado de la cuota 2?", "Seleccion", "Si | No", "Si", "Editable", "q4", "Si"],
    ["Q4A", "Plan", 5, "Si le informaron el monto, cuanto es aproximadamente?", "Texto", "", "No", "Completar solo si Q4 = Si", "q4a", "Si"],
    ["Q5", "Pagos", 6, "Cuanto pago en la primera cuota?", "Texto", "", "Si", "Formato sugerido: $ 000000", "q5", "Si"],
    ["Q5A", "Pagos", 7, "Acepto adhesion al debito automatico?", "Seleccion", "Si | No", "Si", "Editable", "q5a", "Si"],
    ["Q5B", "Pagos", 8, "Cuando pago la primera cuota estimativamente?", "Fecha", "", "Si", "Usar calendario", "q5b", "Si"],
    ["INFO_Q5", "Pagos", 9, "Informativo: la permanencia minima del debito automatico es hasta cuota 6.", "Informativo", "", "No", "No se pregunta. Solo referencia interna.", "", "Si"],
    ["Q6", "Vendedor", 10, "Quien es su vendedor?", "Texto", "", "Si", "Se puede dejar precargado con el asesor de la solicitud", "q6", "Si"],
    ["Q7", "Historial", 11, "Estuvo pagando algun otro Plan de Ahorro de un 0 km recientemente?", "Seleccion", "Si | No", "Si", "Editable", "q7", "Si"],
    ["Q7A", "Historial", 12, "Si respondio Si, de que marca y hasta que mes pago?", "Texto", "", "No", "Completar solo si Q7 = Si", "q7a", "Si"],
    ["Q8", "Origen", 13, "Como conocio la propuesta?", "Seleccion", "Redes sociales | Salon | TV | Radio | Referido | WhatsApp | Otro", "Si", "Editable", "q8", "Si"],
    ["Q9", "Cierre", 14, "Necesita que un asesor vuelva a contactarlo?", "Seleccion", "Si | No", "Si", "Si responde Si, observaciones pasan a ser obligatorias", "q9", "Si"],
    ["Q10", "Cierre", 15, "Observaciones", "Texto", "", "No", "Editable. Obligatorio si Q9 = Si", "q10", "Si"]
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#dbeafe").setFontColor("#1e3a8a");
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 90);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 60);
  sheet.setColumnWidth(4, 430);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 320);
  sheet.setColumnWidth(7, 90);
  sheet.setColumnWidth(8, 280);
  sheet.setColumnWidth(9, 150);
  sheet.setColumnWidth(10, 70);
  sheet.getRange(2, 1, rows.length, headers.length).setWrap(true).setVerticalAlignment("middle");

  sheet.getRange("A1").setNote("No editar salvo cambio tecnico.");
  sheet.getRange("D1").setNote("Editable. Cambia el texto visible o el guion telefonico.");
  sheet.getRange("F1").setNote("Editable. Separar opciones con |.");
  sheet.getRange("G1").setNote("Editable. Si/No.");
  sheet.getRange("I1").setNote("No editar. Lo usa el sistema para guardar respuestas.");
  sheet.getRange("J1").setNote("Editable. Poner No para ocultar una pregunta sin borrarla.");
  sheet.getRange(1, 4, 1, 4).setBackground("#dcfce7");
  sheet.getRange(1, 10, 1, 1).setBackground("#fef3c7");
}

function ensureQuestionCatalogSeeded() {
  var sheet = getSheet("Preguntas");
  if (sheet.getLastRow() <= 1 || sheet.getLastColumn() === 0) {
    actualizarCatalogoPreguntas();
  }
}

function obtenerListaVendedores() {
  return [];
}





