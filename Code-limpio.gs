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


function ensureQuestionCatalogSeeded() {
  var sheet = getSheet("Preguntas");
  if (sheet.getLastRow() <= 1 || sheet.getLastColumn() === 0) {
    actualizarCatalogoPreguntas();
  }
}

function obtenerListaVendedores() {
  return [];
}






/**************************************************************
 * OVERRIDE LIMPIO - OPERATIVA SOLICITUDES / TMK / PREGUNTAS
 **************************************************************/

var COL_GENERAR = 24; // X
var COL_INICIO_LINKS = 25; // Y

var HEADERS_LINKS_SOLICITUDES = [
  "ID_CLIENTE",
  "TOKEN",
  "DNI_HASH",
  "LINK_ENCUESTA",
  "ENVIAR WPP",
  "ESTADO_ENCUESTA",
  "FECHA_ENVIO_LINK"
];

var HEADERS_TMK = [
  "SUCURSAL",
  "FECHA",
  "MES",
  "NOMBRE Y APELLIDO",
  "Nº",
  "TELEFONO",
  "Modelo suscripto/ plan",
  "PLAN_AUTO",
  "DNI",
  "FINANCIA_AUTO",
  "MAIL",
  "LICITA_AUTO",
  "CTA_AUTO",
  "NOMBRE DEL VENDEDOR",
  "LINK_ENCUESTA",
  "ENVIAR WPP",
  "ESTADO_TMK",
  "ESTADO_ENCUESTA",
  "TIPO DE PAGO",
  "FECHA_ENVIO_LINK",
  "N° DE SOLICITUD",
  "DECISION_FINAL",
  "N° DE CLIENTE",
  "PROXIMA_ACCION",
  "CUOTA 2",
  "FECHA_PROXIMO_CONTACTO",
  "OBSERVACION_TMK",
  "ID_CLIENTE",
  "RESULTADO_SCORING",
  "TOKEN",
  "MOTIVO_RESULTADO",
  "DNI_HASH",
  "REQUIERE_RECONTACTO",
  "AREA_A_REVISAR",
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
  "OBSERVACION_INTERNA",
  "FECHA_RESPUESTA_WEB",
  "FECHA_REALIZACION_SCORING",
  "CANAL_SCORING",
  "MOTIVO_DECISION",
  "FECHA_DECISION",
  "GESTIONADO_POR",
  "PRIORIDAD",
  "FECHA_ULTIMO_ENVIO_WPP",
  "CANTIDAD_INTENTOS_WPP",
  "ULTIMO_CONTACTO_TMK"
];

var HEADERS_RESPUESTAS_SCORING = [
  "ID_RESPUESTA",
  "ID_CLIENTE",
  "TOKEN_HASH",
  "DNI_HASH",
  "Fecha respuesta",
  "Nombre y Apellido",
  "Modelo suscripto",
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
  "OBSERVACION_INTERNA"
];

var TMK_VIEW_SHEETS = [
  { name: "TMK - RECHAZADOS", mode: "RECHAZADOS" }
];


function onEdit(e) {
  try {
    if (!e || !e.range || !e.source) return;
    var sheet = e.range.getSheet();
    var config = getConfigPorBase_(sheet.getName());
    if (!config) return;
    if (e.range.getRow() < 2 || e.range.getColumn() !== COL_GENERAR) return;
    if (String(e.value || "").toUpperCase() !== "TRUE") return;
    procesarFilaSolicitud_(sheet, e.range.getRow(), config);
    e.range.setValue(false);
  } catch (err) {
    Logger.log("onEdit error: " + err);
  }
}


function ensureHeaders() {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    prepararEncabezadosSolicitud_(getSheet(SOLICITUDES_CONFIG[i].base));
    establecerHeadersExactos_(getSheet(SOLICITUDES_CONFIG[i].tmk), HEADERS_TMK);
  }

  for (var v = 0; v < TMK_VIEW_SHEETS.length; v++) {
    establecerHeadersExactos_(getSheet(TMK_VIEW_SHEETS[v].name), HEADERS_TMK);
  }

  var respuestas = getSheet("Respuestas_Scoring");
  if (respuestas.getLastRow() <= 1) establecerHeadersExactos_(respuestas, HEADERS_RESPUESTAS_SCORING);
  ensureHeadersPresent_(getSheet("Preguntas"), ["Codigo", "Bloque", "Orden", "Pregunta", "Tipo", "Opciones", "Obligatoria", "Condicion", "Columna_respuesta", "Activa"]);
  ensureHeadersPresent_(getSheet("Log_Seguridad"), ["Fecha", "Token", "DNI_HASH", "Resultado", "Detalle", "Origen"]);

  formatearSolicitudes_();
  formatearHojasTMK_();
  formatearVistasTMK_();
}

function establecerHeadersExactos_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (sheet.getLastColumn() > headers.length) {
    sheet.hideColumns(headers.length + 1, sheet.getLastColumn() - headers.length);
  }
  sheet.setFrozenRows(1);
}

function prepararEncabezadosSolicitud_(sheet) {
  var headers = HEADERS_SOLICITUDES_MODELO.slice();
  headers.push("GENERAR");
  headers = headers.concat(HEADERS_LINKS_SOLICITUDES);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  var range = sheet.getRange(2, COL_GENERAR, Math.max(sheet.getMaxRows() - 1, 1), 1);
  range.insertCheckboxes();
}

function asegurarHeadersLinksSolicitud_(sheet) {
  prepararEncabezadosSolicitud_(sheet);
}

function procesarNuevosIngresos() {
  var total = 0;
  var skipped = 0;
  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var config = SOLICITUDES_CONFIG[c];
    var sheet = getSheet(config.base);
    var headerMap = getHeaderMapFlexible_(sheet);
    if (sheet.getLastRow() < 2) continue;
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var nombre = getVal_(row, headerMap, ALIASES.NOMBRE);
      var telefono = getVal_(row, headerMap, ALIASES.TELEFONO);
      var dni = getVal_(row, headerMap, ALIASES.DNI);
      if (!nombre || !telefono) continue;
      if (!dni) {
        skipped++;
        continue;
      }
      if (filaTieneLinkGenerado_(row, headerMap)) continue;
      if (procesarFilaSolicitud_(sheet, i + 2, config)) total++;
    }
  }
  return "Generados: " + total + ". Sin DNI: " + skipped + ".";
}

function filaTieneLinkGenerado_(row, headerMap) {
  var token = getVal_(row, headerMap, ALIASES.TOKEN);
  var estado = getVal_(row, headerMap, ALIASES.ESTADO_ENCUESTA);
  return !!token || String(estado || "").trim() === "Link generado";
}

function procesarFilaSolicitud_(sheet, rowIndex, config) {
  ensureSheets();
  ensureHeaders();

  var headerMap = getHeaderMapFlexible_(sheet);
  var row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  var nombre = getVal_(row, headerMap, ALIASES.NOMBRE);
  var telefono = getVal_(row, headerMap, ALIASES.TELEFONO);
  var dni = getVal_(row, headerMap, ALIASES.DNI);
  var solicitud = getVal_(row, headerMap, ALIASES.SOLICITUD);
  if (!nombre || !telefono || !dni) return false;

  var netlifyBaseUrl = normalizarNetlifyBaseUrl();
  var token = getVal_(row, headerMap, ALIASES.TOKEN) || ("T" + Utilities.getUuid().slice(0, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000));
  var idCliente = getVal_(row, headerMap, ALIASES.ID_CLIENTE) || construirIdCliente_(config.sucursal, solicitud, dni);
  var dniHash = getVal_(row, headerMap, ALIASES.DNI_HASH) || generarHashDniParaCarga(dni);
  var link = netlifyBaseUrl + "?t=" + token;
  var waLink = crearLinkWhatsApp_(telefono, nombre, link);

  setVal_(sheet, rowIndex, headerMap, ALIASES.ID_CLIENTE, idCliente);
  setVal_(sheet, rowIndex, headerMap, ALIASES.TOKEN, token);
  setVal_(sheet, rowIndex, headerMap, ALIASES.DNI_HASH, dniHash);
  setCeldaLinkEncuesta(sheet, rowIndex, getCol_(headerMap, ALIASES.LINK_ENCUESTA), link);
  if (waLink) setCeldaLinkWhatsApp(sheet, rowIndex, getCol_(headerMap, ALIASES.ENVIAR_WPP), waLink, nombre);
  setVal_(sheet, rowIndex, headerMap, ALIASES.ESTADO_ENCUESTA, "Link generado");
  setVal_(sheet, rowIndex, headerMap, ALIASES.FECHA_ENVIO_LINK, new Date());

  sincronizarTMKDesdeSolicitud_(config);
  formatearSolicitudes_();
  formatearHojasTMK_();
  return true;
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
  return "TMK actualizado. Filas: " + total + ". " + vistas;
}

function sincronizarTMKDesdeSolicitud_(config) {
  var baseSheet = getSheet(config.base);
  var tmkSheet = getSheet(config.tmk);
  establecerHeadersExactos_(tmkSheet, HEADERS_TMK);

  var baseMap = getHeaderMapFlexible_(baseSheet);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var existingByKey = cargarFilasExistentesTMK_(tmkSheet, tmkMap);
  var output = [];
  var richPairs = [];

  if (baseSheet.getLastRow() >= 2) {
    var baseData = baseSheet.getRange(2, 1, baseSheet.getLastRow() - 1, baseSheet.getLastColumn()).getValues();
    for (var i = 0; i < baseData.length; i++) {
      var row = baseData[i];
      var nombre = getVal_(row, baseMap, ALIASES.NOMBRE);
      var token = getVal_(row, baseMap, ALIASES.TOKEN);
      var link = getVal_(row, baseMap, ALIASES.LINK_ENCUESTA);
      if (!nombre || !token || !link) continue;

      var id = getVal_(row, baseMap, ALIASES.ID_CLIENTE);
      var key = id || token;
      var existing = existingByKey[key] || {};
      output.push(construirFilaTMK_(config, row, baseMap, existing));
      richPairs.push({ baseRow: i + 2, tmkRow: output.length + 1 });
    }
  }

  limpiarDatosTMK_(tmkSheet);
  if (output.length > 0) {
    tmkSheet.getRange(2, 1, output.length, HEADERS_TMK.length).setValues(output);
    restaurarRichTextTMKDesdeSolicitud_(baseSheet, baseMap, tmkSheet, richPairs);
  }
  return output.length;
}

function restaurarRichTextTMKDesdeSolicitud_(baseSheet, baseMap, tmkSheet, richPairs) {
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var colEncuestaTMK = getCol_(tmkMap, "LINK_ENCUESTA");
  var colWppTMK = getCol_(tmkMap, "ENVIAR WPP");
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

function construirFilaTMK_(config, baseRow, baseMap, existing) {
  var plan = analizarPlanAuto_(getVal_(baseRow, baseMap, ALIASES.MODELO));
  var row = [];
  for (var i = 0; i < HEADERS_TMK.length; i++) {
    var h = HEADERS_TMK[i];
    var val = "";
    switch (h) {
      case "SUCURSAL": val = config.sucursal; break;
      case "FECHA": val = getVal_(baseRow, baseMap, ALIASES.FECHA); break;
      case "MES": val = getVal_(baseRow, baseMap, ALIASES.MES); break;
      case "NOMBRE Y APELLIDO": val = getVal_(baseRow, baseMap, ALIASES.NOMBRE); break;
      case "Nº": val = getVal_(baseRow, baseMap, ALIASES.NRO); break;
      case "TELEFONO": val = getVal_(baseRow, baseMap, ALIASES.TELEFONO); break;
      case "Modelo suscripto/ plan": val = getVal_(baseRow, baseMap, ALIASES.MODELO); break;
      case "PLAN_AUTO": val = plan.planAuto; break;
      case "DNI": val = getVal_(baseRow, baseMap, ALIASES.DNI); break;
      case "FINANCIA_AUTO": val = plan.financia; break;
      case "MAIL": val = getVal_(baseRow, baseMap, ALIASES.MAIL); break;
      case "LICITA_AUTO": val = plan.licita; break;
      case "CTA_AUTO": val = plan.cta; break;
      case "NOMBRE DEL VENDEDOR": val = getVal_(baseRow, baseMap, ALIASES.VENDEDOR); break;
      case "LINK_ENCUESTA": val = construirTextoBotonEncuesta(); break;
      case "ENVIAR WPP": val = construirTextoBotonWhatsApp(getVal_(baseRow, baseMap, ALIASES.NOMBRE)); break;
      case "ESTADO_TMK": val = existing[h] || estadoTmkDefaultDesdeBase_(baseRow, baseMap); break;
      case "ESTADO_ENCUESTA": val = getVal_(baseRow, baseMap, ALIASES.ESTADO_ENCUESTA); break;
      case "TIPO DE PAGO": val = getVal_(baseRow, baseMap, ALIASES.TIPO_PAGO); break;
      case "FECHA_ENVIO_LINK": val = getVal_(baseRow, baseMap, ALIASES.FECHA_ENVIO_LINK); break;
      case "N° DE SOLICITUD": val = getVal_(baseRow, baseMap, ALIASES.SOLICITUD); break;
      case "DECISION_FINAL": val = existing[h] || "PENDIENTE"; break;
      case "N° DE CLIENTE": val = getVal_(baseRow, baseMap, ALIASES.NRO_CLIENTE); break;
      case "PROXIMA_ACCION": val = existing[h] || proximaAccionDefaultDesdeBase_(baseRow, baseMap); break;
      case "CUOTA 2": val = getVal_(baseRow, baseMap, ALIASES.CUOTA_2); break;
      case "FECHA_PROXIMO_CONTACTO": val = existing[h] || ""; break;
      case "OBSERVACION_TMK": val = existing[h] || ""; break;
      case "ID_CLIENTE": val = getVal_(baseRow, baseMap, ALIASES.ID_CLIENTE); break;
      case "RESULTADO_SCORING": val = existing[h] || ""; break;
      case "TOKEN": val = getVal_(baseRow, baseMap, ALIASES.TOKEN); break;
      case "MOTIVO_RESULTADO": val = existing[h] || ""; break;
      case "DNI_HASH": val = getVal_(baseRow, baseMap, ALIASES.DNI_HASH); break;
      case "REQUIERE_RECONTACTO": val = existing[h] || ""; break;
      case "AREA_A_REVISAR": val = existing[h] || ""; break;
      case "OBSERVACION_INTERNA": val = existing[h] || ""; break;
      case "FECHA_RESPUESTA_WEB": val = existing[h] || ""; break;
      case "FECHA_REALIZACION_SCORING": val = existing[h] || ""; break;
      case "CANAL_SCORING": val = existing[h] || ""; break;
      case "MOTIVO_DECISION": val = existing[h] || ""; break;
      case "FECHA_DECISION": val = existing[h] || ""; break;
      case "GESTIONADO_POR": val = existing[h] || ""; break;
      case "PRIORIDAD": val = existing[h] || "Media"; break;
      case "FECHA_ULTIMO_ENVIO_WPP": val = existing[h] || ""; break;
      case "CANTIDAD_INTENTOS_WPP": val = existing[h] || 0; break;
      case "ULTIMO_CONTACTO_TMK": val = existing[h] || ""; break;
      default: val = existing[h] || "";
    }
    row.push(val);
  }
  return row;
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
    cliente: clienteSeguro,
    preguntas: construirPreguntasFrontend_(clienteSeguro)
  });
}

function construirPreguntasFrontend_(clienteSeguro) {
  var sheet = getSheet("Preguntas");
  var out = {};
  if (sheet.getLastRow() < 2) return out;

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();
  for (var i = 0; i < data.length; i++) {
    var activo = String(data[i][9] || "").toUpperCase();
    var key = String(data[i][8] || "").trim();
    if (activo === "NO" || !key) continue;
    out[key] = {
      pregunta: personalizarTextoPregunta_(String(data[i][3] || ""), clienteSeguro),
      opciones: normalizarOpcionesPregunta_(String(data[i][5] || ""))
    };
  }

  var plan = analizarPlanAuto_(clienteSeguro && clienteSeguro.modelo);
  if (plan.cta === "-" || plan.cta === "No aplica") delete out.q3;
  return out;
}

function personalizarTextoPregunta_(texto, clienteSeguro) {
  var cliente = clienteSeguro || {};
  var plan = analizarPlanAuto_(cliente.modelo);
  return String(texto || "")
    .replace(/\{\{MODELO\}\}/g, cliente.modelo || "su modelo")
    .replace(/\{\{MODELO_BASE\}\}/g, plan.modeloBase || cliente.modelo || "su modelo")
    .replace(/\{\{FINANCIA\}\}/g, plan.financia || "un porcentaje")
    .replace(/\{\{PORCENTAJE_FINANCIADO\}\}/g, plan.financia || "un porcentaje")
    .replace(/\{\{LICITA\}\}/g, plan.licita || "ese porcentaje")
    .replace(/\{\{PORCENTAJE_LICITACION\}\}/g, plan.licita || "ese porcentaje")
    .replace(/\{\{CTA\}\}/g, plan.cta || "-")
    .replace(/\{\{CUOTAS_ADJUDICACION\}\}/g, plan.cta || "-")
    .replace(/\{\{CUOTA2\}\}/g, cliente.montoCuota2 || "");
}

function normalizarOpcionesPregunta_(texto) {
  if (!texto) return [];
  var parts = texto.split("|");
  var out = [];
  for (var i = 0; i < parts.length; i++) {
    var item = String(parts[i] || "").trim();
    if (item) out.push(item);
  }
  return out;
}

function guardarRespuestaScoring(cliente, respuestas, scoring) {
  ensureHeaders();
  var sheet = getSheet("Respuestas_Scoring");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idRespuesta = "R-" + Utilities.getUuid().slice(0, 8).toUpperCase();
  var fechaActual = new Date();
  var newRow = [];

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
    }
    newRow.push(val);
  }

  sheet.appendRow(newRow);
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
  if (estadoEncuesta === "Respondido") return "";
  if (estadoEncuesta === "Link generado") return "Enviar WPP";
  return "Generar link";
}

function rowMatchesView_(row, map, mode) {
  var decision = String(getVal_(row, map, "DECISION_FINAL") || "").toUpperCase().trim();
  if (mode === "RECHAZADOS") return decision === "RECHAZADO";
  return false;
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

function formatearSolicitudes_() {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    var sheet = getSheet(SOLICITUDES_CONFIG[i].base);
    var lastRow = Math.max(sheet.getLastRow(), 1);
    var lastCol = Math.max(sheet.getLastColumn(), COL_INICIO_LINKS + HEADERS_LINKS_SOLICITUDES.length - 1);
    var map = getHeaderMapFlexible_(sheet);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, lastCol)
      .setFontWeight("bold")
      .setFontColor("#ffffff")
      .setBackground("#0f172a")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setWrap(true);
    sheet.getRange(1, COL_GENERAR, 1, 1).setBackground("#16a34a");
    sheet.getRange(1, COL_INICIO_LINKS, 1, HEADERS_LINKS_SOLICITUDES.length).setBackground("#2563eb");
    if (lastRow > 1) {
      sheet.getRange(2, COL_GENERAR, lastRow - 1, 1).setBackground("#f0fdf4");
      sheet.getRange(2, COL_INICIO_LINKS, lastRow - 1, HEADERS_LINKS_SOLICITUDES.length).setBackground("#eff6ff");
    }
    setWidthIfExists_(sheet, map, "NOMBRE Y APELLIDO", 220);
    setWidthIfExists_(sheet, map, "Modelo suscripto/ plan", 250);
    setWidthIfExists_(sheet, map, "LINK_ENCUESTA", 130);
    setWidthIfExists_(sheet, map, "ENVIAR WPP", 170);
    setWidthIfExists_(sheet, map, "Observaciones", 220);
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
      .setWrap(true);
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, lastCol)
        .setBackground(null)
        .setFontColor("#111827")
        .setVerticalAlignment("middle")
        .setWrap(true);
    }
    setWidthIfExists_(sheet, map, "NOMBRE Y APELLIDO", 220);
    setWidthIfExists_(sheet, map, "Modelo suscripto/ plan", 250);
    setWidthIfExists_(sheet, map, "LINK_ENCUESTA", 120);
    setWidthIfExists_(sheet, map, "ENVIAR WPP", 170);
    setWidthIfExists_(sheet, map, "ESTADO_TMK", 130);
    setWidthIfExists_(sheet, map, "ESTADO_ENCUESTA", 130);
    setWidthIfExists_(sheet, map, "DECISION_FINAL", 120);
    setWidthIfExists_(sheet, map, "MOTIVO_RESULTADO", 320);
    setWidthIfExists_(sheet, map, "OBSERVACION_INTERNA", 280);
    setWidthIfExists_(sheet, map, "OBSERVACION_TMK", 280);
    pintarColumnaTMK_(sheet, map, "LINK_ENCUESTA", "#eff6ff");
    pintarColumnaTMK_(sheet, map, "ENVIAR WPP", "#eff6ff");
    pintarColumnaTMK_(sheet, map, "ESTADO_TMK", "#f8fafc");
    pintarColumnaTMK_(sheet, map, "ESTADO_ENCUESTA", "#f8fafc");
    pintarColumnaTMK_(sheet, map, "DECISION_FINAL", "#f8fafc");
    aplicarValidacionDecision_(sheet, map);
    aplicarValidacionEstadoTMK_(sheet, map);
    aplicarFormatoDecision_(sheet, map);
    aplicarFormatoEstadoTMK_(sheet, map);
    var tokenCol = getCol_(map, "TOKEN");
    var hashCol = getCol_(map, "DNI_HASH");
    var idCol = getCol_(map, "ID_CLIENTE");
    if (tokenCol) sheet.hideColumns(tokenCol);
    if (hashCol) sheet.hideColumns(hashCol);
    if (idCol) sheet.hideColumns(idCol);
  }
}

function formatearVistasTMK_() {
  for (var i = 0; i < TMK_VIEW_SHEETS.length; i++) formatearUnaVistaTMK_(getSheet(TMK_VIEW_SHEETS[i].name), TMK_VIEW_SHEETS[i].mode);
}

function formatearUnaVistaTMK_(sheet, mode) {
  var lastRow = Math.max(sheet.getLastRow(), 1);
  var lastCol = Math.max(sheet.getLastColumn(), HEADERS_TMK.length);
  var map = getHeaderMapFlexible_(sheet);
  sheet.setFrozenRows(1);
  sheet.setTabColor(mode === "RECHAZADOS" ? "#dc2626" : "#2563eb");
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(1, 1, lastRow, lastCol).createFilter();
  sheet.getRange(1, 1, 1, lastCol).setFontWeight("bold").setFontColor("#ffffff").setBackground(mode === "RECHAZADOS" ? "#7f1d1d" : "#0f172a");
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, lastCol).setBackground(null).setFontColor("#111827");
  aplicarFormatoDecision_(sheet, map);
  aplicarFormatoEstadoTMK_(sheet, map);
}


/**************************************************************
 * OVERRIDE DE RENDIMIENTO - GENERAR RAPIDO POR FILA
 **************************************************************/

function onEdit(e) {
  try {
    if (!e || !e.range) return;
    var sheet = e.range.getSheet();
    var config = getConfigPorBase_(sheet.getName());
    if (!config) return;
    if (e.range.getRow() < 2 || e.range.getColumn() !== COL_GENERAR) return;
    if (String(e.value || "").toUpperCase() !== "TRUE") return;
    procesarFilaSolicitudRapida_(sheet, e.range.getRow(), config);
    e.range.setValue(false);
  } catch (err) {
    Logger.log("onEdit rapido error: " + err);
  }
}

function procesarFilaSolicitud_(sheet, rowIndex, config) {
  return procesarFilaSolicitudRapida_(sheet, rowIndex, config);
}

function procesarFilaSolicitudRapida_(sheet, rowIndex, config) {
  var headerMap = getHeaderMapFlexible_(sheet);
  var row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  var nombre = getVal_(row, headerMap, ALIASES.NOMBRE);
  var telefono = getVal_(row, headerMap, ALIASES.TELEFONO);
  var dni = getVal_(row, headerMap, ALIASES.DNI);
  var solicitud = getVal_(row, headerMap, ALIASES.SOLICITUD);
  if (!nombre || !telefono || !dni) return false;

  var tokenActual = getVal_(row, headerMap, ALIASES.TOKEN);
  var linkActual = sheet.getRange(rowIndex, getCol_(headerMap, ALIASES.LINK_ENCUESTA)).getRichTextValue();
  if (tokenActual && linkActual && linkActual.getLinkUrl()) {
    upsertFilaTMKDesdeSolicitud_(config, rowIndex);
    return true;
  }

  var netlifyBaseUrl = normalizarNetlifyBaseUrl();
  var token = tokenActual || ("T" + Utilities.getUuid().slice(0, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000));
  var idCliente = getVal_(row, headerMap, ALIASES.ID_CLIENTE) || construirIdCliente_(config.sucursal, solicitud, dni);
  var dniHash = getVal_(row, headerMap, ALIASES.DNI_HASH) || generarHashDniParaCarga(dni);
  var link = netlifyBaseUrl + "?t=" + token;
  var waLink = crearLinkWhatsApp_(telefono, nombre, link);
  var now = new Date();

  setVal_(sheet, rowIndex, headerMap, ALIASES.ID_CLIENTE, idCliente);
  setVal_(sheet, rowIndex, headerMap, ALIASES.TOKEN, token);
  setVal_(sheet, rowIndex, headerMap, ALIASES.DNI_HASH, dniHash);
  setCeldaLinkEncuesta(sheet, rowIndex, getCol_(headerMap, ALIASES.LINK_ENCUESTA), link);
  if (waLink) setCeldaLinkWhatsApp(sheet, rowIndex, getCol_(headerMap, ALIASES.ENVIAR_WPP), waLink, nombre);
  setVal_(sheet, rowIndex, headerMap, ALIASES.ESTADO_ENCUESTA, "Link generado");
  setVal_(sheet, rowIndex, headerMap, ALIASES.FECHA_ENVIO_LINK, now);

  aplicarFormatoFilaSolicitudGenerada_(sheet, rowIndex, headerMap);
  upsertFilaTMKDesdeSolicitud_(config, rowIndex);
  return true;
}

function upsertFilaTMKDesdeSolicitud_(config, baseRowIndex) {
  var baseSheet = getSheet(config.base);
  var tmkSheet = getSheet(config.tmk);
  var baseMap = getHeaderMapFlexible_(baseSheet);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var baseRow = baseSheet.getRange(baseRowIndex, 1, 1, baseSheet.getLastColumn()).getValues()[0];
  var idCliente = getVal_(baseRow, baseMap, ALIASES.ID_CLIENTE);
  var token = getVal_(baseRow, baseMap, ALIASES.TOKEN);
  if (!idCliente && !token) return 0;

  var targetRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap, idCliente, token);
  var existing = {};
  if (targetRow) {
    var current = tmkSheet.getRange(targetRow, 1, 1, tmkSheet.getLastColumn()).getValues()[0];
    for (var i = 0; i < HEADERS_TMK.length; i++) {
      var col = getCol_(tmkMap, HEADERS_TMK[i]);
      existing[HEADERS_TMK[i]] = col ? current[col - 1] : "";
    }
  } else {
    targetRow = Math.max(tmkSheet.getLastRow() + 1, 2);
  }

  var newRow = construirFilaTMK_(config, baseRow, baseMap, existing);
  tmkSheet.getRange(targetRow, 1, 1, HEADERS_TMK.length).setValues([newRow]);
  restaurarRichTextFilaTMKDesdeSolicitud_(baseSheet, baseMap, baseRowIndex, tmkSheet, targetRow);
  aplicarFormatoFilaTmk_(tmkSheet, targetRow);
  return targetRow;
}

function restaurarRichTextFilaTMKDesdeSolicitud_(baseSheet, baseMap, baseRow, tmkSheet, tmkRow) {
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var colEncuestaTMK = getCol_(tmkMap, "LINK_ENCUESTA");
  var colWppTMK = getCol_(tmkMap, "ENVIAR WPP");
  var colEncuestaBase = getCol_(baseMap, ALIASES.LINK_ENCUESTA);
  var colWppBase = getCol_(baseMap, ALIASES.ENVIAR_WPP);

  if (colEncuestaBase && colEncuestaTMK) {
    var rtEncuesta = baseSheet.getRange(baseRow, colEncuestaBase).getRichTextValue();
    if (rtEncuesta && rtEncuesta.getLinkUrl()) tmkSheet.getRange(tmkRow, colEncuestaTMK).setRichTextValue(rtEncuesta);
  }
  if (colWppBase && colWppTMK) {
    var rtWpp = baseSheet.getRange(baseRow, colWppBase).getRichTextValue();
    if (rtWpp && rtWpp.getLinkUrl()) tmkSheet.getRange(tmkRow, colWppTMK).setRichTextValue(rtWpp);
  }
}

function aplicarFormatoFilaSolicitudGenerada_(sheet, rowIndex, headerMap) {
  var colGenerar = COL_GENERAR;
  var colInicio = COL_INICIO_LINKS;
  sheet.getRange(rowIndex, colGenerar, 1, 1).setBackground("#f0fdf4");
  sheet.getRange(rowIndex, colInicio, 1, HEADERS_LINKS_SOLICITUDES.length).setBackground("#eff6ff");
  var colEstado = getCol_(headerMap, ALIASES.ESTADO_ENCUESTA);
  if (colEstado) sheet.getRange(rowIndex, colEstado).setBackground("#ecfeff");
}

function aplicarFormatoFilaTmk_(sheet, rowIndex) {
  var map = getHeaderMapFlexible_(sheet);
  sheet.getRange(rowIndex, 1, 1, Math.max(sheet.getLastColumn(), HEADERS_TMK.length))
    .setBackground(null)
    .setFontColor("#111827")
    .setVerticalAlignment("middle")
    .setWrap(true);
  pintarCeldaSiExiste_(sheet, rowIndex, map, "LINK_ENCUESTA", "#eff6ff");
  pintarCeldaSiExiste_(sheet, rowIndex, map, "ENVIAR WPP", "#eff6ff");
  pintarCeldaSiExiste_(sheet, rowIndex, map, "ESTADO_TMK", "#f8fafc");
  pintarCeldaSiExiste_(sheet, rowIndex, map, "ESTADO_ENCUESTA", "#f8fafc");
  pintarCeldaSiExiste_(sheet, rowIndex, map, "DECISION_FINAL", "#f8fafc");
}

function pintarCeldaSiExiste_(sheet, rowIndex, map, header, color) {
  var col = getCol_(map, header);
  if (col) sheet.getRange(rowIndex, col).setBackground(color);
}

/**************************************************************
 * OVERRIDE DE CABECERAS - PRIORIZAR LA PRIMERA COLUMNA VALIDA
 **************************************************************/

function getHeaderMapFlexible_(sheet) {
  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var exact = {};
  var normalized = {};
  for (var i = 0; i < headers.length; i++) {
    if (!headers[i]) continue;
    var raw = headers[i].toString().trim();
    var norm = normalizarHeader_(raw);
    if (!exact[raw]) exact[raw] = i + 1;
    if (!normalized[norm]) normalized[norm] = i + 1;
  }
  return { exact: exact, normalized: normalized, headers: headers };
}

/**************************************************************
 * OVERRIDE FINAL - BACKEND LIVIANO PARA WEB
 **************************************************************/

function buscarFilaPorToken(token) {
  if (!token) return null;

  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var config = SOLICITUDES_CONFIG[c];
    var sheet = getSheet(config.base);
    if (sheet.getLastRow() < 2) continue;

    var headerMap = getHeaderMapFlexible_(sheet);
    var tokenCol = getCol_(headerMap, ALIASES.TOKEN);
    if (!tokenCol) continue;

    var tokenValues = sheet.getRange(2, tokenCol, sheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < tokenValues.length; i++) {
      var rowToken = tokenValues[i][0];
      if (rowToken && rowToken.toString().trim() === token.toString().trim()) {
        var rowIndex = i + 2;
        var rowValues = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
        return {
          rowIndex: rowIndex,
          values: rowValues,
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
    var payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var action = payload.action;
    var backendSecret = payload.backendSecret;

    var correctSecret = PropertiesService.getScriptProperties().getProperty("BACKEND_SECRET");
    if (!correctSecret || backendSecret !== correctSecret) {
      return jsonResponse({ status: "ERROR", message: "No autorizado. Credenciales de backend incorrectas." });
    }

    if (action === "validarCliente") {
      return validarCliente(payload.token, payload.dni);
    }

    if (action === "guardarEncuesta") {
      ensureSheets();
      ensureHeaders();
      return guardarEncuesta(payload.token, payload.dni, payload.respuestas);
    }

    return jsonResponse({ status: "ERROR", message: "Accion no reconocida." });
  } catch (err) {
    registrarLog("SYSTEM", "", "ERROR", err.toString(), "Apps Script - doPost liviano");
    return jsonResponse({ status: "ERROR", message: "Excepcion en servidor: " + err.toString() });
  }
}

/**************************************************************
 * OVERRIDE FINAL - GUARDADO WEB RAPIDO
 **************************************************************/

function guardarRespuestaScoring(cliente, respuestas, scoring) {
  var sheet = getSheet("Respuestas_Scoring");
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, HEADERS_RESPUESTAS_SCORING.length).setValues([HEADERS_RESPUESTAS_SCORING]);
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idRespuesta = "R-" + Utilities.getUuid().slice(0, 8).toUpperCase();
  var fechaActual = new Date();
  var newRow = [];

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
    }
    newRow.push(val);
  }

  sheet.appendRow(newRow);
}

function volcarRespuestaEnTMK_(rowData, respuestas, scoring, canal) {
  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var targetRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap,
    getVal_(rowData.values, rowData.headerMap, ALIASES.ID_CLIENTE),
    getVal_(rowData.values, rowData.headerMap, ALIASES.TOKEN)
  );

  if (!targetRow) {
    var config = getConfigPorBase_(rowData.baseName);
    if (config) {
      targetRow = upsertFilaTMKDesdeSolicitud_(config, rowData.rowIndex);
      tmkMap = getHeaderMapFlexible_(tmkSheet);
    }
  }

  if (!targetRow) return;
  escribirRespuestasEnFilaTMK_(tmkSheet, targetRow, tmkMap, respuestas, scoring, canal);
  aplicarFormatoFilaTmk_(tmkSheet, targetRow);
}


/**************************************************************
 * OVERRIDE FINAL - CACHE VALIDACION + UX MAS AGIL
 **************************************************************/

function getTokenCacheKey_(token) {
  return "token_row::" + String(token || "").trim();
}

function buscarFilaPorToken(token) {
  if (!token) return null;

  var cache = CacheService.getScriptCache();
  var cacheKey = getTokenCacheKey_(token);
  var cached = cache.get(cacheKey);
  if (cached) {
    try {
      var meta = JSON.parse(cached);
      var config = getConfigPorBase_(meta.baseName);
      if (config) {
        var sheet = getSheet(config.base);
        if (meta.rowIndex >= 2 && meta.rowIndex <= sheet.getLastRow()) {
          var headerMap = getHeaderMapFlexible_(sheet);
          var rowValues = sheet.getRange(meta.rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
          var tokenCol = getCol_(headerMap, ALIASES.TOKEN);
          var rowToken = tokenCol ? rowValues[tokenCol - 1] : "";
          if (rowToken && rowToken.toString().trim() === token.toString().trim()) {
            return {
              rowIndex: meta.rowIndex,
              values: rowValues,
              headerMap: headerMap,
              sheet: sheet,
              baseName: config.base,
              tmkName: config.tmk,
              sucursal: config.sucursal
            };
          }
        }
      }
    } catch (e) {
      Logger.log("Cache token invalido: " + e);
    }
  }

  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var configSearch = SOLICITUDES_CONFIG[c];
    var searchSheet = getSheet(configSearch.base);
    if (searchSheet.getLastRow() < 2) continue;

    var searchMap = getHeaderMapFlexible_(searchSheet);
    var tokenColSearch = getCol_(searchMap, ALIASES.TOKEN);
    if (!tokenColSearch) continue;

    var tokenValues = searchSheet.getRange(2, tokenColSearch, searchSheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < tokenValues.length; i++) {
      var rowTokenSearch = tokenValues[i][0];
      if (rowTokenSearch && rowTokenSearch.toString().trim() === token.toString().trim()) {
        var foundRowIndex = i + 2;
        var foundValues = searchSheet.getRange(foundRowIndex, 1, 1, searchSheet.getLastColumn()).getValues()[0];
        cache.put(cacheKey, JSON.stringify({ baseName: configSearch.base, rowIndex: foundRowIndex }), 21600);
        return {
          rowIndex: foundRowIndex,
          values: foundValues,
          headerMap: searchMap,
          sheet: searchSheet,
          baseName: configSearch.base,
          tmkName: configSearch.tmk,
          sucursal: configSearch.sucursal
        };
      }
    }
  }
  return null;
}

/**************************************************************
 * OVERRIDE FINAL - MENU SIMPLE + REVALIDACION DE RECHAZADOS
 **************************************************************/

var CAMPOS_RESETEO_REVALIDACION_ = [
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
  "MOTIVO_DECISION",
  "FECHA_DECISION",
  "GESTIONADO_POR",
  "OBSERVACION_TMK",
  "FECHA_PROXIMO_CONTACTO",
  "FECHA_ULTIMO_ENVIO_WPP",
  "ULTIMO_CONTACTO_TMK"
];


function actualizarHojasTMKDesdeMenu() {
  mostrarToast(actualizarHojasTMK() + " " + actualizarVistasTMK_());
}

function regenerarLinkFilaSeleccionadaDesdeMenu() {
  mostrarToast(regenerarLinkFilaSeleccionada_());
}

function regenerarLinkFilaSeleccionada_() {
  ensureSheets();
  ensureHeaders();

  var activeSheet = SpreadsheetApp.getActiveSheet();
  var rowIndex = SpreadsheetApp.getActiveRange() ? SpreadsheetApp.getActiveRange().getRow() : 0;
  if (!activeSheet || rowIndex < 2) return "Seleccione una fila valida.";

  var sheetName = activeSheet.getName();
  if (sheetName !== "TMK - RECHAZADOS" && sheetName !== "TMK - JUJUY" && sheetName !== "TMK - SALTA") {
    return "Abra una fila en TMK o en TMK - RECHAZADOS para regenerar el link.";
  }

  var map = getHeaderMapFlexible_(activeSheet);
  var row = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];
  var idCliente = getVal_(row, map, "ID_CLIENTE");
  var token = getVal_(row, map, "TOKEN");
  var origen = buscarSolicitudPorIdToken_(idCliente, token);

  if (!origen) return "No encontre la solicitud original para esa fila.";

  var config = getConfigPorBase_(origen.baseName);
  if (!config) return "No pude identificar la sucursal de origen.";

  return regenerarLinkDesdeSolicitud_(origen, config, "RECHAZADO");
}

function regenerarLinkDesdeSolicitud_(rowData, config, motivo) {
  var sheet = rowData.sheet;
  var rowIndex = rowData.rowIndex;
  var headerMap = getHeaderMapFlexible_(sheet);
  var row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

  var nombre = getVal_(row, headerMap, ALIASES.NOMBRE);
  var telefono = getVal_(row, headerMap, ALIASES.TELEFONO);
  var dni = getVal_(row, headerMap, ALIASES.DNI);
  var solicitud = getVal_(row, headerMap, ALIASES.SOLICITUD);
  var tokenAnterior = getVal_(row, headerMap, ALIASES.TOKEN);

  if (!nombre || !telefono || !dni) {
    return "Faltan nombre, telefono o DNI en la solicitud original.";
  }

  var baseUrl = normalizarNetlifyBaseUrl();
  var nuevoToken = "T" + Utilities.getUuid().slice(0, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
  var idCliente = getVal_(row, headerMap, ALIASES.ID_CLIENTE) || construirIdCliente_(config.sucursal, solicitud, dni);
  var dniHash = getVal_(row, headerMap, ALIASES.DNI_HASH) || generarHashDniParaCarga(dni);
  var link = baseUrl + "?t=" + nuevoToken;
  var waLink = crearLinkWhatsApp_(telefono, nombre, link);
  var ahora = new Date();

  setVal_(sheet, rowIndex, headerMap, ALIASES.ID_CLIENTE, idCliente);
  setVal_(sheet, rowIndex, headerMap, ALIASES.TOKEN, nuevoToken);
  setVal_(sheet, rowIndex, headerMap, ALIASES.DNI_HASH, dniHash);
  setCeldaLinkEncuesta(sheet, rowIndex, getCol_(headerMap, ALIASES.LINK_ENCUESTA), link);
  if (waLink) setCeldaLinkWhatsApp(sheet, rowIndex, getCol_(headerMap, ALIASES.ENVIAR_WPP), waLink, nombre);
  setVal_(sheet, rowIndex, headerMap, ALIASES.ESTADO_ENCUESTA, "Link regenerado");
  setVal_(sheet, rowIndex, headerMap, ALIASES.FECHA_ENVIO_LINK, ahora);

  limpiarCamposRevalidacionEnFila_(sheet, rowIndex, headerMap);
  setVal_(sheet, rowIndex, headerMap, "CANTIDAD_INTENTOS_WPP", 0);

  var tmkRow = upsertFilaTMKDesdeSolicitud_(config, rowIndex);
  if (tmkRow) {
    var tmkSheet = getSheet(config.tmk);
    var tmkMap = getHeaderMapFlexible_(tmkSheet);
    limpiarCamposRevalidacionEnFila_(tmkSheet, tmkRow, tmkMap);
    setVal_(tmkSheet, tmkRow, tmkMap, "DECISION_FINAL", "PENDIENTE");
    setVal_(tmkSheet, tmkRow, tmkMap, "ESTADO_TMK", "Pendiente envio");
    setVal_(tmkSheet, tmkRow, tmkMap, "PROXIMA_ACCION", "Enviar WPP");
    setVal_(tmkSheet, tmkRow, tmkMap, "PRIORIDAD", "Alta");
    setVal_(tmkSheet, tmkRow, tmkMap, "CANTIDAD_INTENTOS_WPP", 0);
    setVal_(tmkSheet, tmkRow, tmkMap, "OBSERVACION_TMK", "Link regenerado por " + (motivo || "revalidacion") + ".");
    aplicarFormatoFilaTmk_(tmkSheet, tmkRow);
  }

  try {
    var cache = CacheService.getScriptCache();
    if (tokenAnterior) cache.remove(getTokenCacheKey_(tokenAnterior));
    cache.remove(getTokenCacheKey_(nuevoToken));
  } catch (e) {
    Logger.log("No se pudo limpiar cache de token: " + e);
  }

  actualizarVistasTMK_();
  return "Link regenerado. Use el nuevo WhatsApp para reenviar la validacion.";
}

function limpiarCamposRevalidacionEnFila_(sheet, rowIndex, map) {
  for (var i = 0; i < CAMPOS_RESETEO_REVALIDACION_.length; i++) {
    var col = getCol_(map, CAMPOS_RESETEO_REVALIDACION_[i]);
    if (col) sheet.getRange(rowIndex, col).clearContent();
  }

  setVal_(sheet, rowIndex, map, "DECISION_FINAL", "PENDIENTE");
  setVal_(sheet, rowIndex, map, "MOTIVO_DECISION", "");
  setVal_(sheet, rowIndex, map, "FECHA_DECISION", "");
  setVal_(sheet, rowIndex, map, "RESULTADO_SCORING", "");
  setVal_(sheet, rowIndex, map, "MOTIVO_RESULTADO", "");
  setVal_(sheet, rowIndex, map, "REQUIERE_RECONTACTO", "");
  setVal_(sheet, rowIndex, map, "AREA_A_REVISAR", "");
}

/**************************************************************
 * OVERRIDE FINAL - CONTADOR DE REVALIDACIONES VISIBLE
 **************************************************************/

function obtenerCantidadRevalidaciones_(texto) {
  var raw = String(texto || "");
  var match = raw.match(/Revalidado\s+(\d+)\s+ve/i);
  if (match) return parseInt(match[1], 10) || 0;
  return 0;
}

function construirTextoRevalidacion_(cantidad, motivo) {
  var veces = cantidad === 1 ? "vez" : "veces";
  return "Revalidado " + cantidad + " " + veces + ". Motivo: " + (motivo || "revalidacion") + ".";
}

function regenerarLinkDesdeSolicitud_(rowData, config, motivo) {
  var sheet = rowData.sheet;
  var rowIndex = rowData.rowIndex;
  var headerMap = getHeaderMapFlexible_(sheet);
  var row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

  var nombre = getVal_(row, headerMap, ALIASES.NOMBRE);
  var telefono = getVal_(row, headerMap, ALIASES.TELEFONO);
  var dni = getVal_(row, headerMap, ALIASES.DNI);
  var solicitud = getVal_(row, headerMap, ALIASES.SOLICITUD);
  var tokenAnterior = getVal_(row, headerMap, ALIASES.TOKEN);

  if (!nombre || !telefono || !dni) {
    return "Faltan nombre, telefono o DNI en la solicitud original.";
  }

  var baseUrl = normalizarNetlifyBaseUrl();
  var nuevoToken = "T" + Utilities.getUuid().slice(0, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
  var idCliente = getVal_(row, headerMap, ALIASES.ID_CLIENTE) || construirIdCliente_(config.sucursal, solicitud, dni);
  var dniHash = getVal_(row, headerMap, ALIASES.DNI_HASH) || generarHashDniParaCarga(dni);
  var link = baseUrl + "?t=" + nuevoToken;
  var waLink = crearLinkWhatsApp_(telefono, nombre, link);
  var ahora = new Date();

  setVal_(sheet, rowIndex, headerMap, ALIASES.ID_CLIENTE, idCliente);
  setVal_(sheet, rowIndex, headerMap, ALIASES.TOKEN, nuevoToken);
  setVal_(sheet, rowIndex, headerMap, ALIASES.DNI_HASH, dniHash);
  setCeldaLinkEncuesta(sheet, rowIndex, getCol_(headerMap, ALIASES.LINK_ENCUESTA), link);
  if (waLink) setCeldaLinkWhatsApp(sheet, rowIndex, getCol_(headerMap, ALIASES.ENVIAR_WPP), waLink, nombre);
  setVal_(sheet, rowIndex, headerMap, ALIASES.ESTADO_ENCUESTA, "Link regenerado");
  setVal_(sheet, rowIndex, headerMap, ALIASES.FECHA_ENVIO_LINK, ahora);

  limpiarCamposRevalidacionEnFila_(sheet, rowIndex, headerMap);
  setVal_(sheet, rowIndex, headerMap, "CANTIDAD_INTENTOS_WPP", 0);

  var tmkRow = upsertFilaTMKDesdeSolicitud_(config, rowIndex);
  if (tmkRow) {
    var tmkSheet = getSheet(config.tmk);
    var tmkMap = getHeaderMapFlexible_(tmkSheet);
    var filaTmkActual = tmkSheet.getRange(tmkRow, 1, 1, tmkSheet.getLastColumn()).getValues()[0];
    var observacionAnterior = getVal_(filaTmkActual, tmkMap, "OBSERVACION_TMK");
    var cantidadRevalidaciones = obtenerCantidadRevalidaciones_(observacionAnterior) + 1;

    limpiarCamposRevalidacionEnFila_(tmkSheet, tmkRow, tmkMap);
    setVal_(tmkSheet, tmkRow, tmkMap, "DECISION_FINAL", "PENDIENTE");
    setVal_(tmkSheet, tmkRow, tmkMap, "ESTADO_TMK", "Pendiente envio");
    setVal_(tmkSheet, tmkRow, tmkMap, "PROXIMA_ACCION", "Enviar WPP");
    setVal_(tmkSheet, tmkRow, tmkMap, "PRIORIDAD", "Alta");
    setVal_(tmkSheet, tmkRow, tmkMap, "CANTIDAD_INTENTOS_WPP", 0);
    setVal_(tmkSheet, tmkRow, tmkMap, "OBSERVACION_TMK", construirTextoRevalidacion_(cantidadRevalidaciones, motivo));
    aplicarFormatoFilaTmk_(tmkSheet, tmkRow);
  }

  try {
    var cache = CacheService.getScriptCache();
    if (tokenAnterior) cache.remove(getTokenCacheKey_(tokenAnterior));
    cache.remove(getTokenCacheKey_(nuevoToken));
  } catch (e) {
    Logger.log("No se pudo limpiar cache de token: " + e);
  }

  actualizarVistasTMK_();
  return "Link regenerado. Use el nuevo WhatsApp para reenviar la validacion.";
}

/**************************************************************
 * OVERRIDE FINAL - MODO LLAMADA INTERNO
 **************************************************************/

HEADERS_TMK = [
  "SUCURSAL",
  "FECHA",
  "MES",
  "NOMBRE Y APELLIDO",
  "Nº",
  "TELEFONO",
  "Modelo suscripto/ plan",
  "PLAN_AUTO",
  "DNI",
  "FINANCIA_AUTO",
  "MAIL",
  "LICITA_AUTO",
  "CTA_AUTO",
  "NOMBRE DEL VENDEDOR",
  "LINK_ENCUESTA",
  "ENVIAR WPP",
  "ABRIR_LLAMADA",
  "ESTADO_TMK",
  "ESTADO_ENCUESTA",
  "TIPO DE PAGO",
  "FECHA_ENVIO_LINK",
  "DECISION_FINAL",
  "N° DE SOLICITUD",
  "N° DE CLIENTE",
  "PROXIMA_ACCION",
  "CUOTA 2",
  "FECHA_PROXIMO_CONTACTO",
  "OBSERVACION_TMK",
  "ID_CLIENTE",
  "RESULTADO_SCORING",
  "TOKEN",
  "MOTIVO_RESULTADO",
  "DNI_HASH",
  "REQUIERE_RECONTACTO",
  "AREA_A_REVISAR",
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
  "OBSERVACION_INTERNA",
  "FECHA_RESPUESTA_WEB",
  "FECHA_REALIZACION_SCORING",
  "CANAL_SCORING",
  "MOTIVO_DECISION",
  "FECHA_DECISION",
  "GESTIONADO_POR",
  "PRIORIDAD",
  "FECHA_ULTIMO_ENVIO_WPP",
  "CANTIDAD_INTENTOS_WPP",
  "ULTIMO_CONTACTO_TMK"
];


function construirTextoBotonLlamada_() {
  return "Cargar llamada";
}

function crearLinkLlamada_(token) {
  if (!token) return "";
  return normalizarNetlifyBaseUrl() + "call.html?t=" + encodeURIComponent(String(token).trim());
}

function setCeldaLinkLlamada_(sheet, rowIndex, colIndex, url) {
  if (!colIndex || !url) return;
  var richText = SpreadsheetApp.newRichTextValue()
    .setText(construirTextoBotonLlamada_())
    .setLinkUrl(url)
    .build();
  sheet.getRange(rowIndex, colIndex).setRichTextValue(richText);
}

function abrirLlamadaFilaSeleccionadaDesdeMenu() {
  mostrarToast(abrirLlamadaFilaSeleccionada_());
}

function abrirLlamadaFilaSeleccionada_() {
  ensureSheets();
  ensureHeaders();

  var activeSheet = SpreadsheetApp.getActiveSheet();
  var activeRange = SpreadsheetApp.getActiveRange();
  var rowIndex = activeRange ? activeRange.getRow() : 0;
  if (!activeSheet || rowIndex < 2) return "Seleccione una fila valida.";

  var sheetName = activeSheet.getName();
  var token = "";

  if (sheetName === "SOLICITUDES JUJUY" || sheetName === "SOLICITUDES SALTA") {
    var config = getConfigPorBase_(sheetName);
    if (!config) return "No pude identificar la hoja de solicitudes.";
    procesarFilaSolicitudRapida_(activeSheet, rowIndex, config);
    var mapSol = getHeaderMapFlexible_(activeSheet);
    var rowSol = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];
    token = getVal_(rowSol, mapSol, ALIASES.TOKEN);
  } else {
    var map = getHeaderMapFlexible_(activeSheet);
    var row = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];
    token = getVal_(row, map, "TOKEN");
    if (!token) {
      var idCliente = getVal_(row, map, "ID_CLIENTE");
      var origen = buscarSolicitudPorIdToken_(idCliente, token);
      if (origen) token = getVal_(origen.values, origen.headerMap, ALIASES.TOKEN);
    }
  }

  if (!token) return "No se encontro un token para abrir la llamada.";

  var link = crearLinkLlamada_(token);
  mostrarDialogoLink_(link, "Abrir llamada interna");
  return "Se preparo el acceso de llamada para la fila seleccionada.";
}

function mostrarDialogoLink_(url, titulo) {
  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;padding:16px">' +
    '<h3 style="margin-top:0">' + (titulo || 'Abrir enlace') + '</h3>' +
    '<p>Haga clic para abrir el formulario:</p>' +
    '<p><a href="' + url + '" target="_blank" style="display:inline-block;background:#5A5A40;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">Abrir formulario</a></p>' +
    '<p style="font-size:12px;color:#666;word-break:break-all">' + url + '</p>' +
    '</div>'
  ).setWidth(420).setHeight(220);
  SpreadsheetApp.getUi().showModalDialog(html, titulo || "Abrir formulario");
}

function construirFilaTMK_(config, baseRow, baseMap, existing) {
  var row = [];
  var analisisPlan = analizarPlanAuto_(getVal_(baseRow, baseMap, ALIASES.MODELO));

  for (var i = 0; i < HEADERS_TMK.length; i++) {
    var h = HEADERS_TMK[i];
    var val = "";
    switch (h) {
      case "SUCURSAL": val = config.sucursal; break;
      case "FECHA": val = getVal_(baseRow, baseMap, ALIASES.FECHA); break;
      case "MES": val = getVal_(baseRow, baseMap, ALIASES.MES); break;
      case "NOMBRE Y APELLIDO": val = getVal_(baseRow, baseMap, ALIASES.NOMBRE); break;
      case "Nº": val = getVal_(baseRow, baseMap, ALIASES.NRO); break;
      case "TELEFONO": val = getVal_(baseRow, baseMap, ALIASES.TELEFONO); break;
      case "Modelo suscripto/ plan": val = getVal_(baseRow, baseMap, ALIASES.MODELO); break;
      case "PLAN_AUTO": val = analisisPlan.plan || ""; break;
      case "DNI": val = getVal_(baseRow, baseMap, ALIASES.DNI); break;
      case "FINANCIA_AUTO": val = analisisPlan.financia || ""; break;
      case "MAIL": val = getVal_(baseRow, baseMap, ALIASES.MAIL); break;
      case "LICITA_AUTO": val = analisisPlan.licita || ""; break;
      case "CTA_AUTO": val = analisisPlan.cta || ""; break;
      case "NOMBRE DEL VENDEDOR": val = getVal_(baseRow, baseMap, ALIASES.VENDEDOR); break;
      case "LINK_ENCUESTA": val = construirTextoBotonEncuesta(); break;
      case "ENVIAR WPP": val = construirTextoBotonWhatsApp(getVal_(baseRow, baseMap, ALIASES.NOMBRE)); break;
      case "ABRIR_LLAMADA": val = construirTextoBotonLlamada_(); break;
      case "ESTADO_TMK": val = existing[h] || estadoTmkDefaultDesdeBase_(baseRow, baseMap); break;
      case "ESTADO_ENCUESTA": val = getVal_(baseRow, baseMap, ALIASES.ESTADO_ENCUESTA); break;
      case "TIPO DE PAGO": val = getVal_(baseRow, baseMap, ALIASES.TIPO_PAGO); break;
      case "FECHA_ENVIO_LINK": val = getVal_(baseRow, baseMap, ALIASES.FECHA_ENVIO_LINK); break;
      case "DECISION_FINAL": val = existing[h] || "PENDIENTE"; break;
      case "N° DE SOLICITUD": val = getVal_(baseRow, baseMap, ALIASES.SOLICITUD); break;
      case "N° DE CLIENTE": val = getVal_(baseRow, baseMap, ALIASES.NRO_CLIENTE); break;
      case "PROXIMA_ACCION": val = existing[h] || proximaAccionDefaultDesdeBase_(baseRow, baseMap); break;
      case "CUOTA 2": val = getVal_(baseRow, baseMap, ALIASES.CUOTA_2); break;
      case "FECHA_PROXIMO_CONTACTO": val = existing[h] || ""; break;
      case "OBSERVACION_TMK": val = existing[h] || ""; break;
      case "ID_CLIENTE": val = getVal_(baseRow, baseMap, ALIASES.ID_CLIENTE); break;
      case "RESULTADO_SCORING": val = existing[h] || ""; break;
      case "TOKEN": val = getVal_(baseRow, baseMap, ALIASES.TOKEN); break;
      case "MOTIVO_RESULTADO": val = existing[h] || ""; break;
      case "DNI_HASH": val = getVal_(baseRow, baseMap, ALIASES.DNI_HASH); break;
      case "REQUIERE_RECONTACTO": val = existing[h] || ""; break;
      case "AREA_A_REVISAR": val = existing[h] || ""; break;
      case "OBSERVACION_INTERNA": val = existing[h] || ""; break;
      case "FECHA_RESPUESTA_WEB": val = existing[h] || ""; break;
      case "FECHA_REALIZACION_SCORING": val = existing[h] || ""; break;
      case "CANAL_SCORING": val = existing[h] || ""; break;
      case "MOTIVO_DECISION": val = existing[h] || ""; break;
      case "FECHA_DECISION": val = existing[h] || ""; break;
      case "GESTIONADO_POR": val = existing[h] || ""; break;
      case "PRIORIDAD": val = existing[h] || "Media"; break;
      case "FECHA_ULTIMO_ENVIO_WPP": val = existing[h] || ""; break;
      case "CANTIDAD_INTENTOS_WPP": val = existing[h] || 0; break;
      case "ULTIMO_CONTACTO_TMK": val = existing[h] || ""; break;
      default: val = existing[h] || "";
    }
    row.push(val);
  }

  return row;
}

function restaurarRichTextFilaTMKDesdeSolicitud_(baseSheet, baseMap, baseRow, tmkSheet, tmkRow) {
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var colEncuestaTMK = getCol_(tmkMap, "LINK_ENCUESTA");
  var colWppTMK = getCol_(tmkMap, "ENVIAR WPP");
  var colLlamadaTMK = getCol_(tmkMap, "ABRIR_LLAMADA");
  var colEncuestaBase = getCol_(baseMap, ALIASES.LINK_ENCUESTA);
  var colWppBase = getCol_(baseMap, ALIASES.ENVIAR_WPP);

  if (colEncuestaBase && colEncuestaTMK) {
    var rtEncuesta = baseSheet.getRange(baseRow, colEncuestaBase).getRichTextValue();
    if (rtEncuesta && rtEncuesta.getLinkUrl()) tmkSheet.getRange(tmkRow, colEncuestaTMK).setRichTextValue(rtEncuesta);
  }

  if (colWppBase && colWppTMK) {
    var rtWpp = baseSheet.getRange(baseRow, colWppBase).getRichTextValue();
    if (rtWpp && rtWpp.getLinkUrl()) tmkSheet.getRange(tmkRow, colWppTMK).setRichTextValue(rtWpp);
  }

  if (colLlamadaTMK) {
    var token = getVal_(baseSheet.getRange(baseRow, 1, 1, baseSheet.getLastColumn()).getValues()[0], baseMap, ALIASES.TOKEN);
    var linkLlamada = crearLinkLlamada_(token);
    if (linkLlamada) setCeldaLinkLlamada_(tmkSheet, tmkRow, colLlamadaTMK, linkLlamada);
  }
}

function formatearHojasTMK_() {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    var sheet = getSheet(SOLICITUDES_CONFIG[i].tmk);
    var lastRow = Math.max(sheet.getLastRow(), 1);
    var lastCol = Math.max(sheet.getLastColumn(), HEADERS_TMK.length);
    var map = getHeaderMapFlexible_(sheet);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, lastCol).setFontWeight("bold").setFontColor("#ffffff").setBackground("#0f172a").setHorizontalAlignment("center");
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, lastCol).setBackground(null).setFontColor("#111827").setVerticalAlignment("middle").setWrap(true);
    setWidthIfExists_(sheet, map, "LINK_ENCUESTA", 120);
    setWidthIfExists_(sheet, map, "ENVIAR WPP", 150);
    setWidthIfExists_(sheet, map, "ABRIR_LLAMADA", 140);
    setWidthIfExists_(sheet, map, "ESTADO_TMK", 130);
    setWidthIfExists_(sheet, map, "ESTADO_ENCUESTA", 130);
    setWidthIfExists_(sheet, map, "DECISION_FINAL", 120);
    setWidthIfExists_(sheet, map, "MOTIVO_RESULTADO", 320);
    setWidthIfExists_(sheet, map, "OBSERVACION_INTERNA", 280);
    setWidthIfExists_(sheet, map, "OBSERVACION_TMK", 280);
    pintarColumnaTMK_(sheet, map, "LINK_ENCUESTA", "#eff6ff");
    pintarColumnaTMK_(sheet, map, "ENVIAR WPP", "#eff6ff");
    pintarColumnaTMK_(sheet, map, "ABRIR_LLAMADA", "#ecfccb");
    pintarColumnaTMK_(sheet, map, "ESTADO_TMK", "#f8fafc");
    pintarColumnaTMK_(sheet, map, "ESTADO_ENCUESTA", "#f8fafc");
    pintarColumnaTMK_(sheet, map, "DECISION_FINAL", "#f8fafc");
    aplicarValidacionDecision_(sheet, map);
    aplicarValidacionEstadoTMK_(sheet, map);
    aplicarFormatoDecision_(sheet, map);
    aplicarFormatoEstadoTMK_(sheet, map);
    var tokenCol = getCol_(map, "TOKEN");
    var hashCol = getCol_(map, "DNI_HASH");
    var idCol = getCol_(map, "ID_CLIENTE");
    if (tokenCol) sheet.hideColumns(tokenCol);
    if (hashCol) sheet.hideColumns(hashCol);
    if (idCol) sheet.hideColumns(idCol);
  }
}

function construirRespuestasGuardadasDesdeRow_(row, map) {
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

function cargarLlamada(token) {
  var rowData = buscarFilaPorToken(token);
  if (!rowData) return jsonResponse({ status: "TOKEN_INVALIDO", message: "No se encontro la solicitud." });

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || "");
  if (estadoEncuesta === "Respondido" || estadoEncuesta === "Scoring telefonico") {
    return jsonResponse({ status: "YA_RESPONDIO", message: "Esta gestion ya fue cerrada." });
  }

  var clienteSeguro = {
    nombre: getVal_(rowValues, headerMap, ALIASES.NOMBRE),
    modelo: getVal_(rowValues, headerMap, ALIASES.MODELO),
    asesor: getVal_(rowValues, headerMap, ALIASES.VENDEDOR),
    montoCuota2: getVal_(rowValues, headerMap, ALIASES.CUOTA_2),
    medioPagoPrevisto: getVal_(rowValues, headerMap, ALIASES.TIPO_PAGO),
    telefono: getVal_(rowValues, headerMap, ALIASES.TELEFONO),
    solicitud: getVal_(rowValues, headerMap, ALIASES.SOLICITUD),
    sucursal: rowData.sucursal,
    planAuto: (analizarPlanAuto_(getVal_(rowValues, headerMap, ALIASES.MODELO)) || {}).plan || ""
  };

  var respuestas = {};
  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var tmkRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap, getVal_(rowValues, headerMap, ALIASES.ID_CLIENTE), token);
  if (tmkRow) {
    var filaTmk = tmkSheet.getRange(tmkRow, 1, 1, tmkSheet.getLastColumn()).getValues()[0];
    respuestas = construirRespuestasGuardadasDesdeRow_(filaTmk, tmkMap);
  }

  return jsonResponse({
    status: "OK",
    cliente: clienteSeguro,
    preguntas: construirPreguntasFrontend_(clienteSeguro),
    respuestas: respuestas
  });
}


function doPost(e) {
  try {
    var payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var action = payload.action;
    var backendSecret = payload.backendSecret;

    var correctSecret = PropertiesService.getScriptProperties().getProperty("BACKEND_SECRET");
    if (!correctSecret || backendSecret !== correctSecret) {
      return jsonResponse({ status: "ERROR", message: "No autorizado. Credenciales de backend incorrectas." });
    }

    if (action === "validarCliente") return validarCliente(payload.token, payload.dni);
    if (action === "guardarEncuesta") return guardarEncuesta(payload.token, payload.dni, payload.respuestas);
    if (action === "cargarLlamada") return cargarLlamada(payload.token);
    if (action === "guardarLlamada") return guardarLlamada(payload.token, payload.respuestas);

    return jsonResponse({ status: "ERROR", message: "Accion no reconocida." });
  } catch (err) {
    registrarLog("SYSTEM", "", "ERROR", err.toString(), "Apps Script - doPost llamada");
    return jsonResponse({ status: "ERROR", message: "Excepcion en servidor: " + err.toString() });
  }
}

/**************************************************************
 * OVERRIDE FINAL - LIMPIAR VALIDACIONES VIEJAS EN TMK
 **************************************************************/

function limpiarValidacionesTMK_(sheet) {
  var lastRow = Math.max(sheet.getMaxRows(), 2);
  var lastCol = Math.max(sheet.getLastColumn(), HEADERS_TMK.length);
  if (lastRow > 1 && lastCol > 0) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearDataValidations();
  }
}

function formatearHojasTMK_() {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    var sheet = getSheet(SOLICITUDES_CONFIG[i].tmk);
    var lastRow = Math.max(sheet.getLastRow(), 1);
    var lastCol = Math.max(sheet.getLastColumn(), HEADERS_TMK.length);
    var map = getHeaderMapFlexible_(sheet);

    limpiarValidacionesTMK_(sheet);

    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, lastCol).setFontWeight("bold").setFontColor("#ffffff").setBackground("#0f172a").setHorizontalAlignment("center");
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, lastCol).setBackground(null).setFontColor("#111827").setVerticalAlignment("middle").setWrap(true);
    setWidthIfExists_(sheet, map, "LINK_ENCUESTA", 120);
    setWidthIfExists_(sheet, map, "ENVIAR WPP", 150);
    setWidthIfExists_(sheet, map, "ABRIR_LLAMADA", 140);
    setWidthIfExists_(sheet, map, "ESTADO_TMK", 130);
    setWidthIfExists_(sheet, map, "ESTADO_ENCUESTA", 130);
    setWidthIfExists_(sheet, map, "DECISION_FINAL", 120);
    setWidthIfExists_(sheet, map, "MOTIVO_RESULTADO", 320);
    setWidthIfExists_(sheet, map, "OBSERVACION_INTERNA", 280);
    setWidthIfExists_(sheet, map, "OBSERVACION_TMK", 280);
    pintarColumnaTMK_(sheet, map, "LINK_ENCUESTA", "#eff6ff");
    pintarColumnaTMK_(sheet, map, "ENVIAR WPP", "#eff6ff");
    pintarColumnaTMK_(sheet, map, "ABRIR_LLAMADA", "#ecfccb");
    pintarColumnaTMK_(sheet, map, "ESTADO_TMK", "#f8fafc");
    pintarColumnaTMK_(sheet, map, "ESTADO_ENCUESTA", "#f8fafc");
    pintarColumnaTMK_(sheet, map, "DECISION_FINAL", "#f8fafc");
    aplicarValidacionDecision_(sheet, map);
    aplicarValidacionEstadoTMK_(sheet, map);
    aplicarFormatoDecision_(sheet, map);
    aplicarFormatoEstadoTMK_(sheet, map);
    var tokenCol = getCol_(map, "TOKEN");
    var hashCol = getCol_(map, "DNI_HASH");
    var idCol = getCol_(map, "ID_CLIENTE");
    if (tokenCol) sheet.hideColumns(tokenCol);
    if (hashCol) sheet.hideColumns(hashCol);
    if (idCol) sheet.hideColumns(idCol);
  }
}

/**************************************************************
 * OVERRIDE FINAL - SIDEBAR DE LLAMADA INTERNA EN SHEETS
 **************************************************************/


function abrirLlamadaFilaSeleccionadaDesdeMenu() {
  mostrarToast(abrirLlamadaSidebarDesdeSeleccion_());
}

function abrirLlamadaSidebarDesdeSeleccion_() {
  ensureSheets();
  ensureHeaders();

  var token = obtenerTokenDesdeFilaSeleccionada_();
  if (!token) return "No se pudo obtener el token de la fila seleccionada.";

  var template = HtmlService.createTemplateFromFile("LlamadaSidebar");
  template.token = token;
  var html = template.evaluate().setTitle("Scoring por llamada").setWidth(420);
  SpreadsheetApp.getUi().showSidebar(html);
  return "Panel de llamada abierto.";
}

function obtenerTokenDesdeFilaSeleccionada_() {
  var activeSheet = SpreadsheetApp.getActiveSheet();
  var activeRange = SpreadsheetApp.getActiveRange();
  var rowIndex = activeRange ? activeRange.getRow() : 0;
  if (!activeSheet || rowIndex < 2) return "";

  var sheetName = activeSheet.getName();
  var token = "";

  if (sheetName === "SOLICITUDES JUJUY" || sheetName === "SOLICITUDES SALTA") {
    var config = getConfigPorBase_(sheetName);
    if (!config) return "";
    procesarFilaSolicitudRapida_(activeSheet, rowIndex, config);
    var mapSol = getHeaderMapFlexible_(activeSheet);
    var rowSol = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];
    token = getVal_(rowSol, mapSol, ALIASES.TOKEN);
  } else {
    var map = getHeaderMapFlexible_(activeSheet);
    var row = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];
    token = getVal_(row, map, "TOKEN");

    if (!token) {
      var idCliente = getVal_(row, map, "ID_CLIENTE");
      var origen = buscarSolicitudPorIdToken_(idCliente, "");
      if (origen) token = getVal_(origen.values, origen.headerMap, ALIASES.TOKEN);
    }
  }

  return token ? String(token).trim() : "";
}

function obtenerDatosLlamada_(token) {
  var rowData = buscarFilaPorToken(token);
  if (!rowData) return { status: "TOKEN_INVALIDO", message: "No se encontro la solicitud." };

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || "");
  if (estadoEncuesta === "Respondido" || estadoEncuesta === "Scoring telefonico") {
    return { status: "YA_RESPONDIO", message: "Esta gestion ya fue cerrada." };
  }

  var clienteSeguro = {
    nombre: getVal_(rowValues, headerMap, ALIASES.NOMBRE),
    modelo: getVal_(rowValues, headerMap, ALIASES.MODELO),
    asesor: getVal_(rowValues, headerMap, ALIASES.VENDEDOR),
    montoCuota2: getVal_(rowValues, headerMap, ALIASES.CUOTA_2),
    medioPagoPrevisto: getVal_(rowValues, headerMap, ALIASES.TIPO_PAGO),
    telefono: getVal_(rowValues, headerMap, ALIASES.TELEFONO),
    solicitud: getVal_(rowValues, headerMap, ALIASES.SOLICITUD),
    sucursal: rowData.sucursal,
    planAuto: (analizarPlanAuto_(getVal_(rowValues, headerMap, ALIASES.MODELO)) || {}).plan || ""
  };

  var respuestas = {};
  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var tmkRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap, getVal_(rowValues, headerMap, ALIASES.ID_CLIENTE), token);
  if (tmkRow) {
    var filaTmk = tmkSheet.getRange(tmkRow, 1, 1, tmkSheet.getLastColumn()).getValues()[0];
    respuestas = construirRespuestasGuardadasDesdeRow_(filaTmk, tmkMap);
  }

  return {
    status: "OK",
    cliente: clienteSeguro,
    preguntas: construirPreguntasFrontend_(clienteSeguro),
    respuestas: respuestas
  };
}


function cargarLlamadaSidebar(token) {
  return obtenerDatosLlamada_(token);
}


function cargarLlamada(token) {
  return jsonResponse(obtenerDatosLlamada_(token));
}


function doPost(e) {
  try {
    var payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var action = payload.action;
    var backendSecret = payload.backendSecret;

    var correctSecret = PropertiesService.getScriptProperties().getProperty("BACKEND_SECRET");
    if (!correctSecret || backendSecret !== correctSecret) {
      return jsonResponse({ status: "ERROR", message: "No autorizado. Credenciales de backend incorrectas." });
    }

    if (action === "validarCliente") return validarCliente(payload.token, payload.dni);
    if (action === "guardarEncuesta") return guardarEncuesta(payload.token, payload.dni, payload.respuestas);
    if (action === "cargarLlamada") return cargarLlamada(payload.token);
    if (action === "guardarLlamada") return guardarLlamada(payload.token, payload.respuestas);

    return jsonResponse({ status: "ERROR", message: "Accion no reconocida." });
  } catch (err) {
    registrarLog("SYSTEM", "", "ERROR", err.toString(), "Apps Script - doPost sidebar llamada");
    return jsonResponse({ status: "ERROR", message: "Excepcion en servidor: " + err.toString() });
  }
}

/**************************************************************
 * OVERRIDE FINAL - LLAMADA EN VENTANA FLOTANTE
 **************************************************************/


function abrirLlamadaModalDesdeSeleccionMenu() {
  mostrarToast(abrirLlamadaModalDesdeSeleccion_());
}

function abrirLlamadaModalDesdeSeleccion_() {
  ensureSheets();
  ensureHeaders();

  var token = obtenerTokenDesdeFilaSeleccionada_();
  if (!token) return "No se pudo obtener el token de la fila seleccionada.";

  var template = HtmlService.createTemplateFromFile("LlamadaSidebar");
  template.token = token;
  var html = template.evaluate()
    .setTitle("Scoring por llamada")
    .setWidth(760)
    .setHeight(840);

  SpreadsheetApp.getUi().showModalDialog(html, "Scoring por llamada");
  return "Ventana de llamada abierta.";
}

function abrirLlamadaFilaSeleccionadaDesdeMenu() {
  return abrirLlamadaModalDesdeSeleccionMenu();
}

function abrirLlamadaSidebarDesdeSeleccion_() {
  return abrirLlamadaModalDesdeSeleccion_();
}

/**************************************************************
 * OVERRIDE FINAL - CONTEXTO COMPLETO PARA LLAMADA INTERNA
 **************************************************************/

function obtenerContextoFilaSeleccionada_() {
  var activeSheet = SpreadsheetApp.getActiveSheet();
  var activeRange = SpreadsheetApp.getActiveRange();
  var rowIndex = activeRange ? activeRange.getRow() : 0;
  if (!activeSheet || rowIndex < 2) return null;

  var sheetName = activeSheet.getName();
  var token = "";
  var idCliente = "";
  var baseName = "";

  if (sheetName === "SOLICITUDES JUJUY" || sheetName === "SOLICITUDES SALTA") {
    var config = getConfigPorBase_(sheetName);
    if (!config) return null;
    procesarFilaSolicitudRapida_(activeSheet, rowIndex, config);
    var mapSol = getHeaderMapFlexible_(activeSheet);
    var rowSol = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];
    token = getVal_(rowSol, mapSol, ALIASES.TOKEN);
    idCliente = getVal_(rowSol, mapSol, ALIASES.ID_CLIENTE);
    baseName = sheetName;
  } else {
    var map = getHeaderMapFlexible_(activeSheet);
    var row = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];
    token = getVal_(row, map, "TOKEN");
    idCliente = getVal_(row, map, "ID_CLIENTE");

    var origen = buscarSolicitudPorIdToken_(idCliente, token);
    if (origen) {
      baseName = origen.baseName;
      token = token || getVal_(origen.values, origen.headerMap, ALIASES.TOKEN);
      idCliente = idCliente || getVal_(origen.values, origen.headerMap, ALIASES.ID_CLIENTE);
    }
  }

  return {
    token: token ? String(token).trim() : "",
    idCliente: idCliente ? String(idCliente).trim() : "",
    activeSheetName: sheetName,
    activeRow: rowIndex,
    baseName: baseName
  };
}

function buscarFilaDesdeContexto_(context) {
  context = context || {};
  var token = String(context.token || "").trim();
  var idCliente = String(context.idCliente || "").trim();
  var baseName = String(context.baseName || "").trim();

  if (token) {
    var byToken = buscarFilaPorToken(token);
    if (byToken) return byToken;
  }

  if (idCliente || token) {
    var byId = buscarSolicitudPorIdToken_(idCliente, token);
    if (byId) return byId;
  }

  if (baseName && context.activeRow) {
    var config = getConfigPorBase_(baseName);
    if (config) {
      var sheet = getSheet(config.base);
      if (context.activeRow >= 2 && context.activeRow <= sheet.getLastRow()) {
        return {
          rowIndex: context.activeRow,
          values: sheet.getRange(context.activeRow, 1, 1, sheet.getLastColumn()).getValues()[0],
          headerMap: getHeaderMapFlexible_(sheet),
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

function abrirLlamadaModalDesdeSeleccion_() {
  ensureSheets();
  ensureHeaders();

  var context = obtenerContextoFilaSeleccionada_();
  if (!context || (!context.token && !context.idCliente)) return "No se pudo obtener el cliente de la fila seleccionada.";

  var template = HtmlService.createTemplateFromFile("LlamadaSidebar");
  template.context = context;
  var html = template.evaluate().setTitle("Scoring por llamada").setWidth(760).setHeight(840);
  SpreadsheetApp.getUi().showModalDialog(html, "Scoring por llamada");
  return "Ventana de llamada abierta.";
}

function obtenerDatosLlamada_(context) {
  var rowData = (typeof context === "string") ? buscarFilaPorToken(context) : buscarFilaDesdeContexto_(context);
  if (!rowData) return { status: "TOKEN_INVALIDO", message: "No se encontro la solicitud." };

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || "");
  if (estadoEncuesta === "Respondido" || estadoEncuesta === "Scoring telefonico") {
    return { status: "YA_RESPONDIO", message: "Esta gestion ya fue cerrada." };
  }

  var clienteSeguro = {
    nombre: getVal_(rowValues, headerMap, ALIASES.NOMBRE),
    modelo: getVal_(rowValues, headerMap, ALIASES.MODELO),
    asesor: getVal_(rowValues, headerMap, ALIASES.VENDEDOR),
    montoCuota2: getVal_(rowValues, headerMap, ALIASES.CUOTA_2),
    medioPagoPrevisto: getVal_(rowValues, headerMap, ALIASES.TIPO_PAGO),
    telefono: getVal_(rowValues, headerMap, ALIASES.TELEFONO),
    solicitud: getVal_(rowValues, headerMap, ALIASES.SOLICITUD),
    sucursal: rowData.sucursal,
    planAuto: (analizarPlanAuto_(getVal_(rowValues, headerMap, ALIASES.MODELO)) || {}).plan || ""
  };

  var respuestas = {};
  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var tmkRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap, getVal_(rowValues, headerMap, ALIASES.ID_CLIENTE), getVal_(rowValues, headerMap, ALIASES.TOKEN));
  if (tmkRow) {
    var filaTmk = tmkSheet.getRange(tmkRow, 1, 1, tmkSheet.getLastColumn()).getValues()[0];
    respuestas = construirRespuestasGuardadasDesdeRow_(filaTmk, tmkMap);
  }

  return {
    status: "OK",
    cliente: clienteSeguro,
    preguntas: construirPreguntasFrontend_(clienteSeguro),
    respuestas: respuestas
  };
}


/**************************************************************
 * OVERRIDE FINAL - LLAMADA INTERNA RAPIDA
 **************************************************************/

function getConfigPorSucursal_(sucursal) {
  var key = String(sucursal || '').toUpperCase().trim();
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    if (String(SOLICITUDES_CONFIG[i].sucursal || '').toUpperCase().trim() === key) return SOLICITUDES_CONFIG[i];
  }
  return null;
}

function obtenerContextoFilaSeleccionada_() {
  var activeSheet = SpreadsheetApp.getActiveSheet();
  var activeRange = SpreadsheetApp.getActiveRange();
  var rowIndex = activeRange ? activeRange.getRow() : 0;
  if (!activeSheet || rowIndex < 2) return null;

  var sheetName = activeSheet.getName();
  var map = getHeaderMapFlexible_(activeSheet);
  var row = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];
  var token = '';
  var idCliente = '';
  var baseName = '';
  var sucursal = '';

  if (sheetName === 'SOLICITUDES JUJUY' || sheetName === 'SOLICITUDES SALTA') {
    var config = getConfigPorBase_(sheetName);
    if (!config) return null;
    procesarFilaSolicitudRapida_(activeSheet, rowIndex, config);
    map = getHeaderMapFlexible_(activeSheet);
    row = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];
    token = getVal_(row, map, ALIASES.TOKEN);
    idCliente = getVal_(row, map, ALIASES.ID_CLIENTE);
    baseName = sheetName;
    sucursal = config.sucursal;
  } else {
    token = getVal_(row, map, 'TOKEN');
    idCliente = getVal_(row, map, 'ID_CLIENTE');
    sucursal = getVal_(row, map, 'SUCURSAL');
    var configBySucursal = getConfigPorSucursal_(sucursal);
    if (configBySucursal) baseName = configBySucursal.base;
    var origen = buscarSolicitudPorIdToken_(idCliente, token);
    if (origen) {
      baseName = origen.baseName;
      sucursal = origen.sucursal;
      token = token || getVal_(origen.values, origen.headerMap, ALIASES.TOKEN);
      idCliente = idCliente || getVal_(origen.values, origen.headerMap, ALIASES.ID_CLIENTE);
    }
  }

  return {
    token: token ? String(token).trim() : '',
    idCliente: idCliente ? String(idCliente).trim() : '',
    activeSheetName: sheetName,
    activeRow: rowIndex,
    baseName: baseName,
    sucursal: sucursal
  };
}

function buscarFilaDesdeContexto_(context) {
  context = context || {};
  var token = String(context.token || '').trim();
  var idCliente = String(context.idCliente || '').trim();
  var baseName = String(context.baseName || '').trim();

  if (baseName && context.activeSheetName && baseName === context.activeSheetName) {
    var config = getConfigPorBase_(baseName);
    if (config && context.activeRow >= 2) {
      var sheet = getSheet(config.base);
      if (context.activeRow <= sheet.getLastRow()) {
        return {
          rowIndex: context.activeRow,
          values: sheet.getRange(context.activeRow, 1, 1, sheet.getLastColumn()).getValues()[0],
          headerMap: getHeaderMapFlexible_(sheet),
          sheet: sheet,
          baseName: config.base,
          tmkName: config.tmk,
          sucursal: config.sucursal
        };
      }
    }
  }

  if (idCliente || token) {
    var byId = buscarSolicitudPorIdToken_(idCliente, token);
    if (byId) return byId;
  }

  if (token) {
    var byToken = buscarFilaPorToken(token);
    if (byToken) return byToken;
  }

  return null;
}

function guardarRespuestaScoringRapida_(cliente, respuestas, scoring) {
  var sheet = getSheet('Respuestas_Scoring');
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, HEADERS_RESPUESTAS_SCORING.length).setValues([HEADERS_RESPUESTAS_SCORING]);
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = [];
  var idRespuesta = 'R-' + Utilities.getUuid().slice(0, 8).toUpperCase();
  var fechaActual = new Date();

  for (var i = 0; i < headers.length; i++) {
    var h = headers[i];
    var val = '';
    switch (h) {
      case 'ID_RESPUESTA': val = idRespuesta; break;
      case 'ID_CLIENTE': val = cliente.idCliente; break;
      case 'TOKEN_HASH': val = cliente.token; break;
      case 'DNI_HASH': val = cliente.dniHash; break;
      case 'Fecha respuesta': val = fechaActual; break;
      case 'Nombre y Apellido': val = cliente.nombre; break;
      case 'Modelo suscripto': val = cliente.modelo; break;
      case 'Nombre del Asesor': val = cliente.asesor; break;
      case 'Monto_2da_cuota_base': val = cliente.montoCuota2Base; break;
      case 'Q1_Conocia_plan_exclusivo': val = respuestas.q1; break;
      case 'Q2_Informaron_licitacion_cuota_2': val = respuestas.q2; break;
      case 'Q3_Informaron_adjudicacion_asegurada': val = respuestas.q3; break;
      case 'Q4_Informaron_monto_cuota_2': val = respuestas.q4; break;
      case 'Q4A_Monto_estimado_cuota_2': val = respuestas.q4a || ''; break;
      case 'Q5_Monto_primera_cuota': val = respuestas.q5; break;
      case 'Q5A_Acepto_debito_automatico': val = respuestas.q5a; break;
      case 'Q5B_Fecha_pago_primera_cuota': val = respuestas.q5b; break;
      case 'Q6_Quien_es_vendedor': val = respuestas.q6; break;
      case 'Q7_Tuvo_otro_plan_reciente': val = respuestas.q7; break;
      case 'Q7A_Detalle_otro_plan': val = respuestas.q7a || ''; break;
      case 'Q8_Como_conocio_propuesta': val = respuestas.q8; break;
      case 'Q9_Necesita_recontacto': val = respuestas.q9; break;
      case 'Q10_Observaciones_cliente': val = respuestas.q10 || ''; break;
      case 'RESULTADO_SCORING': val = scoring.resultado; break;
      case 'MOTIVO_RESULTADO': val = scoring.motivo; break;
      case 'REQUIERE_RECONTACTO': val = scoring.requiereRecontacto; break;
      case 'AREA_A_REVISAR': val = scoring.area; break;
      case 'OBSERVACION_INTERNA': val = scoring.observacion; break;
    }
    newRow.push(val);
  }

  sheet.appendRow(newRow);
}

function volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, canal) {
  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var targetRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap,
    getVal_(rowData.values, rowData.headerMap, ALIASES.ID_CLIENTE),
    getVal_(rowData.values, rowData.headerMap, ALIASES.TOKEN)
  );
  if (!targetRow) return;
  escribirRespuestasEnFilaTMK_(tmkSheet, targetRow, tmkMap, respuestas, scoring, canal);
  aplicarFormatoFilaTmk_(tmkSheet, targetRow);
}

function obtenerDatosLlamada_(context) {
  var rowData = (typeof context === 'string') ? buscarFilaPorToken(context) : buscarFilaDesdeContexto_(context);
  if (!rowData) return { status: 'TOKEN_INVALIDO', message: 'No se encontro la solicitud.' };

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '');
  if (estadoEncuesta === 'Respondido' || estadoEncuesta === 'Scoring telefonico') {
    return { status: 'YA_RESPONDIO', message: 'Esta gestion ya fue cerrada.' };
  }

  var clienteSeguro = {
    nombre: getVal_(rowValues, headerMap, ALIASES.NOMBRE),
    modelo: getVal_(rowValues, headerMap, ALIASES.MODELO),
    asesor: getVal_(rowValues, headerMap, ALIASES.VENDEDOR),
    montoCuota2: getVal_(rowValues, headerMap, ALIASES.CUOTA_2),
    medioPagoPrevisto: getVal_(rowValues, headerMap, ALIASES.TIPO_PAGO),
    telefono: getVal_(rowValues, headerMap, ALIASES.TELEFONO),
    solicitud: getVal_(rowValues, headerMap, ALIASES.SOLICITUD),
    sucursal: rowData.sucursal,
    planAuto: (analizarPlanAuto_(getVal_(rowValues, headerMap, ALIASES.MODELO)) || {}).plan || ''
  };

  var respuestas = {};
  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var tmkRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap, getVal_(rowValues, headerMap, ALIASES.ID_CLIENTE), getVal_(rowValues, headerMap, ALIASES.TOKEN));
  if (tmkRow) {
    var filaTmk = tmkSheet.getRange(tmkRow, 1, 1, tmkSheet.getLastColumn()).getValues()[0];
    respuestas = construirRespuestasGuardadasDesdeRow_(filaTmk, tmkMap);
  }

  return { status: 'OK', cliente: clienteSeguro, preguntas: construirPreguntasFrontend_(clienteSeguro), respuestas: respuestas };
}


function abrirLlamadaModalDesdeSeleccion_() {
  var context = obtenerContextoFilaSeleccionada_();
  if (!context || (!context.token && !context.idCliente)) return 'No se pudo obtener el cliente de la fila seleccionada.';
  var initialData = obtenerDatosLlamada_(context);
  var template = HtmlService.createTemplateFromFile('LlamadaSidebar');
  template.context = context;
  template.initialData = initialData;
  var html = template.evaluate().setTitle('Scoring por llamada').setWidth(760).setHeight(840);
  SpreadsheetApp.getUi().showModalDialog(html, 'Scoring por llamada');
  return 'Ventana de llamada abierta.';
}

function cargarLlamadaSidebar(context) {
  return obtenerDatosLlamada_(context);
}


/**************************************************************
 * OVERRIDE FINAL - ABRIR FICHA DIRECTO DESDE LA FILA SELECCIONADA
 **************************************************************/

function construirClienteSeguroDesdeFilaSeleccionada_(sheet, row, map, sucursalFallback) {
  var sucursal = getVal_(row, map, 'SUCURSAL') || sucursalFallback || '';
  return {
    nombre: getVal_(row, map, ALIASES.NOMBRE) || getVal_(row, map, 'NOMBRE Y APELLIDO'),
    modelo: getVal_(row, map, ALIASES.MODELO) || getVal_(row, map, 'Modelo suscripto/ plan'),
    asesor: getVal_(row, map, ALIASES.VENDEDOR) || getVal_(row, map, 'NOMBRE DEL VENDEDOR'),
    montoCuota2: getVal_(row, map, ALIASES.CUOTA_2) || getVal_(row, map, 'CUOTA 2'),
    medioPagoPrevisto: getVal_(row, map, ALIASES.TIPO_PAGO) || getVal_(row, map, 'TIPO DE PAGO'),
    telefono: getVal_(row, map, ALIASES.TELEFONO) || getVal_(row, map, 'TELEFONO'),
    solicitud: getVal_(row, map, ALIASES.SOLICITUD) || getVal_(row, map, 'N° DE SOLICITUD'),
    sucursal: sucursal,
    planAuto: (analizarPlanAuto_(getVal_(row, map, ALIASES.MODELO) || getVal_(row, map, 'Modelo suscripto/ plan')) || {}).plan || ''
  };
}

function construirDatosLlamadaDesdeSeleccionActual_() {
  var activeSheet = SpreadsheetApp.getActiveSheet();
  var activeRange = SpreadsheetApp.getActiveRange();
  var rowIndex = activeRange ? activeRange.getRow() : 0;
  if (!activeSheet || rowIndex < 2) return { status: 'ERROR', message: 'Seleccione una fila valida.' };

  var sheetName = activeSheet.getName();
  var map = getHeaderMapFlexible_(activeSheet);
  var row = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];
  var context = obtenerContextoFilaSeleccionada_();
  if (!context) return { status: 'ERROR', message: 'No se pudo identificar la fila seleccionada.' };

  if (sheetName === 'SOLICITUDES JUJUY' || sheetName === 'SOLICITUDES SALTA') {
    var config = getConfigPorBase_(sheetName);
    if (!config) return { status: 'ERROR', message: 'No se pudo identificar la hoja de solicitudes.' };
    procesarFilaSolicitudRapida_(activeSheet, rowIndex, config);
    map = getHeaderMapFlexible_(activeSheet);
    row = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];

    var clienteBase = construirClienteSeguroDesdeFilaSeleccionada_(activeSheet, row, map, config.sucursal);
    var respuestasBase = {};
    var tokenBase = getVal_(row, map, ALIASES.TOKEN);
    var idClienteBase = getVal_(row, map, ALIASES.ID_CLIENTE);
    var tmkSheetBase = getSheet(config.tmk);
    var tmkMapBase = getHeaderMapFlexible_(tmkSheetBase);
    var tmkRowBase = buscarFilaTMKPorIdToken_(tmkSheetBase, tmkMapBase, idClienteBase, tokenBase);
    if (tmkRowBase) {
      var filaTmkBase = tmkSheetBase.getRange(tmkRowBase, 1, 1, tmkSheetBase.getLastColumn()).getValues()[0];
      respuestasBase = construirRespuestasGuardadasDesdeRow_(filaTmkBase, tmkMapBase);
    }

    return {
      status: 'OK',
      cliente: clienteBase,
      preguntas: construirPreguntasFrontend_(clienteBase),
      respuestas: respuestasBase,
      context: context
    };
  }

  var cliente = construirClienteSeguroDesdeFilaSeleccionada_(activeSheet, row, map, context.sucursal);
  var respuestas = construirRespuestasGuardadasDesdeRow_(row, map);

  if (!cliente.nombre || !cliente.modelo) {
    var fallback = obtenerDatosLlamada_(context);
    if (fallback && fallback.status === 'OK') return fallback;
    return { status: 'ERROR', message: 'No se pudo cargar la ficha.' };
  }

  return {
    status: 'OK',
    cliente: cliente,
    preguntas: construirPreguntasFrontend_(cliente),
    respuestas: respuestas,
    context: context
  };
}

function abrirLlamadaModalDesdeSeleccion_() {
  var initialData = construirDatosLlamadaDesdeSeleccionActual_();
  if (!initialData || initialData.status !== 'OK') return (initialData && initialData.message) || 'No se pudo cargar la ficha.';

  var template = HtmlService.createTemplateFromFile('LlamadaSidebar');
  template.context = initialData.context || obtenerContextoFilaSeleccionada_();
  template.initialData = initialData;
  var html = template.evaluate().setTitle('Scoring por llamada').setWidth(760).setHeight(840);
  SpreadsheetApp.getUi().showModalDialog(html, 'Scoring por llamada');
  return 'Ventana de llamada abierta.';
}

/**************************************************************
 * OVERRIDE FINAL - GUARDADO ULTRARAPIDO WEB Y LLAMADA
 **************************************************************/

function volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, canal) {
  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var idCliente = getVal_(rowData.values, rowData.headerMap, ALIASES.ID_CLIENTE);
  var token = getVal_(rowData.values, rowData.headerMap, ALIASES.TOKEN);
  var targetRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap, idCliente, token);

  if (!targetRow) {
    var config = getConfigPorBase_(rowData.baseName);
    if (config) {
      targetRow = upsertFilaTMKDesdeSolicitud_(config, rowData.rowIndex);
      tmkMap = getHeaderMapFlexible_(tmkSheet);
    }
  }

  if (!targetRow) return;
  escribirRespuestasEnFilaTMK_(tmkSheet, targetRow, tmkMap, respuestas, scoring, canal);
  aplicarFormatoFilaTmk_(tmkSheet, targetRow);
}



/**************************************************************
 * OVERRIDE FINAL - INSTRUCCIONES OPERATIVAS
 **************************************************************/


function verInstruccionesOperativasDesdeMenu() {
  var sheet = ensureInstruccionesSheet_();
  sheet.activate();
  return 'Hoja INSTRUCCIONES abierta.';
}


function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('Encuestas Autosol')
      .addItem('Preparar planilla', 'setupInicialDesdeMenu')
      .addItem('Generar desde solicitudes', 'procesarNuevosIngresosDesdeMenu')
      .addItem('Actualizar TMK y rechazados', 'actualizarHojasTMKDesdeMenu')
      .addItem('Abrir llamada fila seleccionada', 'abrirLlamadaModalDesdeSeleccionMenu')
      .addItem('Regenerar link fila seleccionada', 'regenerarLinkFilaSeleccionadaDesdeMenu')
      .addSeparator()
      .addItem('Ver instrucciones', 'verInstruccionesOperativasDesdeMenu')
      .addToUi();
  } catch (e) {
    Logger.log('No se pudo crear el menu final: ' + e);
  }
}


/**************************************************************
 * OVERRIDE FINAL - SCORING Y RECHAZADOS OPERATIVOS
 **************************************************************/

function actualizarVistasPostScoring_() {
  try {
    var rows = getAllTmkRows_();
    for (var i = 0; i < TMK_VIEW_SHEETS.length; i++) {
      var view = TMK_VIEW_SHEETS[i];
      sincronizarVistaTMK_(getSheet(view.name), rows, view.mode);
    }
    formatearVistasTMK_();
  } catch (e) {
    Logger.log('No se pudieron refrescar las vistas post scoring: ' + e);
  }
}

function calcularScoring(respuestas) {
  var resultado = 'Paso scoring';
  var motivo = 'Validacion breve conforme.';
  var requiereRecontacto = 'No';
  var area = 'Sin revision';

  var q1 = String(respuestas.q1 || '').trim();
  var q2 = String(respuestas.q2 || '').trim();
  var q3 = String(respuestas.q3 || '').trim();
  var q4 = String(respuestas.q4 || '').trim();
  var q4a = String(respuestas.q4a || '').trim();
  var q5 = String(respuestas.q5 || '').trim();
  var q5a = String(respuestas.q5a || '').trim();
  var q7 = String(respuestas.q7 || '').trim();
  var q7a = String(respuestas.q7a || '').trim();
  var q9 = String(respuestas.q9 || '').trim();
  var q10 = String(respuestas.q10 || '').trim();

  var hallazgosNoPaso = [];
  var hallazgosRevision = [];
  var observacionesInternas = [];

  var esSi = function(valor) { return String(valor || '').toUpperCase() === 'SI'; };
  var esNo = function(valor) { return String(valor || '').toUpperCase() === 'NO'; };
  var agregar = function(lista, pregunta, respuesta, detalle) {
    lista.push(pregunta + ": '" + (respuesta || 'Sin dato') + "'. " + detalle);
  };
  var enumerar = function(lista) {
    var salida = [];
    for (var i = 0; i < lista.length; i++) salida.push((i + 1) + '. ' + lista[i]);
    return salida.join(' | ');
  };

  if (esNo(q1)) agregar(hallazgosNoPaso, 'Q1', q1, 'No reconocio el plan exclusivo informado.');
  if (esNo(q2)) agregar(hallazgosNoPaso, 'Q2', q2, 'Indica que no le explicaron la licitacion desde cuota 2.');
  if (esNo(q3)) agregar(hallazgosNoPaso, 'Q3', q3, 'Indica que no le explicaron la adjudicacion asegurada del plan.');
  if (esNo(q4)) agregar(hallazgosNoPaso, 'Q4', q4, 'Indica que no le informaron el monto estimado de cuota 2.');
  if (esSi(q9)) {
    agregar(hallazgosNoPaso, 'Q9', q9, 'Solicita recontacto del asesor.');
    requiereRecontacto = 'Si';
  }

  if (esSi(q4) && !q4a) agregar(hallazgosRevision, 'Q4A', q4a, 'Respondio que si conocia el monto de cuota 2, pero no pudo indicarlo.');

  if (q5) observacionesInternas.push('Primera cuota informada: ' + q5);
  if (esNo(q5a)) observacionesInternas.push('No acepto adhesion al debito automatico.');
  if (esSi(q7)) observacionesInternas.push('Indica otro plan de ahorro reciente.');
  if (esSi(q7) && q7a) observacionesInternas.push('Detalle otro plan: ' + q7a);
  if (q10) observacionesInternas.push('Observacion cliente: ' + q10);

  if (hallazgosNoPaso.length > 0) {
    resultado = 'No paso scoring';
    area = requiereRecontacto === 'Si' && hallazgosNoPaso.length === 1 ? 'Contact Center' : 'Asesor comercial';
    motivo = enumerar(hallazgosNoPaso);
  } else if (hallazgosRevision.length > 0) {
    resultado = 'Requiere revision';
    area = 'Scoring';
    motivo = enumerar(hallazgosRevision);
  }

  return {
    resultado: resultado,
    motivo: motivo,
    requiereRecontacto: requiereRecontacto,
    area: area,
    observacion: observacionesInternas.join(' | ')
  };
}




/**************************************************************
 * OVERRIDE FINAL - CONFIG PLANES + LIMPIEZA DE HOJAS
 **************************************************************/

function ensureConfigPlanesSheet_() {
  var sheet = getSheet('CONFIG_PLANES');
  var headers = ['MODELO_BASE', 'COINCIDE_SI_CONTIENE', 'PLAN_AUTO', 'FINANCIA_AUTO', 'LICITA_AUTO', 'CTA_AUTO', 'MOSTRAR_Q3', 'ACTIVO'];
  var rows = [
    ['AMAROK', 'AMAROK', '70/30', '70%', '30%', 'cuota 2', 'SI', 'SI'],
    ['NIVUS', 'NIVUS', '80/20', '80%', '20%', 'cuota 8/12/24', 'SI', 'SI'],
    ['T-CROSS', 'T-CROSS', '80/20', '80%', '20%', 'cuota 8/12/24', 'SI', 'SI'],
    ['TERA', 'TERA', '70/30', '70%', '30%', 'cuota 8/12/24', 'SI', 'SI'],
    ['VIRTUS', 'VIRTUS', '100%', '100%', '0%', '-', 'NO', 'SI']
  ];

  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#dbeafe').setFontColor('#1e3a8a');
  sheet.getDataRange().setWrap(true);
  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(2, 190);
  sheet.setColumnWidth(3, 110);
  sheet.setColumnWidth(4, 110);
  sheet.setColumnWidth(5, 110);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(7, 100);
  sheet.setColumnWidth(8, 90);
  return sheet;
}

function limpiarHojasObsoletas_() {
  var ss = getSpreadsheet();
  var obsoletas = ['Vendedores', 'VENDEDORES', 'Base_Clientes', 'Seguimiento_CC', 'TMK - REVISAR'];
  for (var i = 0; i < obsoletas.length; i++) {
    var sh = ss.getSheetByName(obsoletas[i]);
    if (sh) ss.deleteSheet(sh);
  }
}

function leerConfigPlanes_() {
  var sheet = getSheet('CONFIG_PLANES');
  if (sheet.getLastRow() < 2) ensureConfigPlanesSheet_();
  var data = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 8).getValues();
  var out = [];
  for (var i = 0; i < data.length; i++) {
    var activo = String(data[i][7] || '').toUpperCase().trim();
    if (activo === 'NO') continue;
    out.push({
      modeloBase: String(data[i][0] || '').trim(),
      match: String(data[i][1] || '').toUpperCase().trim(),
      planAuto: String(data[i][2] || '').trim(),
      financia: String(data[i][3] || '').trim(),
      licita: String(data[i][4] || '').trim(),
      cta: String(data[i][5] || '').trim(),
      mostrarQ3: String(data[i][6] || '').toUpperCase().trim() !== 'NO'
    });
  }
  out.sort(function(a, b) { return b.match.length - a.match.length; });
  return out;
}


function ensureSheets() {
  var ss = getSpreadsheet();
  var required = ['Respuestas_Scoring', 'Preguntas', 'Log_Seguridad', 'INSTRUCCIONES', 'CONFIG_PLANES'];

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

function setupInicial() {
  ensureSheets();
  limpiarHojasObsoletas_();
  ensureHeaders();
  ensureConfigPlanesSheet_();
  ensureInstruccionesSheet_();
  try { actualizarCatalogoPreguntas(); } catch (e) { Logger.log(e); }
  actualizarHojasTMK();
  actualizarVistasTMK_();
  return 'Planilla preparada con hojas necesarias y configuracion de planes lista.';
}

/**************************************************************
 * OVERRIDE FINAL - INSTRUCCIONES CON CONFIG PLANES
 **************************************************************/


/**************************************************************
 * OVERRIDE FINAL - INSTRUCCIONES MAS CLARAS
 **************************************************************/

function ensureInstruccionesSheet_() {
  var sheet = getSheet('INSTRUCCIONES');
  sheet.clear();

  var rows = [
    ['AUTOSOL - GUIA RAPIDA', '', '', ''],
    ['', '', '', ''],
    ['SITUACION', 'QUE HACER', 'DONDE', 'RESULTADO'],
    ['Llega un cliente nuevo', 'Cargarlo en SOLICITUDES JUJUY o SOLICITUDES SALTA. Completar solo los datos necesarios.', 'SOLICITUDES', 'La fila queda lista para generar link y seguimiento.'],
    ['Quiero generar link', 'Marcar la casilla GENERAR o usar el menu Generar desde solicitudes.', 'SOLICITUDES', 'Se crean TOKEN, LINK_ENCUESTA, ENVIAR WPP y la fila en TMK.'],
    ['Quiero enviar la encuesta', 'Usar el link de ENVIAR WPP o copiar LINK_ENCUESTA.', 'SOLICITUDES o TMK', 'El cliente recibe su acceso personalizado.'],
    ['El cliente responde web', 'No hay que hacer nada manual. El sistema guarda respuestas y scoring.', 'Encuesta web', 'Se actualizan SOLICITUDES, TMK y Respuestas_Scoring.'],
    ['El cliente no responde o hay que llamarlo', 'Abrir la fila en TMK y usar Abrir llamada fila seleccionada.', 'TMK', 'Se hace scoring por llamada sobre la misma gestion.'],
    ['La gestion fue rechazada', 'Usar Actualizar TMK y rechazados si necesita refrescar la vista.', 'TMK', 'La fila aparece en TMK - RECHAZADOS.'],
    ['Hay que reenviar la encuesta', 'Usar Regenerar link fila seleccionada.', 'TMK o TMK - RECHAZADOS', 'Se crea un link nuevo sobre la misma gestion.'],
    ['', '', '', ''],
    ['COMO LEER CONFIG_PLANES', '', '', ''],
    ['Que es', 'Es la hoja donde se define automaticamente el plan segun el nombre del modelo.', 'CONFIG_PLANES', 'Desde ahi salen PLAN_AUTO, FINANCIA_AUTO, LICITA_AUTO y CTA_AUTO.'],
    ['Que campo se compara', 'COINCIDE_SI_CONTIENE debe tener la palabra clave del modelo. Ejemplo: AMAROK, NIVUS, TERA.', 'CONFIG_PLANES', 'El sistema detecta el modelo correcto.'],
    ['Que es CTA_AUTO', 'Es la adjudicacion asegurada que se usa en la pregunta 3. Ejemplo: cuota 2, cuota 8/12/24 o -.', 'CONFIG_PLANES', 'La encuesta muestra el texto correcto o directamente oculta la pregunta 3.'],
    ['Si cambia un plan este mes', 'Modificar solo la fila de ese modelo en CONFIG_PLANES.', 'CONFIG_PLANES', 'No hace falta tocar el codigo.'],
    ['Si un modelo no tiene adjudicacion', 'Poner CTA_AUTO = - y MOSTRAR_Q3 = NO.', 'CONFIG_PLANES', 'La pregunta 3 no se muestra.'],
    ['Si cambian porcentajes', 'Modificar PLAN_AUTO, FINANCIA_AUTO y LICITA_AUTO.', 'CONFIG_PLANES', 'TMK y encuesta toman los nuevos valores.'],
    ['', '', '', ''],
    ['REGLAS IMPORTANTES', '', '', ''],
    ['No borrar filas gestionadas', 'Si una gestion ya existe en TMK, se sigue trabajando sobre esa misma fila.', '', 'Evita duplicados.'],
    ['No editar datos automaticos en TMK', 'No tocar manualmente PLAN_AUTO, FINANCIA_AUTO, LICITA_AUTO, CTA_AUTO, TOKEN o DNI_HASH.', '', 'Esos datos salen del sistema.'],
    ['Si cambia DNI o telefono', 'Corregir primero en SOLICITUDES y despues regenerar si hace falta.', '', 'La gestion queda consistente.'],
    ['Si el cliente ya respondio', 'No reenviar salvo que supervisor indique regenerar link.', '', 'Evita respuestas duplicadas.'],
    ['', '', '', ''],
    ['HOJAS QUE SE USAN', '', '', ''],
    ['SOLICITUDES JUJUY / SALTA', 'Para cargar clientes nuevos.', '', ''],
    ['TMK - JUJUY / SALTA', 'Para seguimiento, contacto y scoring.', '', ''],
    ['TMK - RECHAZADOS', 'Para ver rapidamente los casos rechazados.', '', ''],
    ['Respuestas_Scoring', 'Respaldo de respuestas y scoring.', '', ''],
    ['Preguntas', 'Catalogo editable de preguntas.', '', ''],
    ['CONFIG_PLANES', 'Configuracion mensual por modelo.', '', ''],
    ['Log_Seguridad', 'Registro tecnico de validaciones.', '', ''],
    ['INSTRUCCIONES', 'Guia de uso del archivo.', '', ''],
    ['', '', '', ''],
    ['MENU RECOMENDADO', '', '', ''],
    ['Preparar planilla', 'Usar al inicio o si se agrego una hoja nueva.', '', ''],
    ['Generar desde solicitudes', 'Crea links pendientes y sube altas a TMK.', '', ''],
    ['Actualizar TMK y rechazados', 'Refresca estados y la vista de rechazados.', '', ''],
    ['Abrir llamada fila seleccionada', 'Abre la ficha para scoring telefonico.', '', ''],
    ['Regenerar link fila seleccionada', 'Crea un link nuevo para repetir validacion.', '', ''],
    ['Ver instrucciones', 'Abre esta misma hoja.', '', '']
  ];

  sheet.getRange(1, 1, rows.length, 4).setValues(rows);
  sheet.setFrozenRows(3);
  sheet.setColumnWidths(1, 4, 220);
  sheet.setColumnWidth(2, 560);
  sheet.getRange('A1:D1').merge();
  sheet.getRange('A1').setFontSize(15).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff').setHorizontalAlignment('center');
  sheet.getRange('A3:D3').setFontWeight('bold').setBackground('#e5efe8').setFontColor('#1f3b2f');
  sheet.getRange(4, 1, 7, 4).setBackground('#f8fafc');
  sheet.getRange('A12:D12').merge();
  sheet.getRange('A12').setFontWeight('bold').setBackground('#ede9fe').setFontColor('#5b21b6');
  sheet.getRange('A20:D20').merge();
  sheet.getRange('A20').setFontWeight('bold').setBackground('#fef3c7').setFontColor('#7c5a10');
  sheet.getRange('A26:D26').merge();
  sheet.getRange('A26').setFontWeight('bold').setBackground('#dbeafe').setFontColor('#1d4ed8');
  sheet.getRange('A35:D35').merge();
  sheet.getRange('A35').setFontWeight('bold').setBackground('#dcfce7').setFontColor('#166534');
  sheet.getDataRange().setWrap(true).setVerticalAlignment('middle');
  return sheet;
}

/**************************************************************
 * OVERRIDE FINAL - ANALISIS DE PLAN DESDE CONFIG SIN TOMAR CTA
 **************************************************************/

function analizarPlanAuto_(modeloRaw) {
  var modelo = String(modeloRaw || '').toUpperCase().replace(/\s+/g, ' ').trim();

  var configs = [];
  try { configs = leerConfigPlanes_(); } catch (e) { Logger.log('No se pudo leer CONFIG_PLANES: ' + e); }
  for (var i = 0; i < configs.length; i++) {
    if (configs[i].match && modelo.indexOf(configs[i].match) !== -1) {
      return {
        planAuto: configs[i].planAuto || '-',
        financia: configs[i].financia || '-',
        licita: configs[i].licita || '-',
        cta: configs[i].mostrarQ3 ? (configs[i].cta || '-') : '-',
        modeloBase: configs[i].modeloBase || modeloRaw || 'su modelo'
      };
    }
  }

  var modeloSinCta = modelo
    .replace(/CTA\s*\d{1,2}\s*\/\s*\d{1,2}\s*\/\s*\d{1,2}/g, ' ')
    .replace(/ADJ\s*ASEG\s*CTA\s*\d{1,2}\s*\/\s*\d{1,2}\s*\/\s*\d{1,2}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  var planAuto = '-';
  var financia = '-';
  var licita = '-';
  var modeloBase = modeloRaw || 'su modelo';

  var matchSlash = modeloSinCta.match(/(\d{2,3})\s*\/\s*(\d{1,3})/);
  var matchDash = modeloSinCta.match(/(\d{2,3})\s*-\s*(\d{1,3})/);
  var match = matchSlash || matchDash;

  if (match) {
    planAuto = match[1] + '/' + match[2];
    financia = match[1] + '%';
    licita = match[2] + '%';
  } else if (modeloSinCta.indexOf('100%') !== -1) {
    planAuto = '100%';
    financia = '100%';
    licita = '0%';
  }

  return {
    planAuto: planAuto,
    financia: financia,
    licita: licita,
    cta: '-',
    modeloBase: modeloBase
  };
}

/**************************************************************
 * OVERRIDE FINAL - TEXTO MAS CLARO EN Q7A
 **************************************************************/

function actualizarCatalogoPreguntas() {
  var headers = ['Codigo', 'Bloque', 'Orden', 'Pregunta', 'Tipo', 'Opciones', 'Obligatoria', 'Condicion', 'Columna_respuesta', 'Activa'];
  ensureHeadersPresent_ ? ensureHeadersPresent_(getSheet('Preguntas'), headers) : ensureHeadersPresent('Preguntas', headers);

  var sheet = getSheet('Preguntas');
  var rows = [
    ['Q1', 'Plan', 1, 'Le informamos que accedio al plan exclusivo de {{MODELO_BASE}}, a traves del cual financia un {{FINANCIA}} del valor del vehiculo. Lo sabia?', 'Seleccion', 'Si | No', 'Si', 'Editable', 'q1', 'Si'],
    ['Q2', 'Plan', 2, 'Le informaron que puede licitar con el {{LICITA}} a partir de la cuota 2?', 'Seleccion', 'Si | No', 'Si', 'Editable', 'q2', 'Si'],
    ['Q3', 'Plan', 3, 'Le informaron que tiene adjudicacion asegurada en {{CTA}}?', 'Seleccion', 'Si | No', 'Si', 'Solo si CTA aplica. Si CTA_AUTO = -, se oculta.', 'q3', 'Si'],
    ['Q4', 'Plan', 4, 'El vendedor le informo el monto estimado de la cuota 2?', 'Seleccion', 'Si | No', 'Si', 'Editable', 'q4', 'Si'],
    ['Q4A', 'Plan', 5, 'Cuanto es aproximadamente?', 'Texto', '', 'No', 'Completar solo si Q4 = Si', 'q4a', 'Si'],
    ['Q5', 'Pagos', 6, 'Cuanto pago en la primera cuota?', 'Texto', '', 'Si', 'Formato sugerido: $ 000000', 'q5', 'Si'],
    ['Q5A', 'Pagos', 7, 'Acepto adhesion al debito automatico?', 'Seleccion', 'Si | No', 'Si', 'Informativo. No rechaza por si solo.', 'q5a', 'Si'],
    ['Q5B', 'Pagos', 8, 'Cuando pago la primera cuota estimativamente?', 'Fecha', '', 'Si', 'Usar calendario', 'q5b', 'Si'],
    ['Q6', 'Vendedor', 9, 'Quien es su vendedor?', 'Texto', '', 'Si', 'Se puede dejar precargado', 'q6', 'Si'],
    ['Q7', 'Historial', 10, 'Estuvo pagando algun otro plan de ahorro de un 0 km recientemente?', 'Seleccion', 'Si | No', 'Si', 'Informativo. No rechaza por si solo.', 'q7', 'Si'],
    ['Q7A', 'Historial', 11, 'De que marca y hasta que mes pago? Ejemplo: Volkswagen; mes 5 o No recuerdo', 'Texto', '', 'No', 'Completar solo si Q7 = Si', 'q7a', 'Si'],
    ['Q8', 'Origen', 12, 'Como conocio la propuesta?', 'Seleccion', 'Redes sociales | Salon | TV | Radio', 'Si', 'Editable', 'q8', 'Si'],
    ['Q9', 'Cierre', 13, 'Necesita que un asesor vuelva a contactarlo?', 'Seleccion', 'Si | No', 'Si', 'Si responde Si, se considera rechazo con recontacto.', 'q9', 'Si'],
    ['Q10', 'Cierre', 14, 'Observaciones', 'Texto', '', 'No', 'Obligatorio si Q9 = Si', 'q10', 'Si']
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#dbeafe').setFontColor('#1e3a8a');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 90);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 60);
  sheet.setColumnWidth(4, 430);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 260);
  sheet.setColumnWidth(7, 90);
  sheet.setColumnWidth(8, 250);
  sheet.setColumnWidth(9, 150);
  sheet.setColumnWidth(10, 70);
  sheet.getRange(2, 1, rows.length, headers.length).setWrap(true).setVerticalAlignment('middle');
}

/**************************************************************
 * OVERRIDE FINAL - RECHAZADOS AUTOMATICOS SI O SI
 **************************************************************/

function refrescarVistaRechazados_() {
  try {
    var rows = getAllTmkRows_();
    sincronizarVistaTMK_(getSheet('TMK - RECHAZADOS'), rows, 'RECHAZADOS');
    formatearUnaVistaTMK_(getSheet('TMK - RECHAZADOS'), 'RECHAZADOS');
  } catch (e) {
    Logger.log('No se pudo refrescar TMK - RECHAZADOS: ' + e);
  }
}

function guardarEncuesta(token, dni, respuestas) {
  var dniNormalizado = normalizarDni(dni);
  var dniHashInput = generarHash(dniNormalizado);
  var rowData = buscarFilaPorToken(token);
  if (!rowData) {
    registrarLog(token, dniHashInput, 'TOKEN_INVALIDO', 'Token inexistente al intentar guardar', 'guardarEncuestaFinalRechazados');
    return jsonResponse({ status: 'TOKEN_INVALIDO' });
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido') {
    registrarLog(token, dniHashInput, 'YA_RESPONDIO', 'Encuesta duplicada rechazada al guardar', 'guardarEncuestaFinalRechazados');
    return jsonResponse({ status: 'YA_RESPONDIO' });
  }

  var dniHashSheet = String(getVal_(rowValues, headerMap, ALIASES.DNI_HASH) || '').trim();
  var dniPlanoSheet = normalizarDni(getVal_(rowValues, headerMap, ALIASES.DNI));
  var coincideHash = dniHashInput === dniHashSheet;
  var coincidePlano = !!dniPlanoSheet && dniNormalizado === dniPlanoSheet;
  if (!coincideHash && !coincidePlano) {
    registrarLog(token, dniHashInput, 'DNI_INVALIDO', 'DNI incorrecto al intentar guardar', 'guardarEncuestaFinalRechazados');
    return jsonResponse({ status: 'DNI_INVALIDO' });
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoring_(rowData, scoring, 'WEB');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'WEB');
  refrescarVistaRechazados_();
  registrarLog(token, dniHashInput, 'OK', 'Encuesta procesada: ' + scoring.resultado, 'guardarEncuestaFinalRechazados');
  return jsonResponse({ status: 'OK', scoringResult: scoring.resultado });
}

function guardarLlamadaInterna_(context, respuestas) {
  var rowData = (typeof context === 'string') ? buscarFilaPorToken(context) : buscarFilaDesdeContexto_(context);
  if (!rowData) {
    return { status: 'TOKEN_INVALIDO', message: 'No se encontro la solicitud.' };
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido' || estadoEncuesta === 'Scoring telefonico') {
    return { status: 'YA_RESPONDIO', message: 'Esta gestion ya fue cerrada.' };
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoring_(rowData, scoring, 'TELEFONICO');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'TELEFONICO');
  refrescarVistaRechazados_();
  registrarLog(clienteInfo.token || '', clienteInfo.dniHash || '', 'OK', 'Llamada procesada: ' + scoring.resultado, 'guardarLlamadaFinalRechazados');
  return { status: 'OK', scoringResult: scoring.resultado };
}

function guardarLlamadaSidebar(context, respuestas) {
  return guardarLlamadaInterna_(context, respuestas);
}

function guardarLlamada(token, respuestas) {
  return jsonResponse(guardarLlamadaInterna_(token, respuestas));
}

/**************************************************************
 * OVERRIDE FINAL - FLUSH ANTES DE RECHAZADOS
 **************************************************************/

function refrescarVistaRechazados_() {
  try {
    SpreadsheetApp.flush();
    var rows = getAllTmkRows_();
    sincronizarVistaTMK_(getSheet('TMK - RECHAZADOS'), rows, 'RECHAZADOS');
    formatearUnaVistaTMK_(getSheet('TMK - RECHAZADOS'), 'RECHAZADOS');
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log('No se pudo refrescar TMK - RECHAZADOS: ' + e);
  }
}

function guardarEncuesta(token, dni, respuestas) {
  var dniNormalizado = normalizarDni(dni);
  var dniHashInput = generarHash(dniNormalizado);
  var rowData = buscarFilaPorToken(token);
  if (!rowData) {
    registrarLog(token, dniHashInput, 'TOKEN_INVALIDO', 'Token inexistente al intentar guardar', 'guardarEncuestaFinalFlush');
    return jsonResponse({ status: 'TOKEN_INVALIDO' });
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido') {
    registrarLog(token, dniHashInput, 'YA_RESPONDIO', 'Encuesta duplicada rechazada al guardar', 'guardarEncuestaFinalFlush');
    return jsonResponse({ status: 'YA_RESPONDIO' });
  }

  var dniHashSheet = String(getVal_(rowValues, headerMap, ALIASES.DNI_HASH) || '').trim();
  var dniPlanoSheet = normalizarDni(getVal_(rowValues, headerMap, ALIASES.DNI));
  var coincideHash = dniHashInput === dniHashSheet;
  var coincidePlano = !!dniPlanoSheet && dniNormalizado === dniPlanoSheet;
  if (!coincideHash && !coincidePlano) {
    registrarLog(token, dniHashInput, 'DNI_INVALIDO', 'DNI incorrecto al intentar guardar', 'guardarEncuestaFinalFlush');
    return jsonResponse({ status: 'DNI_INVALIDO' });
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoring_(rowData, scoring, 'WEB');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'WEB');
  SpreadsheetApp.flush();
  refrescarVistaRechazados_();
  registrarLog(token, dniHashInput, 'OK', 'Encuesta procesada: ' + scoring.resultado, 'guardarEncuestaFinalFlush');
  return jsonResponse({ status: 'OK', scoringResult: scoring.resultado });
}

function guardarLlamadaInterna_(context, respuestas) {
  var rowData = (typeof context === 'string') ? buscarFilaPorToken(context) : buscarFilaDesdeContexto_(context);
  if (!rowData) {
    return { status: 'TOKEN_INVALIDO', message: 'No se encontro la solicitud.' };
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido' || estadoEncuesta === 'Scoring telefonico') {
    return { status: 'YA_RESPONDIO', message: 'Esta gestion ya fue cerrada.' };
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoring_(rowData, scoring, 'TELEFONICO');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'TELEFONICO');
  SpreadsheetApp.flush();
  refrescarVistaRechazados_();
  registrarLog(clienteInfo.token || '', clienteInfo.dniHash || '', 'OK', 'Llamada procesada: ' + scoring.resultado, 'guardarLlamadaFinalFlush');
  return { status: 'OK', scoringResult: scoring.resultado };
}

/**************************************************************
 * OVERRIDE FINAL - UPSERT DIRECTO EN TMK RECHAZADOS
 **************************************************************/

function upsertFilaRechazadosDesdeTMK_(sourceSheet, rowIndex) {
  try {
    var rejectSheet = getSheet('TMK - RECHAZADOS');
    ensureHeadersPresent_(rejectSheet, HEADERS_TMK);

    var sourceMap = getHeaderMapFlexible_(sourceSheet);
    var rejectMap = getHeaderMapFlexible_(rejectSheet);
    var sourceRow = sourceSheet.getRange(rowIndex, 1, 1, sourceSheet.getLastColumn()).getValues()[0];
    var decision = String(getVal_(sourceRow, sourceMap, 'DECISION_FINAL') || '').toUpperCase().trim();
    var idCliente = String(getVal_(sourceRow, sourceMap, 'ID_CLIENTE') || '').trim();
    var token = String(getVal_(sourceRow, sourceMap, 'TOKEN') || '').trim();

    var existingRow = buscarFilaTMKPorIdToken_(rejectSheet, rejectMap, idCliente, token);

    if (decision !== 'RECHAZADO') {
      if (existingRow) rejectSheet.deleteRow(existingRow);
      return;
    }

    var headers = rejectSheet.getRange(1, 1, 1, rejectSheet.getLastColumn()).getValues()[0];
    var out = [];
    for (var i = 0; i < headers.length; i++) {
      out.push(getVal_(sourceRow, sourceMap, headers[i]));
    }

    var targetRow = existingRow;
    if (targetRow) {
      rejectSheet.getRange(targetRow, 1, 1, headers.length).setValues([out]);
    } else {
      rejectSheet.appendRow(out);
      targetRow = rejectSheet.getLastRow();
    }

    var linkColSource = getCol_(sourceMap, 'LINK_ENCUESTA');
    var wppColSource = getCol_(sourceMap, 'ENVIAR WPP');
    var callColSource = getCol_(sourceMap, 'ABRIR_LLAMADA');
    var linkColTarget = getCol_(rejectMap, 'LINK_ENCUESTA');
    var wppColTarget = getCol_(rejectMap, 'ENVIAR WPP');
    var callColTarget = getCol_(rejectMap, 'ABRIR_LLAMADA');

    if (linkColSource && linkColTarget) {
      var rtLink = sourceSheet.getRange(rowIndex, linkColSource).getRichTextValue();
      if (rtLink && rtLink.getLinkUrl()) rejectSheet.getRange(targetRow, linkColTarget).setRichTextValue(rtLink);
    }
    if (wppColSource && wppColTarget) {
      var rtWpp = sourceSheet.getRange(rowIndex, wppColSource).getRichTextValue();
      if (rtWpp && rtWpp.getLinkUrl()) rejectSheet.getRange(targetRow, wppColTarget).setRichTextValue(rtWpp);
    }
    if (callColSource && callColTarget) {
      var rtCall = sourceSheet.getRange(rowIndex, callColSource).getRichTextValue();
      if (rtCall && rtCall.getLinkUrl()) rejectSheet.getRange(targetRow, callColTarget).setRichTextValue(rtCall);
    }
  } catch (e) {
    Logger.log('No se pudo upsertar TMK - RECHAZADOS: ' + e);
  }
}

function guardarEncuesta(token, dni, respuestas) {
  var dniNormalizado = normalizarDni(dni);
  var dniHashInput = generarHash(dniNormalizado);
  var rowData = buscarFilaPorToken(token);
  if (!rowData) {
    registrarLog(token, dniHashInput, 'TOKEN_INVALIDO', 'Token inexistente al intentar guardar', 'guardarEncuestaFinalUpsertRechazado');
    return jsonResponse({ status: 'TOKEN_INVALIDO' });
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido') {
    registrarLog(token, dniHashInput, 'YA_RESPONDIO', 'Encuesta duplicada rechazada al guardar', 'guardarEncuestaFinalUpsertRechazado');
    return jsonResponse({ status: 'YA_RESPONDIO' });
  }

  var dniHashSheet = String(getVal_(rowValues, headerMap, ALIASES.DNI_HASH) || '').trim();
  var dniPlanoSheet = normalizarDni(getVal_(rowValues, headerMap, ALIASES.DNI));
  var coincideHash = dniHashInput === dniHashSheet;
  var coincidePlano = !!dniPlanoSheet && dniNormalizado === dniPlanoSheet;
  if (!coincideHash && !coincidePlano) {
    registrarLog(token, dniHashInput, 'DNI_INVALIDO', 'DNI incorrecto al intentar guardar', 'guardarEncuestaFinalUpsertRechazado');
    return jsonResponse({ status: 'DNI_INVALIDO' });
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoring_(rowData, scoring, 'WEB');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'WEB');
  SpreadsheetApp.flush();
  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var tmkRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap, clienteInfo.idCliente, clienteInfo.token);
  if (tmkRow) upsertFilaRechazadosDesdeTMK_(tmkSheet, tmkRow);
  refrescarVistaRechazados_();
  registrarLog(token, dniHashInput, 'OK', 'Encuesta procesada: ' + scoring.resultado, 'guardarEncuestaFinalUpsertRechazado');
  return jsonResponse({ status: 'OK', scoringResult: scoring.resultado });
}

function guardarLlamadaInterna_(context, respuestas) {
  var rowData = (typeof context === 'string') ? buscarFilaPorToken(context) : buscarFilaDesdeContexto_(context);
  if (!rowData) {
    return { status: 'TOKEN_INVALIDO', message: 'No se encontro la solicitud.' };
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido' || estadoEncuesta === 'Scoring telefonico') {
    return { status: 'YA_RESPONDIO', message: 'Esta gestion ya fue cerrada.' };
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoring_(rowData, scoring, 'TELEFONICO');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'TELEFONICO');
  SpreadsheetApp.flush();
  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var tmkRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap, clienteInfo.idCliente, clienteInfo.token);
  if (tmkRow) upsertFilaRechazadosDesdeTMK_(tmkSheet, tmkRow);
  refrescarVistaRechazados_();
  registrarLog(clienteInfo.token || '', clienteInfo.dniHash || '', 'OK', 'Llamada procesada: ' + scoring.resultado, 'guardarLlamadaFinalUpsertRechazado');
  return { status: 'OK', scoringResult: scoring.resultado };
}

/**************************************************************
 * OVERRIDE FINAL - RECHAZADOS DESDE LA MISMA ESCRITURA TMK
 **************************************************************/

function volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, canal) {
  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var idCliente = getVal_(rowData.values, rowData.headerMap, ALIASES.ID_CLIENTE);
  var token = getVal_(rowData.values, rowData.headerMap, ALIASES.TOKEN);
  var targetRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap, idCliente, token);

  if (!targetRow) {
    var config = getConfigPorBase_(rowData.baseName);
    if (config) {
      targetRow = upsertFilaTMKDesdeSolicitud_(config, rowData.rowIndex);
      tmkMap = getHeaderMapFlexible_(tmkSheet);
    }
  }

  if (!targetRow) return;
  escribirRespuestasEnFilaTMK_(tmkSheet, targetRow, tmkMap, respuestas, scoring, canal);
  aplicarFormatoFilaTmk_(tmkSheet, targetRow);
  SpreadsheetApp.flush();
  upsertFilaRechazadosDesdeTMK_(tmkSheet, targetRow);
}

/**************************************************************
 * OVERRIDE FINAL - REFRESCO COMPLETO POST GUARDADO
 **************************************************************/

function refrescarPostGuardado_() {
  SpreadsheetApp.flush();
  Utilities.sleep(1200);
  actualizarVistasTMK_();
}

function guardarEncuesta(token, dni, respuestas) {
  var dniNormalizado = normalizarDni(dni);
  var dniHashInput = generarHash(dniNormalizado);
  var rowData = buscarFilaPorToken(token);
  if (!rowData) {
    registrarLog(token, dniHashInput, 'TOKEN_INVALIDO', 'Token inexistente al intentar guardar', 'guardarEncuestaFinalRefrescoCompleto');
    return jsonResponse({ status: 'TOKEN_INVALIDO' });
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido') {
    registrarLog(token, dniHashInput, 'YA_RESPONDIO', 'Encuesta duplicada rechazada al guardar', 'guardarEncuestaFinalRefrescoCompleto');
    return jsonResponse({ status: 'YA_RESPONDIO' });
  }

  var dniHashSheet = String(getVal_(rowValues, headerMap, ALIASES.DNI_HASH) || '').trim();
  var dniPlanoSheet = normalizarDni(getVal_(rowValues, headerMap, ALIASES.DNI));
  var coincideHash = dniHashInput === dniHashSheet;
  var coincidePlano = !!dniPlanoSheet && dniNormalizado === dniPlanoSheet;
  if (!coincideHash && !coincidePlano) {
    registrarLog(token, dniHashInput, 'DNI_INVALIDO', 'DNI incorrecto al intentar guardar', 'guardarEncuestaFinalRefrescoCompleto');
    return jsonResponse({ status: 'DNI_INVALIDO' });
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoring_(rowData, scoring, 'WEB');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'WEB');
  refrescarPostGuardado_();
  registrarLog(token, dniHashInput, 'OK', 'Encuesta procesada: ' + scoring.resultado, 'guardarEncuestaFinalRefrescoCompleto');
  return jsonResponse({ status: 'OK', scoringResult: scoring.resultado });
}

function guardarLlamadaInterna_(context, respuestas) {
  var rowData = (typeof context === 'string') ? buscarFilaPorToken(context) : buscarFilaDesdeContexto_(context);
  if (!rowData) {
    return { status: 'TOKEN_INVALIDO', message: 'No se encontro la solicitud.' };
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido' || estadoEncuesta === 'Scoring telefonico') {
    return { status: 'YA_RESPONDIO', message: 'Esta gestion ya fue cerrada.' };
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoring_(rowData, scoring, 'TELEFONICO');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'TELEFONICO');
  refrescarPostGuardado_();
  registrarLog(clienteInfo.token || '', clienteInfo.dniHash || '', 'OK', 'Llamada procesada: ' + scoring.resultado, 'guardarLlamadaFinalRefrescoCompleto');
  return { status: 'OK', scoringResult: scoring.resultado };
}

/**************************************************************
 * OVERRIDE FINAL - RECHAZADOS SIN RELECTURA DE TMK
 **************************************************************/

function construirFilaTmkFinalDesdeContexto_(rowData, respuestas, scoring, canal) {
  var config = getConfigPorBase_(rowData.baseName);
  var baseRow = construirFilaTMK_(config, rowData.values, rowData.headerMap, {});
  var idx = {};
  for (var i = 0; i < HEADERS_TMK.length; i++) idx[HEADERS_TMK[i]] = i;

  function setHeader_(header, value) {
    if (idx[header] !== undefined) baseRow[idx[header]] = value;
  }

  setHeader_('Q1_Conocia_plan_exclusivo', respuestas.q1 || '');
  setHeader_('Q2_Informaron_licitacion_cuota_2', respuestas.q2 || '');
  setHeader_('Q3_Informaron_adjudicacion_asegurada', respuestas.q3 || '');
  setHeader_('Q4_Informaron_monto_cuota_2', respuestas.q4 || '');
  setHeader_('Q4A_Monto_estimado_cuota_2', respuestas.q4a || '');
  setHeader_('Q5_Monto_primera_cuota', respuestas.q5 || '');
  setHeader_('Q5A_Acepto_debito_automatico', respuestas.q5a || '');
  setHeader_('Q5B_Fecha_pago_primera_cuota', respuestas.q5b || '');
  setHeader_('Q6_Quien_es_vendedor', respuestas.q6 || '');
  setHeader_('Q7_Tuvo_otro_plan_reciente', respuestas.q7 || '');
  setHeader_('Q7A_Detalle_otro_plan', respuestas.q7a || '');
  setHeader_('Q8_Como_conocio_propuesta', respuestas.q8 || '');
  setHeader_('Q9_Necesita_recontacto', respuestas.q9 || '');
  setHeader_('Q10_Observaciones_cliente', respuestas.q10 || '');
  setHeader_('RESULTADO_SCORING', scoring.resultado || '');
  setHeader_('MOTIVO_RESULTADO', scoring.motivo || '');
  setHeader_('REQUIERE_RECONTACTO', scoring.requiereRecontacto || '');
  setHeader_('AREA_A_REVISAR', scoring.area || '');
  setHeader_('OBSERVACION_INTERNA', scoring.observacion || '');
  setHeader_('FECHA_REALIZACION_SCORING', new Date());
  setHeader_('CANAL_SCORING', canal || '');
  setHeader_('DECISION_FINAL', decisionDesdeScoring_(scoring.resultado));
  setHeader_('MOTIVO_DECISION', scoring.motivo || '');
  setHeader_('FECHA_DECISION', new Date());
  setHeader_('ESTADO_TMK', estadoTmkDesdeResultado_(scoring.resultado, canal));
  setHeader_('PROXIMA_ACCION', proximaAccionDesdeResultado_(scoring.resultado));
  setHeader_('PRIORIDAD', prioridadDesdeResultado_(scoring.resultado, scoring.requiereRecontacto));
  setHeader_('ULTIMO_CONTACTO_TMK', new Date());
  if (canal === 'WEB') setHeader_('FECHA_RESPUESTA_WEB', new Date());

  return baseRow;
}

function upsertFilaRechazadosDesdeContexto_(rowData, respuestas, scoring, canal) {
  try {
    var rejectSheet = getSheet('TMK - RECHAZADOS');
    establecerHeadersExactos_(rejectSheet, HEADERS_TMK);

    var rejectMap = getHeaderMapFlexible_(rejectSheet);
    var idCliente = String(getVal_(rowData.values, rowData.headerMap, ALIASES.ID_CLIENTE) || '').trim();
    var token = String(getVal_(rowData.values, rowData.headerMap, ALIASES.TOKEN) || '').trim();
    var existingRow = buscarFilaTMKPorIdToken_(rejectSheet, rejectMap, idCliente, token);
    var decision = decisionDesdeScoring_(scoring.resultado);

    if (decision !== 'RECHAZADO') {
      if (existingRow) rejectSheet.deleteRow(existingRow);
      return;
    }

    var out = construirFilaTmkFinalDesdeContexto_(rowData, respuestas, scoring, canal);
    var targetRow = existingRow;
    if (targetRow) {
      rejectSheet.getRange(targetRow, 1, 1, HEADERS_TMK.length).setValues([out]);
    } else {
      rejectSheet.appendRow(out);
      targetRow = rejectSheet.getLastRow();
    }

    var sourceMap = rowData.headerMap;
    var linkColSource = getCol_(sourceMap, ALIASES.LINK_ENCUESTA);
    var wppColSource = getCol_(sourceMap, ALIASES.ENVIAR_WPP);
    var linkColTarget = getCol_(rejectMap, 'LINK_ENCUESTA');
    var wppColTarget = getCol_(rejectMap, 'ENVIAR WPP');
    if (linkColSource && linkColTarget) {
      var rtLink = rowData.sheet.getRange(rowData.rowIndex, linkColSource).getRichTextValue();
      if (rtLink && rtLink.getLinkUrl()) rejectSheet.getRange(targetRow, linkColTarget).setRichTextValue(rtLink);
    }
    if (wppColSource && wppColTarget) {
      var rtWpp = rowData.sheet.getRange(rowData.rowIndex, wppColSource).getRichTextValue();
      if (rtWpp && rtWpp.getLinkUrl()) rejectSheet.getRange(targetRow, wppColTarget).setRichTextValue(rtWpp);
    }
    var callColTarget = getCol_(rejectMap, 'ABRIR_LLAMADA');
    if (callColTarget && token) {
      var callUrl = getBaseUrlApp_().replace(/\/$/, '') + '/call.html?t=' + encodeURIComponent(token);
      setRichTextCell_(rejectSheet, targetRow, callColTarget, 'Cargar llamada', callUrl);
    }
    aplicarFormatoFilaTmk_(rejectSheet, targetRow);
  } catch (e) {
    Logger.log('No se pudo upsertar TMK - RECHAZADOS desde contexto: ' + e);
  }
}

function guardarEncuesta(token, dni, respuestas) {
  var dniNormalizado = normalizarDni(dni);
  var dniHashInput = generarHash(dniNormalizado);
  var rowData = buscarFilaPorToken(token);
  if (!rowData) {
    registrarLog(token, dniHashInput, 'TOKEN_INVALIDO', 'Token inexistente al intentar guardar', 'guardarEncuestaFinalSinRelecturaTMK');
    return jsonResponse({ status: 'TOKEN_INVALIDO' });
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido') {
    registrarLog(token, dniHashInput, 'YA_RESPONDIO', 'Encuesta duplicada rechazada al guardar', 'guardarEncuestaFinalSinRelecturaTMK');
    return jsonResponse({ status: 'YA_RESPONDIO' });
  }

  var dniHashSheet = String(getVal_(rowValues, headerMap, ALIASES.DNI_HASH) || '').trim();
  var dniPlanoSheet = normalizarDni(getVal_(rowValues, headerMap, ALIASES.DNI));
  var coincideHash = dniHashInput === dniHashSheet;
  var coincidePlano = !!dniPlanoSheet && dniNormalizado === dniPlanoSheet;
  if (!coincideHash && !coincidePlano) {
    registrarLog(token, dniHashInput, 'DNI_INVALIDO', 'DNI incorrecto al intentar guardar', 'guardarEncuestaFinalSinRelecturaTMK');
    return jsonResponse({ status: 'DNI_INVALIDO' });
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoring_(rowData, scoring, 'WEB');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'WEB');
  upsertFilaRechazadosDesdeContexto_(rowData, respuestas, scoring, 'WEB');
  refrescarPostGuardado_();
  registrarLog(token, dniHashInput, 'OK', 'Encuesta procesada: ' + scoring.resultado, 'guardarEncuestaFinalSinRelecturaTMK');
  return jsonResponse({ status: 'OK', scoringResult: scoring.resultado });
}

function guardarLlamadaInterna_(context, respuestas) {
  var rowData = (typeof context === 'string') ? buscarFilaPorToken(context) : buscarFilaDesdeContexto_(context);
  if (!rowData) {
    return { status: 'TOKEN_INVALIDO', message: 'No se encontro la solicitud.' };
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido' || estadoEncuesta === 'Scoring telefonico') {
    return { status: 'YA_RESPONDIO', message: 'Esta gestion ya fue cerrada.' };
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoring_(rowData, scoring, 'TELEFONICO');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'TELEFONICO');
  upsertFilaRechazadosDesdeContexto_(rowData, respuestas, scoring, 'TELEFONICO');
  refrescarPostGuardado_();
  registrarLog(clienteInfo.token || '', clienteInfo.dniHash || '', 'OK', 'Llamada procesada: ' + scoring.resultado, 'guardarLlamadaFinalSinRelecturaTMK');
  return { status: 'OK', scoringResult: scoring.resultado };
}

/**************************************************************
 * OVERRIDE FINAL - REGENERAR LINK ULTRARAPIDO
 **************************************************************/

function quitarFilaDeRechazadosPorIdToken_(idCliente, token) {
  try {
    var rejectSheet = getSheet('TMK - RECHAZADOS');
    var rejectMap = getHeaderMapFlexible_(rejectSheet);
    var row = buscarFilaTMKPorIdToken_(rejectSheet, rejectMap, idCliente, token);
    if (row) rejectSheet.deleteRow(row);
  } catch (e) {
    Logger.log('No se pudo quitar fila de TMK - RECHAZADOS: ' + e);
  }
}

function regenerarLinkFilaSeleccionada_() {
  ensureSheets();

  var activeSheet = SpreadsheetApp.getActiveSheet();
  var rowIndex = SpreadsheetApp.getActiveRange() ? SpreadsheetApp.getActiveRange().getRow() : 0;
  if (!activeSheet || rowIndex < 2) return 'Seleccione una fila valida.';

  var sheetName = activeSheet.getName();
  if (sheetName !== 'TMK - RECHAZADOS' && sheetName !== 'TMK - JUJUY' && sheetName !== 'TMK - SALTA') {
    return 'Abra una fila en TMK o en TMK - RECHAZADOS para regenerar el link.';
  }

  var map = getHeaderMapFlexible_(activeSheet);
  var row = activeSheet.getRange(rowIndex, 1, 1, activeSheet.getLastColumn()).getValues()[0];
  var idCliente = getVal_(row, map, 'ID_CLIENTE');
  var token = getVal_(row, map, 'TOKEN');
  var origen = buscarSolicitudPorIdToken_(idCliente, token);

  if (!origen) return 'No encontre la solicitud original para esa fila.';

  var config = getConfigPorBase_(origen.baseName);
  if (!config) return 'No pude identificar la sucursal de origen.';

  return regenerarLinkDesdeSolicitud_(origen, config, 'RECHAZADO');
}

function regenerarLinkDesdeSolicitud_(rowData, config, motivo) {
  var sheet = rowData.sheet;
  var rowIndex = rowData.rowIndex;
  var headerMap = getHeaderMapFlexible_(sheet);
  var row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

  var nombre = getVal_(row, headerMap, ALIASES.NOMBRE);
  var telefono = getVal_(row, headerMap, ALIASES.TELEFONO);
  var dni = getVal_(row, headerMap, ALIASES.DNI);
  var solicitud = getVal_(row, headerMap, ALIASES.SOLICITUD);
  var tokenAnterior = getVal_(row, headerMap, ALIASES.TOKEN);

  if (!nombre || !telefono || !dni) {
    return 'Faltan nombre, telefono o DNI en la solicitud original.';
  }

  var baseUrl = normalizarNetlifyBaseUrl();
  var nuevoToken = 'T' + Utilities.getUuid().slice(0, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
  var idCliente = getVal_(row, headerMap, ALIASES.ID_CLIENTE) || construirIdCliente_(config.sucursal, solicitud, dni);
  var dniHash = getVal_(row, headerMap, ALIASES.DNI_HASH) || generarHashDniParaCarga(dni);
  var link = baseUrl + '?t=' + nuevoToken;
  var waLink = crearLinkWhatsApp_(telefono, nombre, link);
  var ahora = new Date();

  setVal_(sheet, rowIndex, headerMap, ALIASES.ID_CLIENTE, idCliente);
  setVal_(sheet, rowIndex, headerMap, ALIASES.TOKEN, nuevoToken);
  setVal_(sheet, rowIndex, headerMap, ALIASES.DNI_HASH, dniHash);
  setCeldaLinkEncuesta(sheet, rowIndex, getCol_(headerMap, ALIASES.LINK_ENCUESTA), link);
  if (waLink) setCeldaLinkWhatsApp(sheet, rowIndex, getCol_(headerMap, ALIASES.ENVIAR_WPP), waLink, nombre);
  setVal_(sheet, rowIndex, headerMap, ALIASES.ESTADO_ENCUESTA, 'Link regenerado');
  setVal_(sheet, rowIndex, headerMap, ALIASES.FECHA_ENVIO_LINK, ahora);
  limpiarCamposRevalidacionEnFila_(sheet, rowIndex, headerMap);
  setVal_(sheet, rowIndex, headerMap, 'CANTIDAD_INTENTOS_WPP', 0);
  aplicarFormatoFilaSolicitudGenerada_(sheet, rowIndex, headerMap);

  var tmkSheet = getSheet(config.tmk);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var tmkRow = upsertFilaTMKDesdeSolicitud_(config, rowIndex);
  if (tmkRow) {
    var filaTmkActual = tmkSheet.getRange(tmkRow, 1, 1, tmkSheet.getLastColumn()).getValues()[0];
    var observacionAnterior = getVal_(filaTmkActual, tmkMap, 'OBSERVACION_TMK');
    var cantidadRevalidaciones = obtenerCantidadRevalidaciones_(observacionAnterior) + 1;

    limpiarCamposRevalidacionEnFila_(tmkSheet, tmkRow, tmkMap);
    setVal_(tmkSheet, tmkRow, tmkMap, 'DECISION_FINAL', 'PENDIENTE');
    setVal_(tmkSheet, tmkRow, tmkMap, 'ESTADO_TMK', 'Pendiente envio');
    setVal_(tmkSheet, tmkRow, tmkMap, 'PROXIMA_ACCION', 'Enviar WPP');
    setVal_(tmkSheet, tmkRow, tmkMap, 'PRIORIDAD', 'Alta');
    setVal_(tmkSheet, tmkRow, tmkMap, 'CANTIDAD_INTENTOS_WPP', 0);
    setVal_(tmkSheet, tmkRow, tmkMap, 'OBSERVACION_TMK', construirTextoRevalidacion_(cantidadRevalidaciones, motivo));
    aplicarFormatoFilaTmk_(tmkSheet, tmkRow);
  }

  quitarFilaDeRechazadosPorIdToken_(idCliente, tokenAnterior);
  quitarFilaDeRechazadosPorIdToken_(idCliente, nuevoToken);

  try {
    var cache = CacheService.getScriptCache();
    if (tokenAnterior) cache.remove(getTokenCacheKey_(tokenAnterior));
    cache.remove(getTokenCacheKey_(nuevoToken));
  } catch (e) {
    Logger.log('No se pudo limpiar cache de token: ' + e);
  }

  SpreadsheetApp.flush();
  return 'Link regenerado. Use el nuevo WhatsApp para reenviar la validacion.';
}

/**************************************************************
 * OVERRIDE FINAL - RENDIMIENTO POR FILA
 **************************************************************/

function mutarFilaPorCambios_(rowValues, headerMap, changes) {
  var out = rowValues.slice();
  for (var key in changes) {
    var col = getCol_(headerMap, key);
    if (col) out[col - 1] = changes[key];
  }
  return out;
}

function setRichTextCellLabelUrl_(sheet, rowIndex, colIndex, text, url) {
  if (!colIndex) return;
  var richText = SpreadsheetApp.newRichTextValue()
    .setText(text)
    .setLinkUrl(url)
    .build();
  sheet.getRange(rowIndex, colIndex).setRichTextValue(richText);
}

function escribirRespuestasEnFilaTMKRapidaFinal_(sheet, rowIndex, headerMap, respuestas, scoring, canal) {
  var current = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  var updated = mutarFilaPorCambios_(current, headerMap, {
    'Q1_Conocia_plan_exclusivo': respuestas.q1,
    'Q2_Informaron_licitacion_cuota_2': respuestas.q2,
    'Q3_Informaron_adjudicacion_asegurada': respuestas.q3,
    'Q4_Informaron_monto_cuota_2': respuestas.q4,
    'Q4A_Monto_estimado_cuota_2': respuestas.q4a || '',
    'Q5_Monto_primera_cuota': respuestas.q5,
    'Q5A_Acepto_debito_automatico': respuestas.q5a,
    'Q5B_Fecha_pago_primera_cuota': respuestas.q5b,
    'Q6_Quien_es_vendedor': respuestas.q6,
    'Q7_Tuvo_otro_plan_reciente': respuestas.q7,
    'Q7A_Detalle_otro_plan': respuestas.q7a || '',
    'Q8_Como_conocio_propuesta': respuestas.q8,
    'Q9_Necesita_recontacto': respuestas.q9,
    'Q10_Observaciones_cliente': respuestas.q10 || '',
    'RESULTADO_SCORING': scoring.resultado,
    'MOTIVO_RESULTADO': scoring.motivo,
    'REQUIERE_RECONTACTO': scoring.requiereRecontacto,
    'AREA_A_REVISAR': scoring.area,
    'OBSERVACION_INTERNA': scoring.observacion,
    'FECHA_REALIZACION_SCORING': new Date(),
    'CANAL_SCORING': canal,
    'DECISION_FINAL': decisionDesdeScoring_(scoring.resultado),
    'MOTIVO_DECISION': scoring.motivo,
    'FECHA_DECISION': new Date(),
    'ESTADO_TMK': estadoTmkDesdeResultado_(scoring.resultado, canal),
    'PROXIMA_ACCION': proximaAccionDesdeResultado_(scoring.resultado),
    'PRIORIDAD': prioridadDesdeResultado_(scoring.resultado, scoring.requiereRecontacto),
    'ULTIMO_CONTACTO_TMK': new Date(),
    'FECHA_RESPUESTA_WEB': canal === 'WEB' ? new Date() : getVal_(current, headerMap, 'FECHA_RESPUESTA_WEB')
  });
  sheet.getRange(rowIndex, 1, 1, updated.length).setValues([updated]);
}

function actualizarSolicitudConScoringRapida_(rowData, scoring, canal) {
  var sheet = rowData.sheet;
  var headerMap = rowData.headerMap;
  var current = sheet.getRange(rowData.rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  var updated = mutarFilaPorCambios_(current, headerMap, {
    'ESTADO_ENCUESTA': canal === 'WEB' ? 'Respondido' : 'Scoring telefonico'
  });
  sheet.getRange(rowData.rowIndex, 1, 1, updated.length).setValues([updated]);
  rowData.values = updated;
}

function volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, canal) {
  var tmkSheet = getSheet(rowData.tmkName);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var idCliente = getVal_(rowData.values, rowData.headerMap, ALIASES.ID_CLIENTE);
  var token = getVal_(rowData.values, rowData.headerMap, ALIASES.TOKEN);
  var targetRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap, idCliente, token);

  if (!targetRow) {
    var config = getConfigPorBase_(rowData.baseName);
    if (config) {
      targetRow = upsertFilaTMKDesdeSolicitud_(config, rowData.rowIndex);
      tmkMap = getHeaderMapFlexible_(tmkSheet);
    }
  }

  if (!targetRow) return;
  escribirRespuestasEnFilaTMKRapidaFinal_(tmkSheet, targetRow, tmkMap, respuestas, scoring, canal);
  aplicarFormatoFilaTmk_(tmkSheet, targetRow);
}

function guardarEncuesta(token, dni, respuestas) {
  var dniNormalizado = normalizarDni(dni);
  var dniHashInput = generarHash(dniNormalizado);
  var rowData = buscarFilaPorToken(token);
  if (!rowData) {
    registrarLog(token, dniHashInput, 'TOKEN_INVALIDO', 'Token inexistente al intentar guardar', 'guardarEncuestaFinalRapida');
    return jsonResponse({ status: 'TOKEN_INVALIDO' });
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido') {
    registrarLog(token, dniHashInput, 'YA_RESPONDIO', 'Encuesta duplicada rechazada al guardar', 'guardarEncuestaFinalRapida');
    return jsonResponse({ status: 'YA_RESPONDIO' });
  }

  var dniHashSheet = String(getVal_(rowValues, headerMap, ALIASES.DNI_HASH) || '').trim();
  var dniPlanoSheet = normalizarDni(getVal_(rowValues, headerMap, ALIASES.DNI));
  var coincideHash = dniHashInput === dniHashSheet;
  var coincidePlano = !!dniPlanoSheet && dniNormalizado === dniPlanoSheet;
  if (!coincideHash && !coincidePlano) {
    registrarLog(token, dniHashInput, 'DNI_INVALIDO', 'DNI incorrecto al intentar guardar', 'guardarEncuestaFinalRapida');
    return jsonResponse({ status: 'DNI_INVALIDO' });
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoringRapida_(rowData, scoring, 'WEB');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'WEB');
  upsertFilaRechazadosDesdeContexto_(rowData, respuestas, scoring, 'WEB');
  SpreadsheetApp.flush();
  registrarLog(token, dniHashInput, 'OK', 'Encuesta procesada: ' + scoring.resultado, 'guardarEncuestaFinalRapida');
  return jsonResponse({ status: 'OK', scoringResult: scoring.resultado });
}

function guardarLlamadaInterna_(context, respuestas) {
  var rowData = (typeof context === 'string') ? buscarFilaPorToken(context) : buscarFilaDesdeContexto_(context);
  if (!rowData) {
    return { status: 'TOKEN_INVALIDO', message: 'No se encontro la solicitud.' };
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido' || estadoEncuesta === 'Scoring telefonico') {
    return { status: 'YA_RESPONDIO', message: 'Esta gestion ya fue cerrada.' };
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoringRapida_(rowData, scoring, 'TELEFONICO');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'TELEFONICO');
  upsertFilaRechazadosDesdeContexto_(rowData, respuestas, scoring, 'TELEFONICO');
  SpreadsheetApp.flush();
  registrarLog(clienteInfo.token || '', clienteInfo.dniHash || '', 'OK', 'Llamada procesada: ' + scoring.resultado, 'guardarLlamadaFinalRapida');
  return { status: 'OK', scoringResult: scoring.resultado };
}

function regenerarLinkDesdeSolicitud_(rowData, config, motivo) {
  var sheet = rowData.sheet;
  var rowIndex = rowData.rowIndex;
  var headerMap = getHeaderMapFlexible_(sheet);
  var row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

  var nombre = getVal_(row, headerMap, ALIASES.NOMBRE);
  var telefono = getVal_(row, headerMap, ALIASES.TELEFONO);
  var dni = getVal_(row, headerMap, ALIASES.DNI);
  var solicitud = getVal_(row, headerMap, ALIASES.SOLICITUD);
  var tokenAnterior = getVal_(row, headerMap, ALIASES.TOKEN);

  if (!nombre || !telefono || !dni) {
    return 'Faltan nombre, telefono o DNI en la solicitud original.';
  }

  var baseUrl = normalizarNetlifyBaseUrl();
  var nuevoToken = 'T' + Utilities.getUuid().slice(0, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
  var idCliente = getVal_(row, headerMap, ALIASES.ID_CLIENTE) || construirIdCliente_(config.sucursal, solicitud, dni);
  var dniHash = getVal_(row, headerMap, ALIASES.DNI_HASH) || generarHashDniParaCarga(dni);
  var link = baseUrl + '?t=' + nuevoToken;
  var waLink = crearLinkWhatsApp_(telefono, nombre, link);
  var ahora = new Date();

  var updatedSolicitud = mutarFilaPorCambios_(row, headerMap, {
    'ID_CLIENTE': idCliente,
    'TOKEN': nuevoToken,
    'DNI_HASH': dniHash,
    'ESTADO_ENCUESTA': 'Link regenerado',
    'FECHA_ENVIO_LINK': ahora,
    'CANTIDAD_INTENTOS_WPP': 0,
    'DECISION_FINAL': 'PENDIENTE',
    'MOTIVO_DECISION': '',
    'FECHA_DECISION': '',
    'RESULTADO_SCORING': '',
    'MOTIVO_RESULTADO': '',
    'REQUIERE_RECONTACTO': '',
    'AREA_A_REVISAR': '',
    'OBSERVACION_INTERNA': '',
    'Q1_Conocia_plan_exclusivo': '',
    'Q2_Informaron_licitacion_cuota_2': '',
    'Q3_Informaron_adjudicacion_asegurada': '',
    'Q4_Informaron_monto_cuota_2': '',
    'Q4A_Monto_estimado_cuota_2': '',
    'Q5_Monto_primera_cuota': '',
    'Q5A_Acepto_debito_automatico': '',
    'Q5B_Fecha_pago_primera_cuota': '',
    'Q6_Quien_es_vendedor': '',
    'Q7_Tuvo_otro_plan_reciente': '',
    'Q7A_Detalle_otro_plan': '',
    'Q8_Como_conocio_propuesta': '',
    'Q9_Necesita_recontacto': '',
    'Q10_Observaciones_cliente': '',
    'FECHA_RESPUESTA_WEB': '',
    'FECHA_REALIZACION_SCORING': '',
    'CANAL_SCORING': '',
    'GESTIONADO_POR': '',
    'OBSERVACION_TMK': '',
    'FECHA_PROXIMO_CONTACTO': '',
    'FECHA_ULTIMO_ENVIO_WPP': '',
    'ULTIMO_CONTACTO_TMK': ''
  });
  sheet.getRange(rowIndex, 1, 1, updatedSolicitud.length).setValues([updatedSolicitud]);
  setCeldaLinkEncuesta(sheet, rowIndex, getCol_(headerMap, ALIASES.LINK_ENCUESTA), link);
  if (waLink) setCeldaLinkWhatsApp(sheet, rowIndex, getCol_(headerMap, ALIASES.ENVIAR_WPP), waLink, nombre);
  aplicarFormatoFilaSolicitudGenerada_(sheet, rowIndex, headerMap);
  rowData.values = updatedSolicitud;

  var tmkSheet = getSheet(config.tmk);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var tmkRow = upsertFilaTMKDesdeSolicitud_(config, rowIndex);
  if (tmkRow) {
    var filaTmkActual = tmkSheet.getRange(tmkRow, 1, 1, tmkSheet.getLastColumn()).getValues()[0];
    var observacionAnterior = getVal_(filaTmkActual, tmkMap, 'OBSERVACION_TMK');
    var cantidadRevalidaciones = obtenerCantidadRevalidaciones_(observacionAnterior) + 1;
    var updatedTmk = mutarFilaPorCambios_(filaTmkActual, tmkMap, {
      'DECISION_FINAL': 'PENDIENTE',
      'ESTADO_TMK': 'Pendiente envio',
      'PROXIMA_ACCION': 'Enviar WPP',
      'PRIORIDAD': 'Alta',
      'CANTIDAD_INTENTOS_WPP': 0,
      'OBSERVACION_TMK': construirTextoRevalidacion_(cantidadRevalidaciones, motivo),
      'MOTIVO_DECISION': '',
      'FECHA_DECISION': '',
      'RESULTADO_SCORING': '',
      'MOTIVO_RESULTADO': '',
      'REQUIERE_RECONTACTO': '',
      'AREA_A_REVISAR': '',
      'OBSERVACION_INTERNA': '',
      'Q1_Conocia_plan_exclusivo': '',
      'Q2_Informaron_licitacion_cuota_2': '',
      'Q3_Informaron_adjudicacion_asegurada': '',
      'Q4_Informaron_monto_cuota_2': '',
      'Q4A_Monto_estimado_cuota_2': '',
      'Q5_Monto_primera_cuota': '',
      'Q5A_Acepto_debito_automatico': '',
      'Q5B_Fecha_pago_primera_cuota': '',
      'Q6_Quien_es_vendedor': '',
      'Q7_Tuvo_otro_plan_reciente': '',
      'Q7A_Detalle_otro_plan': '',
      'Q8_Como_conocio_propuesta': '',
      'Q9_Necesita_recontacto': '',
      'Q10_Observaciones_cliente': '',
      'FECHA_RESPUESTA_WEB': '',
      'FECHA_REALIZACION_SCORING': '',
      'CANAL_SCORING': '',
      'FECHA_PROXIMO_CONTACTO': '',
      'FECHA_ULTIMO_ENVIO_WPP': '',
      'ULTIMO_CONTACTO_TMK': ''
    });
    tmkSheet.getRange(tmkRow, 1, 1, updatedTmk.length).setValues([updatedTmk]);
    restaurarRichTextFilaTMKDesdeSolicitud_(sheet, headerMap, rowIndex, tmkSheet, tmkRow);
    var callCol = getCol_(tmkMap, 'ABRIR_LLAMADA');
    if (callCol) {
      var callUrl = getBaseUrlApp_().replace(/\/$/, '') + '/call.html?t=' + encodeURIComponent(nuevoToken);
      setRichTextCellLabelUrl_(tmkSheet, tmkRow, callCol, 'Cargar llamada', callUrl);
    }
    aplicarFormatoFilaTmk_(tmkSheet, tmkRow);
  }

  quitarFilaDeRechazadosPorIdToken_(idCliente, tokenAnterior);
  quitarFilaDeRechazadosPorIdToken_(idCliente, nuevoToken);

  try {
    var cache = CacheService.getScriptCache();
    if (tokenAnterior) cache.remove(getTokenCacheKey_(tokenAnterior));
    cache.remove(getTokenCacheKey_(nuevoToken));
  } catch (e) {
    Logger.log('No se pudo limpiar cache de token: ' + e);
  }

  SpreadsheetApp.flush();
  return 'Link regenerado. Use el nuevo WhatsApp para reenviar la validacion.';
}

/**************************************************************
 * OVERRIDE FINAL - CACHE DE BUSQUEDAS GRANDES
 **************************************************************/

function getSolicitudCacheKey_(idCliente, token) {
  return 'solicitud::' + String(idCliente || '').trim() + '::' + String(token || '').trim();
}

function getTmkCacheKey_(sheetName, idCliente, token) {
  return 'tmk::' + String(sheetName || '').trim() + '::' + String(idCliente || '').trim() + '::' + String(token || '').trim();
}

function buscarSolicitudPorIdToken_(idCliente, token) {
  idCliente = String(idCliente || '').trim();
  token = String(token || '').trim();
  if (!idCliente && !token) return null;

  var cache = CacheService.getScriptCache();
  var cacheKey = getSolicitudCacheKey_(idCliente, token);
  var cached = cache.get(cacheKey);
  if (cached) {
    try {
      var meta = JSON.parse(cached);
      var configCached = getConfigPorBase_(meta.baseName);
      if (configCached) {
        var sheetCached = getSheet(configCached.base);
        if (meta.rowIndex >= 2 && meta.rowIndex <= sheetCached.getLastRow()) {
          var mapCached = getHeaderMapFlexible_(sheetCached);
          var rowCached = sheetCached.getRange(meta.rowIndex, 1, 1, sheetCached.getLastColumn()).getValues()[0];
          var idCached = String(getVal_(rowCached, mapCached, ALIASES.ID_CLIENTE) || '').trim();
          var tkCached = String(getVal_(rowCached, mapCached, ALIASES.TOKEN) || '').trim();
          if ((idCliente && idCached === idCliente) || (token && tkCached === token)) {
            return {
              rowIndex: meta.rowIndex,
              values: rowCached,
              headerMap: mapCached,
              sheet: sheetCached,
              baseName: configCached.base,
              tmkName: configCached.tmk,
              sucursal: configCached.sucursal
            };
          }
        }
      }
    } catch (e) {
      Logger.log('Cache solicitud invalido: ' + e);
    }
  }

  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var config = SOLICITUDES_CONFIG[c];
    var sheet = getSheet(config.base);
    var map = getHeaderMapFlexible_(sheet);
    if (sheet.getLastRow() < 2) continue;
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var id = String(getVal_(row, map, ALIASES.ID_CLIENTE) || '').trim();
      var tk = String(getVal_(row, map, ALIASES.TOKEN) || '').trim();
      if ((idCliente && id === idCliente) || (token && tk === token)) {
        cache.put(cacheKey, JSON.stringify({ baseName: config.base, rowIndex: i + 2 }), 21600);
        if (id) cache.put(getSolicitudCacheKey_(id, ''), JSON.stringify({ baseName: config.base, rowIndex: i + 2 }), 21600);
        if (tk) cache.put(getSolicitudCacheKey_('', tk), JSON.stringify({ baseName: config.base, rowIndex: i + 2 }), 21600);
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

function buscarFilaTMKPorIdToken_(sheet, headerMap, idCliente, token) {
  if (sheet.getLastRow() < 2) return 0;
  idCliente = String(idCliente || '').trim();
  token = String(token || '').trim();
  if (!idCliente && !token) return 0;

  var cache = CacheService.getScriptCache();
  var cacheKey = getTmkCacheKey_(sheet.getName(), idCliente, token);
  var cached = cache.get(cacheKey);
  if (cached) {
    var cachedRow = parseInt(cached, 10);
    if (cachedRow >= 2 && cachedRow <= sheet.getLastRow()) {
      var row = sheet.getRange(cachedRow, 1, 1, sheet.getLastColumn()).getValues()[0];
      var idCurrent = String(getVal_(row, headerMap, 'ID_CLIENTE') || '').trim();
      var tkCurrent = String(getVal_(row, headerMap, 'TOKEN') || '').trim();
      if ((idCliente && idCurrent === idCliente) || (token && tkCurrent === token)) return cachedRow;
    }
  }

  var idCol = getCol_(headerMap, 'ID_CLIENTE');
  var tokenCol = getCol_(headerMap, 'TOKEN');
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (var i = 0; i < data.length; i++) {
    var rowId = idCol ? String(data[i][idCol - 1] || '').trim() : '';
    var rowToken = tokenCol ? String(data[i][tokenCol - 1] || '').trim() : '';
    if ((idCliente && rowId === idCliente) || (token && rowToken === token)) {
      cache.put(cacheKey, String(i + 2), 21600);
      if (rowId) cache.put(getTmkCacheKey_(sheet.getName(), rowId, ''), String(i + 2), 21600);
      if (rowToken) cache.put(getTmkCacheKey_(sheet.getName(), '', rowToken), String(i + 2), 21600);
      return i + 2;
    }
  }
  return 0;
}

function guardarRespuestaScoringRapida_(cliente, respuestas, scoring) {
  var sheet = getSheet('Respuestas_Scoring');
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, HEADERS_RESPUESTAS_SCORING.length).setValues([HEADERS_RESPUESTAS_SCORING]);
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = [];
  var idRespuesta = 'R-' + Utilities.getUuid().slice(0, 8).toUpperCase();
  var fechaActual = new Date();

  for (var i = 0; i < headers.length; i++) {
    var h = headers[i];
    var val = '';
    switch (h) {
      case 'ID_RESPUESTA': val = idRespuesta; break;
      case 'ID_CLIENTE': val = cliente.idCliente; break;
      case 'TOKEN_HASH': val = cliente.token; break;
      case 'DNI_HASH': val = cliente.dniHash; break;
      case 'Fecha respuesta': val = fechaActual; break;
      case 'Nombre y Apellido': val = cliente.nombre; break;
      case 'Modelo suscripto': val = cliente.modelo; break;
      case 'Nombre del Asesor': val = cliente.asesor; break;
      case 'Monto_2da_cuota_base': val = cliente.montoCuota2Base; break;
      case 'Q1_Conocia_plan_exclusivo': val = respuestas.q1; break;
      case 'Q2_Informaron_licitacion_cuota_2': val = respuestas.q2; break;
      case 'Q3_Informaron_adjudicacion_asegurada': val = respuestas.q3; break;
      case 'Q4_Informaron_monto_cuota_2': val = respuestas.q4; break;
      case 'Q4A_Monto_estimado_cuota_2': val = respuestas.q4a || ''; break;
      case 'Q5_Monto_primera_cuota': val = respuestas.q5; break;
      case 'Q5A_Acepto_debito_automatico': val = respuestas.q5a; break;
      case 'Q5B_Fecha_pago_primera_cuota': val = respuestas.q5b; break;
      case 'Q6_Quien_es_vendedor': val = respuestas.q6; break;
      case 'Q7_Tuvo_otro_plan_reciente': val = respuestas.q7; break;
      case 'Q7A_Detalle_otro_plan': val = respuestas.q7a || ''; break;
      case 'Q8_Como_conocio_propuesta': val = respuestas.q8; break;
      case 'Q9_Necesita_recontacto': val = respuestas.q9; break;
      case 'Q10_Observaciones_cliente': val = respuestas.q10 || ''; break;
      case 'RESULTADO_SCORING': val = scoring.resultado; break;
      case 'MOTIVO_RESULTADO': val = scoring.motivo; break;
      case 'REQUIERE_RECONTACTO': val = scoring.requiereRecontacto; break;
      case 'AREA_A_REVISAR': val = scoring.area; break;
      case 'OBSERVACION_INTERNA': val = scoring.observacion; break;
    }
    newRow.push(val);
  }

  var targetRow = sheet.getLastRow() + 1;
  sheet.getRange(targetRow, 1, 1, newRow.length).setValues([newRow]);
}

/**************************************************************
 * OVERRIDE FINAL - PORCENTAJES CONFIG PLANES LEGIBLES
 **************************************************************/

function normalizarPorcentajeConfig_(valor) {
  if (valor === null || valor === undefined || valor === '') return '';
  if (typeof valor === 'number') {
    var numero = valor <= 1 ? valor * 100 : valor;
    if (Math.round(numero) === numero) return String(Math.round(numero)) + '%';
    return String(Math.round(numero * 100) / 100).replace('.', ',') + '%';
  }

  var texto = String(valor).trim();
  if (!texto) return '';
  if (texto.indexOf('%') !== -1) return texto;
  if (/^0[\.,]\d+$/.test(texto)) {
    var decimal = parseFloat(texto.replace(',', '.'));
    if (!isNaN(decimal)) return String(Math.round(decimal * 100)) + '%';
  }
  if (/^\d+(?:[\.,]\d+)?$/.test(texto)) {
    var numeroTexto = parseFloat(texto.replace(',', '.'));
    if (!isNaN(numeroTexto)) {
      if (numeroTexto <= 1) return String(Math.round(numeroTexto * 100)) + '%';
      if (Math.round(numeroTexto) === numeroTexto) return String(Math.round(numeroTexto)) + '%';
    }
  }
  return texto;
}

function leerConfigPlanes_() {
  var sheet = getSheet('CONFIG_PLANES');
  if (sheet.getLastRow() < 2) ensureConfigPlanesSheet_();
  var data = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 8).getValues();
  var out = [];
  for (var i = 0; i < data.length; i++) {
    var activo = String(data[i][7] || '').toUpperCase().trim();
    if (activo === 'NO') continue;
    out.push({
      modeloBase: String(data[i][0] || '').trim(),
      match: String(data[i][1] || '').toUpperCase().trim(),
      planAuto: String(data[i][2] || '').trim(),
      financia: normalizarPorcentajeConfig_(data[i][3]),
      licita: normalizarPorcentajeConfig_(data[i][4]),
      cta: String(data[i][5] || '').trim(),
      mostrarQ3: String(data[i][6] || '').toUpperCase().trim() !== 'NO'
    });
  }
  out.sort(function(a, b) { return b.match.length - a.match.length; });
  return out;
}

/**************************************************************
 * OVERRIDE FINAL - ESTRUCTURA PARA CRECIMIENTO
 **************************************************************/

var SHEET_INDICE_OPERATIVO = 'INDICE_OPERATIVO';
var SHEET_LOG_OPERATIVO = 'LOG_OPERATIVO';

function ensureGrowthSheets_() {
  ensureHeadersPresent_(getSheet(SHEET_INDICE_OPERATIVO), [
    'TOKEN',
    'ID_CLIENTE',
    'SUCURSAL',
    'BASE_NAME',
    'SOLICITUD_ROW',
    'TMK_NAME',
    'TMK_ROW',
    'ESTADO_ENCUESTA',
    'DECISION_FINAL',
    'UPDATED_AT'
  ]);
  ensureHeadersPresent_(getSheet(SHEET_LOG_OPERATIVO), [
    'FECHA',
    'ACCION',
    'TOKEN',
    'ID_CLIENTE',
    'SUCURSAL',
    'HOJA',
    'FILA',
    'RESULTADO',
    'DETALLE'
  ]);
}

function ensureSheets() {
  var ss = getSpreadsheet();
  var required = ['Respuestas_Scoring', 'Preguntas', 'Log_Seguridad', 'INSTRUCCIONES', 'CONFIG_PLANES', SHEET_INDICE_OPERATIVO, SHEET_LOG_OPERATIVO];

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

  ensureGrowthSheets_();
}

function registrarLogOperativo_(accion, meta) {
  try {
    ensureGrowthSheets_();
    meta = meta || {};
    var sheet = getSheet(SHEET_LOG_OPERATIVO);
    var row = [[
      new Date(),
      accion || '',
      meta.token || '',
      meta.idCliente || '',
      meta.sucursal || '',
      meta.hoja || '',
      meta.fila || '',
      meta.resultado || '',
      meta.detalle || ''
    ]];
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row[0].length).setValues(row);
  } catch (e) {
    Logger.log('No se pudo registrar LOG_OPERATIVO: ' + e);
  }
}

function buscarFilaIndiceOperativo_(sheet, token, idCliente) {
  if (sheet.getLastRow() < 2) return 0;
  var map = getHeaderMapFlexible_(sheet);
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (var i = 0; i < data.length; i++) {
    var tk = String(getVal_(data[i], map, 'TOKEN') || '').trim();
    var id = String(getVal_(data[i], map, 'ID_CLIENTE') || '').trim();
    if ((token && tk === token) || (idCliente && id === idCliente)) return i + 2;
  }
  return 0;
}

function upsertIndiceOperativo_(meta) {
  try {
    ensureGrowthSheets_();
    meta = meta || {};
    var token = String(meta.token || '').trim();
    var idCliente = String(meta.idCliente || '').trim();
    if (!token && !idCliente) return 0;

    var sheet = getSheet(SHEET_INDICE_OPERATIVO);
    var map = getHeaderMapFlexible_(sheet);
    var rowIndex = buscarFilaIndiceOperativo_(sheet, token, idCliente);
    var values = rowIndex >= 2
      ? sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0]
      : new Array(sheet.getLastColumn()).fill('');

    var updated = mutarFilaPorCambios_(values, map, {
      'TOKEN': token,
      'ID_CLIENTE': idCliente,
      'SUCURSAL': meta.sucursal || '',
      'BASE_NAME': meta.baseName || '',
      'SOLICITUD_ROW': meta.solicitudRow || '',
      'TMK_NAME': meta.tmkName || '',
      'TMK_ROW': meta.tmkRow || '',
      'ESTADO_ENCUESTA': meta.estadoEncuesta || '',
      'DECISION_FINAL': meta.decisionFinal || '',
      'UPDATED_AT': new Date()
    });

    if (rowIndex >= 2) {
      sheet.getRange(rowIndex, 1, 1, updated.length).setValues([updated]);
      return rowIndex;
    }

    var targetRow = sheet.getLastRow() + 1;
    sheet.getRange(targetRow, 1, 1, updated.length).setValues([updated]);
    return targetRow;
  } catch (e) {
    Logger.log('No se pudo upsertar INDICE_OPERATIVO: ' + e);
    return 0;
  }
}

function leerIndiceOperativoPorIdToken_(idCliente, token) {
  ensureGrowthSheets_();
  var sheet = getSheet(SHEET_INDICE_OPERATIVO);
  var rowIndex = buscarFilaIndiceOperativo_(sheet, String(token || '').trim(), String(idCliente || '').trim());
  if (!rowIndex) return null;
  var map = getHeaderMapFlexible_(sheet);
  var row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  return {
    rowIndex: rowIndex,
    token: String(getVal_(row, map, 'TOKEN') || '').trim(),
    idCliente: String(getVal_(row, map, 'ID_CLIENTE') || '').trim(),
    sucursal: String(getVal_(row, map, 'SUCURSAL') || '').trim(),
    baseName: String(getVal_(row, map, 'BASE_NAME') || '').trim(),
    solicitudRow: parseInt(getVal_(row, map, 'SOLICITUD_ROW') || 0, 10) || 0,
    tmkName: String(getVal_(row, map, 'TMK_NAME') || '').trim(),
    tmkRow: parseInt(getVal_(row, map, 'TMK_ROW') || 0, 10) || 0,
    estadoEncuesta: String(getVal_(row, map, 'ESTADO_ENCUESTA') || '').trim(),
    decisionFinal: String(getVal_(row, map, 'DECISION_FINAL') || '').trim()
  };
}

function buscarSolicitudPorIdToken_(idCliente, token) {
  idCliente = String(idCliente || '').trim();
  token = String(token || '').trim();
  if (!idCliente && !token) return null;

  var indexed = leerIndiceOperativoPorIdToken_(idCliente, token);
  if (indexed && indexed.baseName && indexed.solicitudRow >= 2) {
    var configIndexed = getConfigPorBase_(indexed.baseName);
    if (configIndexed) {
      var sheetIndexed = getSheet(configIndexed.base);
      if (indexed.solicitudRow <= sheetIndexed.getLastRow()) {
        var mapIndexed = getHeaderMapFlexible_(sheetIndexed);
        var rowIndexed = sheetIndexed.getRange(indexed.solicitudRow, 1, 1, sheetIndexed.getLastColumn()).getValues()[0];
        var idIndexed = String(getVal_(rowIndexed, mapIndexed, ALIASES.ID_CLIENTE) || '').trim();
        var tkIndexed = String(getVal_(rowIndexed, mapIndexed, ALIASES.TOKEN) || '').trim();
        if ((idCliente && idIndexed === idCliente) || (token && tkIndexed === token)) {
          return {
            rowIndex: indexed.solicitudRow,
            values: rowIndexed,
            headerMap: mapIndexed,
            sheet: sheetIndexed,
            baseName: configIndexed.base,
            tmkName: configIndexed.tmk,
            sucursal: configIndexed.sucursal
          };
        }
      }
    }
  }

  var cache = CacheService.getScriptCache();
  var cacheKey = getSolicitudCacheKey_(idCliente, token);
  var cached = cache.get(cacheKey);
  if (cached) {
    try {
      var meta = JSON.parse(cached);
      var configCached = getConfigPorBase_(meta.baseName);
      if (configCached) {
        var sheetCached = getSheet(configCached.base);
        if (meta.rowIndex >= 2 && meta.rowIndex <= sheetCached.getLastRow()) {
          var mapCached = getHeaderMapFlexible_(sheetCached);
          var rowCached = sheetCached.getRange(meta.rowIndex, 1, 1, sheetCached.getLastColumn()).getValues()[0];
          var idCached = String(getVal_(rowCached, mapCached, ALIASES.ID_CLIENTE) || '').trim();
          var tkCached = String(getVal_(rowCached, mapCached, ALIASES.TOKEN) || '').trim();
          if ((idCliente && idCached === idCliente) || (token && tkCached === token)) {
            return {
              rowIndex: meta.rowIndex,
              values: rowCached,
              headerMap: mapCached,
              sheet: sheetCached,
              baseName: configCached.base,
              tmkName: configCached.tmk,
              sucursal: configCached.sucursal
            };
          }
        }
      }
    } catch (e) {
      Logger.log('Cache solicitud invalido: ' + e);
    }
  }

  for (var c = 0; c < SOLICITUDES_CONFIG.length; c++) {
    var config = SOLICITUDES_CONFIG[c];
    var sheet = getSheet(config.base);
    var map = getHeaderMapFlexible_(sheet);
    if (sheet.getLastRow() < 2) continue;
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var id = String(getVal_(row, map, ALIASES.ID_CLIENTE) || '').trim();
      var tk = String(getVal_(row, map, ALIASES.TOKEN) || '').trim();
      if ((idCliente && id === idCliente) || (token && tk === token)) {
        cache.put(cacheKey, JSON.stringify({ baseName: config.base, rowIndex: i + 2 }), 21600);
        if (id) cache.put(getSolicitudCacheKey_(id, ''), JSON.stringify({ baseName: config.base, rowIndex: i + 2 }), 21600);
        if (tk) cache.put(getSolicitudCacheKey_('', tk), JSON.stringify({ baseName: config.base, rowIndex: i + 2 }), 21600);
        upsertIndiceOperativo_({
          token: tk,
          idCliente: id,
          sucursal: config.sucursal,
          baseName: config.base,
          solicitudRow: i + 2,
          tmkName: config.tmk,
          estadoEncuesta: String(getVal_(row, map, ALIASES.ESTADO_ENCUESTA) || '').trim(),
          decisionFinal: ''
        });
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

function buscarFilaTMKPorIdToken_(sheet, headerMap, idCliente, token) {
  if (sheet.getLastRow() < 2) return 0;
  idCliente = String(idCliente || '').trim();
  token = String(token || '').trim();
  if (!idCliente && !token) return 0;

  var indexed = leerIndiceOperativoPorIdToken_(idCliente, token);
  if (indexed && indexed.tmkName === sheet.getName() && indexed.tmkRow >= 2 && indexed.tmkRow <= sheet.getLastRow()) {
    var rowIndexed = sheet.getRange(indexed.tmkRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    var idCurrent = String(getVal_(rowIndexed, headerMap, 'ID_CLIENTE') || '').trim();
    var tkCurrent = String(getVal_(rowIndexed, headerMap, 'TOKEN') || '').trim();
    if ((idCliente && idCurrent === idCliente) || (token && tkCurrent === token)) return indexed.tmkRow;
  }

  var cache = CacheService.getScriptCache();
  var cacheKey = getTmkCacheKey_(sheet.getName(), idCliente, token);
  var cached = cache.get(cacheKey);
  if (cached) {
    var cachedRow = parseInt(cached, 10);
    if (cachedRow >= 2 && cachedRow <= sheet.getLastRow()) {
      var row = sheet.getRange(cachedRow, 1, 1, sheet.getLastColumn()).getValues()[0];
      var idCached = String(getVal_(row, headerMap, 'ID_CLIENTE') || '').trim();
      var tkCached = String(getVal_(row, headerMap, 'TOKEN') || '').trim();
      if ((idCliente && idCached === idCliente) || (token && tkCached === token)) return cachedRow;
    }
  }

  var idCol = getCol_(headerMap, 'ID_CLIENTE');
  var tokenCol = getCol_(headerMap, 'TOKEN');
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (var i = 0; i < data.length; i++) {
    var rowId = idCol ? String(data[i][idCol - 1] || '').trim() : '';
    var rowToken = tokenCol ? String(data[i][tokenCol - 1] || '').trim() : '';
    if ((idCliente && rowId === idCliente) || (token && rowToken === token)) {
      cache.put(cacheKey, String(i + 2), 21600);
      if (rowId) cache.put(getTmkCacheKey_(sheet.getName(), rowId, ''), String(i + 2), 21600);
      if (rowToken) cache.put(getTmkCacheKey_(sheet.getName(), '', rowToken), String(i + 2), 21600);
      return i + 2;
    }
  }
  return 0;
}

function upsertFilaTMKDesdeSolicitud_(config, baseRowIndex) {
  var baseSheet = getSheet(config.base);
  var tmkSheet = getSheet(config.tmk);
  var baseMap = getHeaderMapFlexible_(baseSheet);
  var tmkMap = getHeaderMapFlexible_(tmkSheet);
  var baseRow = baseSheet.getRange(baseRowIndex, 1, 1, baseSheet.getLastColumn()).getValues()[0];
  var idCliente = getVal_(baseRow, baseMap, ALIASES.ID_CLIENTE);
  var token = getVal_(baseRow, baseMap, ALIASES.TOKEN);
  if (!idCliente && !token) return 0;

  var targetRow = buscarFilaTMKPorIdToken_(tmkSheet, tmkMap, idCliente, token);
  var existing = {};
  if (targetRow) {
    var current = tmkSheet.getRange(targetRow, 1, 1, tmkSheet.getLastColumn()).getValues()[0];
    for (var i = 0; i < HEADERS_TMK.length; i++) {
      var col = getCol_(tmkMap, HEADERS_TMK[i]);
      existing[HEADERS_TMK[i]] = col ? current[col - 1] : '';
    }
  } else {
    targetRow = Math.max(tmkSheet.getLastRow() + 1, 2);
  }

  var newRow = construirFilaTMK_(config, baseRow, baseMap, existing);
  tmkSheet.getRange(targetRow, 1, 1, HEADERS_TMK.length).setValues([newRow]);
  restaurarRichTextFilaTMKDesdeSolicitud_(baseSheet, baseMap, baseRowIndex, tmkSheet, targetRow);
  aplicarFormatoFilaTmk_(tmkSheet, targetRow);

  upsertIndiceOperativo_({
    token: String(token || '').trim(),
    idCliente: String(idCliente || '').trim(),
    sucursal: config.sucursal,
    baseName: config.base,
    solicitudRow: baseRowIndex,
    tmkName: config.tmk,
    tmkRow: targetRow,
    estadoEncuesta: String(getVal_(baseRow, baseMap, ALIASES.ESTADO_ENCUESTA) || '').trim(),
    decisionFinal: String(existing['DECISION_FINAL'] || '').trim()
  });

  registrarLogOperativo_('UPSERT_TMK', {
    token: String(token || '').trim(),
    idCliente: String(idCliente || '').trim(),
    sucursal: config.sucursal,
    hoja: config.tmk,
    fila: targetRow,
    resultado: 'OK',
    detalle: 'Fila TMK sincronizada desde solicitud'
  });

  return targetRow;
}

function guardarEncuesta(token, dni, respuestas) {
  var dniNormalizado = normalizarDni(dni);
  var dniHashInput = generarHash(dniNormalizado);
  var rowData = buscarFilaPorToken(token);
  if (!rowData) {
    registrarLog(token, dniHashInput, 'TOKEN_INVALIDO', 'Token inexistente al intentar guardar', 'guardarEncuestaFinalCrecimiento');
    registrarLogOperativo_('GUARDAR_ENCUESTA', { token: token, resultado: 'TOKEN_INVALIDO', detalle: 'Token inexistente' });
    return jsonResponse({ status: 'TOKEN_INVALIDO' });
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido') {
    registrarLog(token, dniHashInput, 'YA_RESPONDIO', 'Encuesta duplicada rechazada al guardar', 'guardarEncuestaFinalCrecimiento');
    registrarLogOperativo_('GUARDAR_ENCUESTA', { token: token, idCliente: getVal_(rowValues, headerMap, ALIASES.ID_CLIENTE), sucursal: rowData.sucursal, hoja: rowData.baseName, fila: rowData.rowIndex, resultado: 'YA_RESPONDIO', detalle: 'La gestion ya estaba respondida' });
    return jsonResponse({ status: 'YA_RESPONDIO' });
  }

  var dniHashSheet = String(getVal_(rowValues, headerMap, ALIASES.DNI_HASH) || '').trim();
  var dniPlanoSheet = normalizarDni(getVal_(rowValues, headerMap, ALIASES.DNI));
  var coincideHash = dniHashInput === dniHashSheet;
  var coincidePlano = !!dniPlanoSheet && dniNormalizado === dniPlanoSheet;
  if (!coincideHash && !coincidePlano) {
    registrarLog(token, dniHashInput, 'DNI_INVALIDO', 'DNI incorrecto al intentar guardar', 'guardarEncuestaFinalCrecimiento');
    registrarLogOperativo_('GUARDAR_ENCUESTA', { token: token, idCliente: getVal_(rowValues, headerMap, ALIASES.ID_CLIENTE), sucursal: rowData.sucursal, hoja: rowData.baseName, fila: rowData.rowIndex, resultado: 'DNI_INVALIDO', detalle: 'El DNI no coincide' });
    return jsonResponse({ status: 'DNI_INVALIDO' });
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoringRapida_(rowData, scoring, 'WEB');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'WEB');
  upsertFilaRechazadosDesdeContexto_(rowData, respuestas, scoring, 'WEB');
  upsertIndiceOperativo_({
    token: String(clienteInfo.token || '').trim(),
    idCliente: String(clienteInfo.idCliente || '').trim(),
    sucursal: rowData.sucursal,
    baseName: rowData.baseName,
    solicitudRow: rowData.rowIndex,
    tmkName: rowData.tmkName,
    tmkRow: buscarFilaTMKPorIdToken_(getSheet(rowData.tmkName), getHeaderMapFlexible_(getSheet(rowData.tmkName)), clienteInfo.idCliente, clienteInfo.token),
    estadoEncuesta: 'Respondido',
    decisionFinal: decisionDesdeScoring_(scoring.resultado)
  });
  SpreadsheetApp.flush();
  registrarLog(token, dniHashInput, 'OK', 'Encuesta procesada: ' + scoring.resultado, 'guardarEncuestaFinalCrecimiento');
  registrarLogOperativo_('GUARDAR_ENCUESTA', { token: clienteInfo.token, idCliente: clienteInfo.idCliente, sucursal: rowData.sucursal, hoja: rowData.baseName, fila: rowData.rowIndex, resultado: scoring.resultado, detalle: 'Encuesta web guardada' });
  return jsonResponse({ status: 'OK', scoringResult: scoring.resultado });
}

function guardarLlamadaInterna_(context, respuestas) {
  var rowData = (typeof context === 'string') ? buscarFilaPorToken(context) : buscarFilaDesdeContexto_(context);
  if (!rowData) {
    registrarLogOperativo_('GUARDAR_LLAMADA', { resultado: 'TOKEN_INVALIDO', detalle: 'No se encontro la solicitud' });
    return { status: 'TOKEN_INVALIDO', message: 'No se encontro la solicitud.' };
  }

  var rowValues = rowData.values;
  var headerMap = rowData.headerMap;
  var estadoEncuesta = String(getVal_(rowValues, headerMap, ALIASES.ESTADO_ENCUESTA) || '').trim();
  if (estadoEncuesta === 'Respondido' || estadoEncuesta === 'Scoring telefonico') {
    registrarLogOperativo_('GUARDAR_LLAMADA', { token: getVal_(rowValues, headerMap, ALIASES.TOKEN), idCliente: getVal_(rowValues, headerMap, ALIASES.ID_CLIENTE), sucursal: rowData.sucursal, hoja: rowData.baseName, fila: rowData.rowIndex, resultado: 'YA_RESPONDIO', detalle: 'La gestion ya estaba cerrada' });
    return { status: 'YA_RESPONDIO', message: 'Esta gestion ya fue cerrada.' };
  }

  var scoring = calcularScoring(respuestas);
  var clienteInfo = construirClienteInfoDesdeRowData_(rowData);
  guardarRespuestaScoringRapida_(clienteInfo, respuestas, scoring);
  actualizarSolicitudConScoringRapida_(rowData, scoring, 'TELEFONICO');
  volcarRespuestaEnTMKRapida_(rowData, respuestas, scoring, 'TELEFONICO');
  upsertFilaRechazadosDesdeContexto_(rowData, respuestas, scoring, 'TELEFONICO');
  upsertIndiceOperativo_({
    token: String(clienteInfo.token || '').trim(),
    idCliente: String(clienteInfo.idCliente || '').trim(),
    sucursal: rowData.sucursal,
    baseName: rowData.baseName,
    solicitudRow: rowData.rowIndex,
    tmkName: rowData.tmkName,
    tmkRow: buscarFilaTMKPorIdToken_(getSheet(rowData.tmkName), getHeaderMapFlexible_(getSheet(rowData.tmkName)), clienteInfo.idCliente, clienteInfo.token),
    estadoEncuesta: 'Scoring telefonico',
    decisionFinal: decisionDesdeScoring_(scoring.resultado)
  });
  SpreadsheetApp.flush();
  registrarLog(clienteInfo.token || '', clienteInfo.dniHash || '', 'OK', 'Llamada procesada: ' + scoring.resultado, 'guardarLlamadaFinalCrecimiento');
  registrarLogOperativo_('GUARDAR_LLAMADA', { token: clienteInfo.token, idCliente: clienteInfo.idCliente, sucursal: rowData.sucursal, hoja: rowData.baseName, fila: rowData.rowIndex, resultado: scoring.resultado, detalle: 'Scoring telefonico guardado' });
  return { status: 'OK', scoringResult: scoring.resultado };
}

function regenerarLinkDesdeSolicitud_(rowData, config, motivo) {
  var resultado = (function() {
    var sheet = rowData.sheet;
    var rowIndex = rowData.rowIndex;
    var headerMap = getHeaderMapFlexible_(sheet);
    var row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

    var nombre = getVal_(row, headerMap, ALIASES.NOMBRE);
    var telefono = getVal_(row, headerMap, ALIASES.TELEFONO);
    var dni = getVal_(row, headerMap, ALIASES.DNI);
    var solicitud = getVal_(row, headerMap, ALIASES.SOLICITUD);
    var tokenAnterior = getVal_(row, headerMap, ALIASES.TOKEN);

    if (!nombre || !telefono || !dni) {
      return 'Faltan nombre, telefono o DNI en la solicitud original.';
    }

    var baseUrl = normalizarNetlifyBaseUrl();
    var nuevoToken = 'T' + Utilities.getUuid().slice(0, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
    var idCliente = getVal_(row, headerMap, ALIASES.ID_CLIENTE) || construirIdCliente_(config.sucursal, solicitud, dni);
    var dniHash = getVal_(row, headerMap, ALIASES.DNI_HASH) || generarHashDniParaCarga(dni);
    var link = baseUrl + '?t=' + nuevoToken;
    var waLink = crearLinkWhatsApp_(telefono, nombre, link);
    var ahora = new Date();

    var updatedSolicitud = mutarFilaPorCambios_(row, headerMap, {
      'ID_CLIENTE': idCliente,
      'TOKEN': nuevoToken,
      'DNI_HASH': dniHash,
      'ESTADO_ENCUESTA': 'Link regenerado',
      'FECHA_ENVIO_LINK': ahora,
      'CANTIDAD_INTENTOS_WPP': 0,
      'DECISION_FINAL': 'PENDIENTE',
      'MOTIVO_DECISION': '',
      'FECHA_DECISION': '',
      'RESULTADO_SCORING': '',
      'MOTIVO_RESULTADO': '',
      'REQUIERE_RECONTACTO': '',
      'AREA_A_REVISAR': '',
      'OBSERVACION_INTERNA': '',
      'Q1_Conocia_plan_exclusivo': '',
      'Q2_Informaron_licitacion_cuota_2': '',
      'Q3_Informaron_adjudicacion_asegurada': '',
      'Q4_Informaron_monto_cuota_2': '',
      'Q4A_Monto_estimado_cuota_2': '',
      'Q5_Monto_primera_cuota': '',
      'Q5A_Acepto_debito_automatico': '',
      'Q5B_Fecha_pago_primera_cuota': '',
      'Q6_Quien_es_vendedor': '',
      'Q7_Tuvo_otro_plan_reciente': '',
      'Q7A_Detalle_otro_plan': '',
      'Q8_Como_conocio_propuesta': '',
      'Q9_Necesita_recontacto': '',
      'Q10_Observaciones_cliente': '',
      'FECHA_RESPUESTA_WEB': '',
      'FECHA_REALIZACION_SCORING': '',
      'CANAL_SCORING': '',
      'GESTIONADO_POR': '',
      'OBSERVACION_TMK': '',
      'FECHA_PROXIMO_CONTACTO': '',
      'FECHA_ULTIMO_ENVIO_WPP': '',
      'ULTIMO_CONTACTO_TMK': ''
    });
    sheet.getRange(rowIndex, 1, 1, updatedSolicitud.length).setValues([updatedSolicitud]);
    setCeldaLinkEncuesta(sheet, rowIndex, getCol_(headerMap, ALIASES.LINK_ENCUESTA), link);
    if (waLink) setCeldaLinkWhatsApp(sheet, rowIndex, getCol_(headerMap, ALIASES.ENVIAR_WPP), waLink, nombre);
    aplicarFormatoFilaSolicitudGenerada_(sheet, rowIndex, headerMap);
    rowData.values = updatedSolicitud;

    var tmkSheet = getSheet(config.tmk);
    var tmkMap = getHeaderMapFlexible_(tmkSheet);
    var tmkRow = upsertFilaTMKDesdeSolicitud_(config, rowIndex);
    if (tmkRow) {
      var filaTmkActual = tmkSheet.getRange(tmkRow, 1, 1, tmkSheet.getLastColumn()).getValues()[0];
      var observacionAnterior = getVal_(filaTmkActual, tmkMap, 'OBSERVACION_TMK');
      var cantidadRevalidaciones = obtenerCantidadRevalidaciones_(observacionAnterior) + 1;
      var updatedTmk = mutarFilaPorCambios_(filaTmkActual, tmkMap, {
        'DECISION_FINAL': 'PENDIENTE',
        'ESTADO_TMK': 'Pendiente envio',
        'PROXIMA_ACCION': 'Enviar WPP',
        'PRIORIDAD': 'Alta',
        'CANTIDAD_INTENTOS_WPP': 0,
        'OBSERVACION_TMK': construirTextoRevalidacion_(cantidadRevalidaciones, motivo),
        'MOTIVO_DECISION': '',
        'FECHA_DECISION': '',
        'RESULTADO_SCORING': '',
        'MOTIVO_RESULTADO': '',
        'REQUIERE_RECONTACTO': '',
        'AREA_A_REVISAR': '',
        'OBSERVACION_INTERNA': '',
        'Q1_Conocia_plan_exclusivo': '',
        'Q2_Informaron_licitacion_cuota_2': '',
        'Q3_Informaron_adjudicacion_asegurada': '',
        'Q4_Informaron_monto_cuota_2': '',
        'Q4A_Monto_estimado_cuota_2': '',
        'Q5_Monto_primera_cuota': '',
        'Q5A_Acepto_debito_automatico': '',
        'Q5B_Fecha_pago_primera_cuota': '',
        'Q6_Quien_es_vendedor': '',
        'Q7_Tuvo_otro_plan_reciente': '',
        'Q7A_Detalle_otro_plan': '',
        'Q8_Como_conocio_propuesta': '',
        'Q9_Necesita_recontacto': '',
        'Q10_Observaciones_cliente': '',
        'FECHA_RESPUESTA_WEB': '',
        'FECHA_REALIZACION_SCORING': '',
        'CANAL_SCORING': '',
        'FECHA_PROXIMO_CONTACTO': '',
        'FECHA_ULTIMO_ENVIO_WPP': '',
        'ULTIMO_CONTACTO_TMK': ''
      });
      tmkSheet.getRange(tmkRow, 1, 1, updatedTmk.length).setValues([updatedTmk]);
      restaurarRichTextFilaTMKDesdeSolicitud_(sheet, headerMap, rowIndex, tmkSheet, tmkRow);
      var callCol = getCol_(tmkMap, 'ABRIR_LLAMADA');
      if (callCol) {
        var callUrl = getBaseUrlApp_().replace(/\/$/, '') + '/call.html?t=' + encodeURIComponent(nuevoToken);
        setRichTextCellLabelUrl_(tmkSheet, tmkRow, callCol, 'Cargar llamada', callUrl);
      }
      aplicarFormatoFilaTmk_(tmkSheet, tmkRow);
      upsertIndiceOperativo_({
        token: String(nuevoToken || '').trim(),
        idCliente: String(idCliente || '').trim(),
        sucursal: config.sucursal,
        baseName: config.base,
        solicitudRow: rowIndex,
        tmkName: config.tmk,
        tmkRow: tmkRow,
        estadoEncuesta: 'Link regenerado',
        decisionFinal: 'PENDIENTE'
      });
    }

    quitarFilaDeRechazadosPorIdToken_(idCliente, tokenAnterior);
    quitarFilaDeRechazadosPorIdToken_(idCliente, nuevoToken);

    try {
      var cache = CacheService.getScriptCache();
      if (tokenAnterior) cache.remove(getTokenCacheKey_(tokenAnterior));
      cache.remove(getTokenCacheKey_(nuevoToken));
    } catch (e) {
      Logger.log('No se pudo limpiar cache de token: ' + e);
    }

    SpreadsheetApp.flush();
    registrarLogOperativo_('REGENERAR_LINK', { token: nuevoToken, idCliente: idCliente, sucursal: config.sucursal, hoja: config.base, fila: rowIndex, resultado: 'OK', detalle: 'Link regenerado por ' + (motivo || 'revalidacion') });
    return 'Link regenerado. Use el nuevo WhatsApp para reenviar la validacion.';
  })();
  return resultado;
}

/**************************************************************
 * OVERRIDE FINAL - TMK MAS ORDENADO
 **************************************************************/

HEADERS_TMK = [
  'SUCURSAL',
  'FECHA',
  'MES',
  'NOMBRE Y APELLIDO',
  'Nº',
  'TELEFONO',
  'Modelo suscripto/ plan',
  'PLAN_AUTO',
  'DNI',
  'FINANCIA_AUTO',
  'MAIL',
  'LICITA_AUTO',
  'CTA_AUTO',
  'NOMBRE DEL VENDEDOR',
  'LINK_ENCUESTA',
  'ENVIAR WPP',
  'ABRIR_LLAMADA',
  'ESTADO_TMK',
  'ESTADO_ENCUESTA',
  'TIPO DE PAGO',
  'FECHA_ENVIO_LINK',
  'DECISION_FINAL',
  'N° DE SOLICITUD',
  'N° DE CLIENTE',
  'CUOTA 2',
  'OBSERVACION_TMK',
  'ID_CLIENTE',
  'RESULTADO_SCORING',
  'TOKEN',
  'MOTIVO_RESULTADO',
  'DNI_HASH',
  'REQUIERE_RECONTACTO',
  'AREA_A_REVISAR',
  'Q1_Conocia_plan_exclusivo',
  'Q2_Informaron_licitacion_cuota_2',
  'Q3_Informaron_adjudicacion_asegurada',
  'Q4_Informaron_monto_cuota_2',
  'Q4A_Monto_estimado_cuota_2',
  'Q5_Monto_primera_cuota',
  'Q5A_Acepto_debito_automatico',
  'Q5B_Fecha_pago_primera_cuota',
  'Q6_Quien_es_vendedor',
  'Q7_Tuvo_otro_plan_reciente',
  'Q7A_Detalle_otro_plan',
  'Q8_Como_conocio_propuesta',
  'Q9_Necesita_recontacto',
  'Q10_Observaciones_cliente',
  'OBSERVACION_INTERNA',
  'FECHA_RESPUESTA_WEB',
  'FECHA_REALIZACION_SCORING',
  'CANAL_SCORING',
  'MOTIVO_DECISION',
  'FECHA_DECISION',
  'GESTIONADO_POR',
  'FECHA_ULTIMO_ENVIO_WPP',
  'CANTIDAD_INTENTOS_WPP',
  'ULTIMO_CONTACTO_TMK'
];

function ensureHeaders() {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    prepararEncabezadosSolicitud_(getSheet(SOLICITUDES_CONFIG[i].base));
    establecerHeadersExactos_(getSheet(SOLICITUDES_CONFIG[i].tmk), HEADERS_TMK);
  }

  for (var v = 0; v < TMK_VIEW_SHEETS.length; v++) {
    establecerHeadersExactos_(getSheet(TMK_VIEW_SHEETS[v].name), HEADERS_TMK);
  }

  var respuestas = getSheet('Respuestas_Scoring');
  if (respuestas.getLastRow() <= 1) establecerHeadersExactos_(respuestas, HEADERS_RESPUESTAS_SCORING);
  ensureHeadersPresent_(getSheet('Preguntas'), ['Codigo', 'Bloque', 'Orden', 'Pregunta', 'Tipo', 'Opciones', 'Obligatoria', 'Condicion', 'Columna_respuesta', 'Activa']);
  ensureHeadersPresent_(getSheet('Log_Seguridad'), ['Fecha', 'Token', 'DNI_HASH', 'Resultado', 'Detalle', 'Origen']);
  ensureGrowthSheets_();

  formatearSolicitudes_();
  formatearHojasTMK_();
  formatearVistasTMK_();
}

/**************************************************************
 * OVERRIDE FINAL - VISTA LIMPIA Y OPERATIVA
 **************************************************************/

var SOLICITUDES_HIDE_HEADERS = [
  'FECHA DE NACIMIENTO',
  'DOMICILIO',
  '1º Cuota',
  'Imp. Cobrado 1º',
  'Saldo 1º Cuota',
  'SIAC',
  'TMK',
  'SALESFORCE',
  'FINALIZADA'
];

var TMK_HIDE_HEADERS = [
  'MAIL',
  'ID_CLIENTE',
  'TOKEN',
  'DNI_HASH',
  'Q1_Conocia_plan_exclusivo',
  'Q2_Informaron_licitacion_cuota_2',
  'Q3_Informaron_adjudicacion_asegurada',
  'Q4_Informaron_monto_cuota_2',
  'Q4A_Monto_estimado_cuota_2',
  'Q5_Monto_primera_cuota',
  'Q5A_Acepto_debito_automatico',
  'Q5B_Fecha_pago_primera_cuota',
  'Q6_Quien_es_vendedor',
  'Q7_Tuvo_otro_plan_reciente',
  'Q7A_Detalle_otro_plan',
  'Q8_Como_conocio_propuesta',
  'Q9_Necesita_recontacto',
  'Q10_Observaciones_cliente',
  'OBSERVACION_INTERNA',
  'FECHA_RESPUESTA_WEB',
  'FECHA_REALIZACION_SCORING',
  'CANAL_SCORING',
  'MOTIVO_DECISION',
  'FECHA_DECISION',
  'GESTIONADO_POR',
  'FECHA_ULTIMO_ENVIO_WPP',
  'CANTIDAD_INTENTOS_WPP',
  'ULTIMO_CONTACTO_TMK'
];

function hideHeadersIfPresent_(sheet, map, headers) {
  for (var i = 0; i < headers.length; i++) {
    var col = getCol_(map, headers[i]);
    if (col) sheet.hideColumns(col);
  }
}

function formatearSolicitudes_() {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    var sheet = getSheet(SOLICITUDES_CONFIG[i].base);
    var lastRow = Math.max(sheet.getLastRow(), 1);
    var lastCol = Math.max(sheet.getLastColumn(), COL_INICIO_LINKS + HEADERS_LINKS_SOLICITUDES.length - 1);
    var map = getHeaderMapFlexible_(sheet);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, lastCol)
      .setFontWeight('bold')
      .setFontColor('#ffffff')
      .setBackground('#0f172a')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setWrap(true);
    sheet.getRange(1, COL_GENERAR, 1, 1).setBackground('#16a34a');
    sheet.getRange(1, COL_INICIO_LINKS, 1, HEADERS_LINKS_SOLICITUDES.length).setBackground('#2563eb');
    if (lastRow > 1) {
      sheet.getRange(2, COL_GENERAR, lastRow - 1, 1).setBackground('#f0fdf4');
      sheet.getRange(2, COL_INICIO_LINKS, lastRow - 1, HEADERS_LINKS_SOLICITUDES.length).setBackground('#eff6ff');
    }
    setWidthIfExists_(sheet, map, 'NOMBRE Y APELLIDO', 220);
    setWidthIfExists_(sheet, map, 'MAIL', 180);
    setWidthIfExists_(sheet, map, 'TELEFONO', 120);
    setWidthIfExists_(sheet, map, 'Modelo suscripto/ plan', 250);
    setWidthIfExists_(sheet, map, 'TIPO DE PAGO', 150);
    setWidthIfExists_(sheet, map, 'N° DE SOLICITUD', 110);
    setWidthIfExists_(sheet, map, 'CUOTA 2', 100);
    setWidthIfExists_(sheet, map, 'NOMBRE DEL VENDEDOR', 180);
    setWidthIfExists_(sheet, map, 'Observaciones', 220);
    setWidthIfExists_(sheet, map, 'LINK_ENCUESTA', 130);
    setWidthIfExists_(sheet, map, 'ENVIAR WPP', 170);
    hideHeadersIfPresent_(sheet, map, SOLICITUDES_HIDE_HEADERS);
  }
}

function formatearHojasTMK_() {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    var sheet = getSheet(SOLICITUDES_CONFIG[i].tmk);
    var lastRow = Math.max(sheet.getLastRow(), 1);
    var lastCol = Math.max(sheet.getLastColumn(), HEADERS_TMK.length);
    var map = getHeaderMapFlexible_(sheet);

    limpiarValidacionesTMK_(sheet);

    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, lastCol).setFontWeight('bold').setFontColor('#ffffff').setBackground('#0f172a').setHorizontalAlignment('center').setWrap(true);
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, lastCol).setBackground(null).setFontColor('#111827').setVerticalAlignment('middle').setWrap(true);

    setWidthIfExists_(sheet, map, 'SUCURSAL', 90);
    setWidthIfExists_(sheet, map, 'FECHA', 90);
    setWidthIfExists_(sheet, map, 'MES', 80);
    setWidthIfExists_(sheet, map, 'NOMBRE Y APELLIDO', 220);
    setWidthIfExists_(sheet, map, 'TELEFONO', 120);
    setWidthIfExists_(sheet, map, 'Modelo suscripto/ plan', 240);
    setWidthIfExists_(sheet, map, 'PLAN_AUTO', 90);
    setWidthIfExists_(sheet, map, 'DNI', 100);
    setWidthIfExists_(sheet, map, 'FINANCIA_AUTO', 90);
    setWidthIfExists_(sheet, map, 'LICITA_AUTO', 90);
    setWidthIfExists_(sheet, map, 'CTA_AUTO', 110);
    setWidthIfExists_(sheet, map, 'NOMBRE DEL VENDEDOR', 180);
    setWidthIfExists_(sheet, map, 'LINK_ENCUESTA', 120);
    setWidthIfExists_(sheet, map, 'ENVIAR WPP', 150);
    setWidthIfExists_(sheet, map, 'ABRIR_LLAMADA', 140);
    setWidthIfExists_(sheet, map, 'ESTADO_TMK', 130);
    setWidthIfExists_(sheet, map, 'ESTADO_ENCUESTA', 130);
    setWidthIfExists_(sheet, map, 'TIPO DE PAGO', 140);
    setWidthIfExists_(sheet, map, 'FECHA_ENVIO_LINK', 110);
    setWidthIfExists_(sheet, map, 'DECISION_FINAL', 120);
    setWidthIfExists_(sheet, map, 'N° DE SOLICITUD', 110);
    setWidthIfExists_(sheet, map, 'N° DE CLIENTE', 100);
    setWidthIfExists_(sheet, map, 'CUOTA 2', 95);
    setWidthIfExists_(sheet, map, 'OBSERVACION_TMK', 260);
    setWidthIfExists_(sheet, map, 'RESULTADO_SCORING', 130);
    setWidthIfExists_(sheet, map, 'MOTIVO_RESULTADO', 320);
    setWidthIfExists_(sheet, map, 'REQUIERE_RECONTACTO', 130);
    setWidthIfExists_(sheet, map, 'AREA_A_REVISAR', 150);

    pintarColumnaTMK_(sheet, map, 'LINK_ENCUESTA', '#eff6ff');
    pintarColumnaTMK_(sheet, map, 'ENVIAR WPP', '#eff6ff');
    pintarColumnaTMK_(sheet, map, 'ABRIR_LLAMADA', '#ecfccb');
    pintarColumnaTMK_(sheet, map, 'ESTADO_TMK', '#f8fafc');
    pintarColumnaTMK_(sheet, map, 'ESTADO_ENCUESTA', '#f8fafc');
    pintarColumnaTMK_(sheet, map, 'DECISION_FINAL', '#f8fafc');

    aplicarValidacionDecision_(sheet, map);
    aplicarValidacionEstadoTMK_(sheet, map);
    aplicarFormatoDecision_(sheet, map);
    aplicarFormatoEstadoTMK_(sheet, map);

    hideHeadersIfPresent_(sheet, map, TMK_HIDE_HEADERS);
  }

  var rejectSheet = getSheet('TMK - RECHAZADOS');
  var rejectMap = getHeaderMapFlexible_(rejectSheet);
  hideHeadersIfPresent_(rejectSheet, rejectMap, TMK_HIDE_HEADERS);
}

/**************************************************************
 * OVERRIDE FINAL - ORDEN DB OPERATIVO EN TMK
 **************************************************************/

HEADERS_TMK = [
  'SUCURSAL',
  'N° DE SOLICITUD',
  'N° DE CLIENTE',
  'ID_CLIENTE',
  'FECHA',
  'MES',
  'Nº',
  'NOMBRE Y APELLIDO',
  'DNI',
  'TELEFONO',
  'MAIL',
  'Modelo suscripto/ plan',
  'PLAN_AUTO',
  'FINANCIA_AUTO',
  'LICITA_AUTO',
  'CTA_AUTO',
  'TIPO DE PAGO',
  'CUOTA 2',
  'NOMBRE DEL VENDEDOR',
  'LINK_ENCUESTA',
  'ENVIAR WPP',
  'ABRIR_LLAMADA',
  'ESTADO_ENCUESTA',
  'ESTADO_TMK',
  'FECHA_ENVIO_LINK',
  'DECISION_FINAL',
  'RESULTADO_SCORING',
  'MOTIVO_RESULTADO',
  'REQUIERE_RECONTACTO',
  'AREA_A_REVISAR',
  'OBSERVACION_TMK',
  'TOKEN',
  'DNI_HASH',
  'Q1_Conocia_plan_exclusivo',
  'Q2_Informaron_licitacion_cuota_2',
  'Q3_Informaron_adjudicacion_asegurada',
  'Q4_Informaron_monto_cuota_2',
  'Q4A_Monto_estimado_cuota_2',
  'Q5_Monto_primera_cuota',
  'Q5A_Acepto_debito_automatico',
  'Q5B_Fecha_pago_primera_cuota',
  'Q6_Quien_es_vendedor',
  'Q7_Tuvo_otro_plan_reciente',
  'Q7A_Detalle_otro_plan',
  'Q8_Como_conocio_propuesta',
  'Q9_Necesita_recontacto',
  'Q10_Observaciones_cliente',
  'OBSERVACION_INTERNA',
  'FECHA_RESPUESTA_WEB',
  'FECHA_REALIZACION_SCORING',
  'CANAL_SCORING',
  'MOTIVO_DECISION',
  'FECHA_DECISION',
  'GESTIONADO_POR',
  'FECHA_ULTIMO_ENVIO_WPP',
  'CANTIDAD_INTENTOS_WPP',
  'ULTIMO_CONTACTO_TMK'
];

function formatearHojasTMK_() {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    var sheet = getSheet(SOLICITUDES_CONFIG[i].tmk);
    var lastRow = Math.max(sheet.getLastRow(), 1);
    var lastCol = Math.max(sheet.getLastColumn(), HEADERS_TMK.length);
    var map = getHeaderMapFlexible_(sheet);

    limpiarValidacionesTMK_(sheet);

    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, lastCol).setFontWeight('bold').setFontColor('#ffffff').setBackground('#0f172a').setHorizontalAlignment('center').setWrap(true);
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, lastCol).setBackground(null).setFontColor('#111827').setVerticalAlignment('middle').setWrap(true);

    setWidthIfExists_(sheet, map, 'SUCURSAL', 90);
    setWidthIfExists_(sheet, map, 'N° DE SOLICITUD', 110);
    setWidthIfExists_(sheet, map, 'N° DE CLIENTE', 100);
    setWidthIfExists_(sheet, map, 'FECHA', 90);
    setWidthIfExists_(sheet, map, 'MES', 80);
    setWidthIfExists_(sheet, map, 'Nº', 70);
    setWidthIfExists_(sheet, map, 'NOMBRE Y APELLIDO', 220);
    setWidthIfExists_(sheet, map, 'DNI', 100);
    setWidthIfExists_(sheet, map, 'TELEFONO', 120);
    setWidthIfExists_(sheet, map, 'MAIL', 180);
    setWidthIfExists_(sheet, map, 'Modelo suscripto/ plan', 240);
    setWidthIfExists_(sheet, map, 'PLAN_AUTO', 90);
    setWidthIfExists_(sheet, map, 'FINANCIA_AUTO', 90);
    setWidthIfExists_(sheet, map, 'LICITA_AUTO', 90);
    setWidthIfExists_(sheet, map, 'CTA_AUTO', 110);
    setWidthIfExists_(sheet, map, 'TIPO DE PAGO', 140);
    setWidthIfExists_(sheet, map, 'CUOTA 2', 95);
    setWidthIfExists_(sheet, map, 'NOMBRE DEL VENDEDOR', 180);
    setWidthIfExists_(sheet, map, 'LINK_ENCUESTA', 120);
    setWidthIfExists_(sheet, map, 'ENVIAR WPP', 150);
    setWidthIfExists_(sheet, map, 'ABRIR_LLAMADA', 140);
    setWidthIfExists_(sheet, map, 'ESTADO_ENCUESTA', 130);
    setWidthIfExists_(sheet, map, 'ESTADO_TMK', 130);
    setWidthIfExists_(sheet, map, 'FECHA_ENVIO_LINK', 110);
    setWidthIfExists_(sheet, map, 'DECISION_FINAL', 120);
    setWidthIfExists_(sheet, map, 'RESULTADO_SCORING', 130);
    setWidthIfExists_(sheet, map, 'MOTIVO_RESULTADO', 320);
    setWidthIfExists_(sheet, map, 'REQUIERE_RECONTACTO', 130);
    setWidthIfExists_(sheet, map, 'AREA_A_REVISAR', 150);
    setWidthIfExists_(sheet, map, 'OBSERVACION_TMK', 260);

    pintarColumnaTMK_(sheet, map, 'LINK_ENCUESTA', '#eff6ff');
    pintarColumnaTMK_(sheet, map, 'ENVIAR WPP', '#eff6ff');
    pintarColumnaTMK_(sheet, map, 'ABRIR_LLAMADA', '#ecfccb');
    pintarColumnaTMK_(sheet, map, 'ESTADO_TMK', '#f8fafc');
    pintarColumnaTMK_(sheet, map, 'ESTADO_ENCUESTA', '#f8fafc');
    pintarColumnaTMK_(sheet, map, 'DECISION_FINAL', '#f8fafc');

    aplicarValidacionDecision_(sheet, map);
    aplicarValidacionEstadoTMK_(sheet, map);
    aplicarFormatoDecision_(sheet, map);
    aplicarFormatoEstadoTMK_(sheet, map);

    hideHeadersIfPresent_(sheet, map, TMK_HIDE_HEADERS);
  }

  var rejectSheet = getSheet('TMK - RECHAZADOS');
  var rejectMap = getHeaderMapFlexible_(rejectSheet);
  hideHeadersIfPresent_(rejectSheet, rejectMap, TMK_HIDE_HEADERS);
}

/**************************************************************
 * OVERRIDE FINAL - BASE URL APP FALTANTE
 **************************************************************/

function getBaseUrlApp_() {
  return normalizarNetlifyBaseUrl().replace(/\/$/, '');
}

/**************************************************************
 * OVERRIDE FINAL - CANAL VISIBLE Y LEGIBLE
 **************************************************************/

function canalScoringLegible_(canal) {
  var raw = String(canal || '').toUpperCase().trim();
  if (raw === 'TELEFONICO' || raw === 'CALL CENTER') return 'CALL CENTER';
  if (raw === 'WEB' || raw === 'ENCUESTA WEB') return 'ENCUESTA WEB';
  return raw || '';
}

function escribirRespuestasEnFilaTMKRapidaFinal_(sheet, rowIndex, headerMap, respuestas, scoring, canal) {
  var current = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  var updated = mutarFilaPorCambios_(current, headerMap, {
    'Q1_Conocia_plan_exclusivo': respuestas.q1,
    'Q2_Informaron_licitacion_cuota_2': respuestas.q2,
    'Q3_Informaron_adjudicacion_asegurada': respuestas.q3,
    'Q4_Informaron_monto_cuota_2': respuestas.q4,
    'Q4A_Monto_estimado_cuota_2': respuestas.q4a || '',
    'Q5_Monto_primera_cuota': respuestas.q5,
    'Q5A_Acepto_debito_automatico': respuestas.q5a,
    'Q5B_Fecha_pago_primera_cuota': respuestas.q5b,
    'Q6_Quien_es_vendedor': respuestas.q6,
    'Q7_Tuvo_otro_plan_reciente': respuestas.q7,
    'Q7A_Detalle_otro_plan': respuestas.q7a || '',
    'Q8_Como_conocio_propuesta': respuestas.q8,
    'Q9_Necesita_recontacto': respuestas.q9,
    'Q10_Observaciones_cliente': respuestas.q10 || '',
    'RESULTADO_SCORING': scoring.resultado,
    'MOTIVO_RESULTADO': scoring.motivo,
    'REQUIERE_RECONTACTO': scoring.requiereRecontacto,
    'AREA_A_REVISAR': scoring.area,
    'OBSERVACION_INTERNA': scoring.observacion,
    'FECHA_REALIZACION_SCORING': new Date(),
    'CANAL_SCORING': canalScoringLegible_(canal),
    'DECISION_FINAL': decisionDesdeScoring_(scoring.resultado),
    'MOTIVO_DECISION': scoring.motivo,
    'FECHA_DECISION': new Date(),
    'ESTADO_TMK': estadoTmkDesdeResultado_(scoring.resultado, canal),
    'ULTIMO_CONTACTO_TMK': new Date(),
    'FECHA_RESPUESTA_WEB': canal === 'WEB' ? new Date() : getVal_(current, headerMap, 'FECHA_RESPUESTA_WEB')
  });
  sheet.getRange(rowIndex, 1, 1, updated.length).setValues([updated]);
}

TMK_HIDE_HEADERS = [
  'MAIL',
  'ID_CLIENTE',
  'TOKEN',
  'DNI_HASH',
  'Q1_Conocia_plan_exclusivo',
  'Q2_Informaron_licitacion_cuota_2',
  'Q3_Informaron_adjudicacion_asegurada',
  'Q4_Informaron_monto_cuota_2',
  'Q4A_Monto_estimado_cuota_2',
  'Q5_Monto_primera_cuota',
  'Q5A_Acepto_debito_automatico',
  'Q5B_Fecha_pago_primera_cuota',
  'Q6_Quien_es_vendedor',
  'Q7_Tuvo_otro_plan_reciente',
  'Q7A_Detalle_otro_plan',
  'Q8_Como_conocio_propuesta',
  'Q9_Necesita_recontacto',
  'Q10_Observaciones_cliente',
  'OBSERVACION_INTERNA',
  'FECHA_RESPUESTA_WEB',
  'FECHA_REALIZACION_SCORING',
  'MOTIVO_DECISION',
  'FECHA_DECISION',
  'GESTIONADO_POR',
  'FECHA_ULTIMO_ENVIO_WPP',
  'CANTIDAD_INTENTOS_WPP',
  'ULTIMO_CONTACTO_TMK'
];

function formatearHojasTMK_() {
  for (var i = 0; i < SOLICITUDES_CONFIG.length; i++) {
    var sheet = getSheet(SOLICITUDES_CONFIG[i].tmk);
    var lastRow = Math.max(sheet.getLastRow(), 1);
    var lastCol = Math.max(sheet.getLastColumn(), HEADERS_TMK.length);
    var map = getHeaderMapFlexible_(sheet);

    limpiarValidacionesTMK_(sheet);

    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, lastCol).setFontWeight('bold').setFontColor('#ffffff').setBackground('#0f172a').setHorizontalAlignment('center').setWrap(true);
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, lastCol).setBackground(null).setFontColor('#111827').setVerticalAlignment('middle').setWrap(true);

    setWidthIfExists_(sheet, map, 'SUCURSAL', 90);
    setWidthIfExists_(sheet, map, 'N° DE SOLICITUD', 110);
    setWidthIfExists_(sheet, map, 'N° DE CLIENTE', 100);
    setWidthIfExists_(sheet, map, 'FECHA', 90);
    setWidthIfExists_(sheet, map, 'MES', 80);
    setWidthIfExists_(sheet, map, 'Nº', 70);
    setWidthIfExists_(sheet, map, 'NOMBRE Y APELLIDO', 220);
    setWidthIfExists_(sheet, map, 'DNI', 100);
    setWidthIfExists_(sheet, map, 'TELEFONO', 120);
    setWidthIfExists_(sheet, map, 'MAIL', 180);
    setWidthIfExists_(sheet, map, 'Modelo suscripto/ plan', 240);
    setWidthIfExists_(sheet, map, 'PLAN_AUTO', 90);
    setWidthIfExists_(sheet, map, 'FINANCIA_AUTO', 90);
    setWidthIfExists_(sheet, map, 'LICITA_AUTO', 90);
    setWidthIfExists_(sheet, map, 'CTA_AUTO', 110);
    setWidthIfExists_(sheet, map, 'TIPO DE PAGO', 140);
    setWidthIfExists_(sheet, map, 'CUOTA 2', 95);
    setWidthIfExists_(sheet, map, 'NOMBRE DEL VENDEDOR', 180);
    setWidthIfExists_(sheet, map, 'LINK_ENCUESTA', 120);
    setWidthIfExists_(sheet, map, 'ENVIAR WPP', 150);
    setWidthIfExists_(sheet, map, 'ABRIR_LLAMADA', 140);
    setWidthIfExists_(sheet, map, 'ESTADO_ENCUESTA', 130);
    setWidthIfExists_(sheet, map, 'ESTADO_TMK', 130);
    setWidthIfExists_(sheet, map, 'CANAL_SCORING', 125);
    setWidthIfExists_(sheet, map, 'FECHA_ENVIO_LINK', 110);
    setWidthIfExists_(sheet, map, 'DECISION_FINAL', 120);
    setWidthIfExists_(sheet, map, 'RESULTADO_SCORING', 130);
    setWidthIfExists_(sheet, map, 'MOTIVO_RESULTADO', 320);
    setWidthIfExists_(sheet, map, 'REQUIERE_RECONTACTO', 130);
    setWidthIfExists_(sheet, map, 'AREA_A_REVISAR', 150);
    setWidthIfExists_(sheet, map, 'OBSERVACION_TMK', 260);

    pintarColumnaTMK_(sheet, map, 'LINK_ENCUESTA', '#eff6ff');
    pintarColumnaTMK_(sheet, map, 'ENVIAR WPP', '#eff6ff');
    pintarColumnaTMK_(sheet, map, 'ABRIR_LLAMADA', '#ecfccb');
    pintarColumnaTMK_(sheet, map, 'ESTADO_TMK', '#f8fafc');
    pintarColumnaTMK_(sheet, map, 'ESTADO_ENCUESTA', '#f8fafc');
    pintarColumnaTMK_(sheet, map, 'DECISION_FINAL', '#f8fafc');
    pintarColumnaTMK_(sheet, map, 'CANAL_SCORING', '#f8fafc');

    aplicarValidacionDecision_(sheet, map);
    aplicarValidacionEstadoTMK_(sheet, map);
    aplicarFormatoDecision_(sheet, map);
    aplicarFormatoEstadoTMK_(sheet, map);

    hideHeadersIfPresent_(sheet, map, TMK_HIDE_HEADERS);
  }

  var rejectSheet = getSheet('TMK - RECHAZADOS');
  var rejectMap = getHeaderMapFlexible_(rejectSheet);
  hideHeadersIfPresent_(rejectSheet, rejectMap, TMK_HIDE_HEADERS);
}
