/**
 * Google Apps Script - Code.gs
 * Backend privado para Google Sheets y flujo operativo de Contact Center.
 */

var NOMBRE_CONTACT = "Abigail Wierna";

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("Encuestas Autosol")
      .addItem("1. Preparar planilla", "setupInicialDesdeMenu")
      .addItem("2. Actualizar nuevos clientes", "procesarNuevosIngresosDesdeMenu")
      .addItem("3. Aplicar scoring de llamada", "procesarScoringLlamadasDesdeMenu")
      .addItem("4. Reparar links", "regenerarLinksExistentesDesdeMenu")
      .addItem("5. Sincronizar seguimiento", "sincronizarSeguimientoCCDesdeMenu")
      .addToUi();
  } catch (e) {
    Logger.log("No se pudo crear el menu en este contexto: " + e);
  }
}

function mostrarToast(mensaje) {
  try {
    SpreadsheetApp.getActive().toast(mensaje, "Encuestas Autosol", 5);
  } catch (e) {
    Logger.log(mensaje);
  }
}

function setupInicialDesdeMenu() {
  setupInicial();
  mostrarToast("Setup inicial completado.");
}

function procesarNuevosIngresosDesdeMenu() {
  mostrarToast(procesarNuevosIngresos());
}

function procesarScoringLlamadasDesdeMenu() {
  mostrarToast(procesarScoringLlamadas());
}

function regenerarLinksExistentesDesdeMenu() {
  mostrarToast(regenerarLinksExistentes());
}

function sincronizarSeguimientoCCDesdeMenu() {
  mostrarToast(sincronizarSeguimientoCC());
}


function instalarRevisionAutomaticaBaseClientes() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "procesarNuevosIngresos") {
      return "La revision automatica ya estaba instalada.";
    }
  }

  ScriptApp.newTrigger("procesarNuevosIngresos")
    .timeBased()
    .everyMinutes(5)
    .create();

  return "Revision automatica instalada. Cada 5 minutos se revisara Base_Clientes y se actualizara Seguimiento_CC.";
}

function eliminarRevisionAutomaticaBaseClientes() {
  var triggers = ScriptApp.getProjectTriggers();
  var eliminados = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "procesarNuevosIngresos") {
      ScriptApp.deleteTrigger(triggers[i]);
      eliminados++;
    }
  }

  if (eliminados === 0) return "No habia revision automatica instalada.";
  return "Se eliminaron " + eliminados + " triggers de revision automatica.";
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
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
      return guardarEncuesta(payload.token, payload.dni, payload.respuestas);
    }

    return jsonResponse({ status: "ERROR", message: "Accion no reconocida." });
  } catch (err) {
    registrarLog("SYSTEM", "", "ERROR", err.toString(), "Apps Script - doPost");
    return jsonResponse({ status: "ERROR", message: "Excepcion en servidor: " + err.toString() });
  }
}

function setupInicial() {
  ensureSheets();
  ensureHeaders();
  actualizarCatalogoPreguntas();
  actualizarInstructivoCC();
  sincronizarSeguimientoCC();
  formatearSeguimientoCC();
}

function normalizarDni(dni) {
  if (!dni) return "";
  return dni.toString().replace(/\D/g, "");
}

function generarHash(valor) {
  var salt = PropertiesService.getScriptProperties().getProperty("DNI_SALT");
  if (!salt) {
    throw new Error("Falta configurar DNI_SALT en Script Properties.");
  }

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

function buscarFilaPorToken(token) {
  if (!token) return null;

  var sheet = getSheet("Base_Clientes");
  var data = sheet.getDataRange().getValues();
  var headerMap = getHeaderMap(sheet);
  var tokenColIndex = headerMap["TOKEN"] - 1;

  if (tokenColIndex < 0) return null;

  for (var i = 1; i < data.length; i++) {
    if (data[i][tokenColIndex].toString().trim() === token.toString().trim()) {
      return {
        rowIndex: i + 1,
        values: data[i],
        headerMap: headerMap
      };
    }
  }
  return null;
}

function validarCliente(token, dni) {
  var dniHashInput = generarHash(dni);
  var rowData = buscarFilaPorToken(token);

  if (!rowData) {
    registrarLog(token, dniHashInput, "TOKEN_INVALIDO", "Token no encontrado en Base_Clientes", "validarCliente");
    return jsonResponse({ status: "TOKEN_INVALIDO" });
  }

  var headerMap = rowData.headerMap;
  var rowValues = rowData.values;
  var dniHashSheet = rowValues[headerMap["DNI_HASH"] - 1];
  var estadoEncuesta = rowValues[headerMap["ESTADO_ENCUESTA"] - 1];

  if (estadoEncuesta === "Respondido") {
    registrarLog(token, dniHashInput, "YA_RESPONDIO", "El cliente ya habia completado la encuesta anteriormente", "validarCliente");
    return jsonResponse({ status: "YA_RESPONDIO" });
  }

  var dniHashSheetStr = dniHashSheet ? dniHashSheet.toString().trim() : "";
  var esValido = (dniHashInput === dniHashSheetStr) || (normalizarDni(dni) === normalizarDni(dniHashSheetStr));

  if (!esValido) {
    var sheet = getSheet("Base_Clientes");
    var intentosColIndex = headerMap["INTENTOS_INVALIDOS"];
    var currentIntentos = parseInt(rowValues[intentosColIndex - 1] || "0", 10);
    sheet.getRange(rowData.rowIndex, intentosColIndex).setValue(currentIntentos + 1);

    registrarLog(token, dniHashInput, "DNI_INVALIDO", "DNI no coincide con DNI_HASH guardado (intento " + (currentIntentos + 1) + ")", "validarCliente");
    return jsonResponse({ status: "DNI_INVALIDO" });
  }

  var clienteSeguro = {
    nombre: rowValues[headerMap["Nombre y Apellido"] - 1],
    modelo: rowValues[headerMap["Modelo suscripto/falta plan"] - 1],
    asesor: rowValues[headerMap["Nombre del Asesor"] - 1],
    montoCuota2: rowValues[headerMap["Monto 2da cuota (aprox)"] - 1],
    medioPagoPrevisto: obtenerValorPorHeaders(rowValues, headerMap, ["¿Como seguira pagando su plan?", "Â¿CÃ³mo seguirÃ¡ pagando su plan?"])
  };

  registrarLog(token, dniHashInput, "OK", "Cliente validado e ingresado a la encuesta", "validarCliente");
  return jsonResponse({
    status: "OK",
    cliente: clienteSeguro,
    vendedores: obtenerListaVendedores()
  });
}

function guardarEncuesta(token, dni, respuestas) {
  var dniHashInput = generarHash(dni);
  var rowData = buscarFilaPorToken(token);

  if (!rowData) {
    registrarLog(token, dniHashInput, "TOKEN_INVALIDO", "Token inexistente al intentar guardar", "guardarEncuesta");
    return jsonResponse({ status: "TOKEN_INVALIDO" });
  }

  var headerMap = rowData.headerMap;
  var rowValues = rowData.values;
  var dniHashSheet = rowValues[headerMap["DNI_HASH"] - 1];
  var estadoEncuesta = rowValues[headerMap["ESTADO_ENCUESTA"] - 1];

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
  var clienteInfo = {
    idCliente: rowValues[headerMap["ID_CLIENTE"] - 1],
    nombre: rowValues[headerMap["Nombre y Apellido"] - 1],
    modelo: rowValues[headerMap["Modelo suscripto/falta plan"] - 1],
    asesor: rowValues[headerMap["Nombre del Asesor"] - 1],
    montoCuota2Base: rowValues[headerMap["Monto 2da cuota (aprox)"] - 1],
    token: token,
    dniHash: dniHashSheet
  };

  guardarRespuestaScoring(clienteInfo, respuestas, scoring);
  actualizarBaseCliente(rowData.rowIndex, scoring);
  registrarLog(token, dniHashInput, "OK", "Encuesta procesada y scoring calculado: " + scoring.resultado, "guardarEncuesta");

  return jsonResponse({ status: "OK", scoringResult: scoring.resultado });
}

function guardarRespuestaScoring(cliente, respuestas, scoring) {
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
      case "Q1_Conocia_plan": val = respuestas.q1; break;
      case "Q2_Informaron_licitacion": val = respuestas.q2; break;
      case "Q3_Informaron_adjudicacion": val = respuestas.q3; break;
      case "Q4_Diferencia_licitar_adjudicar": val = respuestas.q4; break;
      case "Monto_2da_cuota_base": val = cliente.montoCuota2Base; break;
      case "Q5_Informaron_monto_cuota_2": val = respuestas.q5; break;
      case "Q6_Primera_cuota_monto_medio": val = respuestas.q6; break;
      case "Q7_Fecha_pago_primera_cuota": val = respuestas.q7; break;
      case "Q8_Como_seguira_pagando": val = respuestas.q8; break;
      case "Q8B_Firmo_anexo_debito": val = respuestas.q8b || ""; break;
      case "Q8C_Entendio_debito": val = respuestas.q8c || ""; break;
      case "Q9_Quien_es_vendedor": val = respuestas.q9; break;
      case "Q10_Calificacion_vendedor": val = respuestas.q10; break;
      case "Q11_Explico_caracteristicas_unidad": val = respuestas.q11; break;
      case "Q12_Otro_plan_reciente": val = respuestas.q12; break;
      case "Q13_Tiene_usado": val = respuestas.q13; break;
      case "Q13A_Vehiculo_usado": val = respuestas.q13a || ""; break;
      case "Q14_Como_conocio_propuesta": val = respuestas.q14; break;
      case "Q15_Recibio_beneficio_regalo": val = respuestas.q15; break;
      case "Q15A_Detalle_beneficio": val = respuestas.beneficioDetalle || ""; break;
      case "Q16_Observaciones_cliente": val = respuestas.q16; break;
      case "Q17_Necesita_recontacto": val = respuestas.q17; break;
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

function actualizarBaseCliente(rowIndex, scoring, opciones) {
  var sheet = getSheet("Base_Clientes");
  var headerMap = getHeaderMap(sheet);
  var fechaActual = new Date();
  var origen = opciones && opciones.origen ? opciones.origen : "WEB";

  sheet.getRange(rowIndex, headerMap["ESTADO_ENCUESTA"]).setValue(origen === "LLAMADA" ? "Scoring por llamada" : "Respondido");
  if (origen !== "LLAMADA") sheet.getRange(rowIndex, headerMap["FECHA_RESPUESTA_WEB"]).setValue(fechaActual);
  sheet.getRange(rowIndex, headerMap["Fecha realizacion scoring"]).setValue(fechaActual);
  sheet.getRange(rowIndex, headerMap["RESULTADO_SCORING"]).setValue(scoring.resultado);
  sheet.getRange(rowIndex, headerMap["MOTIVO_RESULTADO"]).setValue(scoring.motivo);
  sheet.getRange(rowIndex, headerMap["REQUIERE_RECONTACTO"]).setValue(scoring.requiereRecontacto);
  sheet.getRange(rowIndex, headerMap["AREA_A_REVISAR"]).setValue(scoring.area);
  sheet.getRange(rowIndex, headerMap["OBSERVACION_INTERNA"]).setValue(scoring.observacion);
  if (headerMap["RESPONDIO_CLIENTE"]) sheet.getRange(rowIndex, headerMap["RESPONDIO_CLIENTE"]).setValue("Si");
  if (headerMap["ESTADO_FINAL_CC"]) sheet.getRange(rowIndex, headerMap["ESTADO_FINAL_CC"]).setValue(scoring.resultado);

  upsertSeguimientoCCDesdeBase(rowIndex);
}

function calcularScoring(respuestas) {
  var resultado = "Paso scoring";
  var motivo = "Validacion conforme.";
  var requiereRecontacto = "No";
  var area = "Sin revision";

  var q1 = respuestas.q1 || "";
  var q2 = respuestas.q2 || "";
  var q3 = respuestas.q3 || "";
  var q4 = respuestas.q4 || "";
  var q5 = respuestas.q5 || "";
  var q6 = respuestas.q6 || "";
  var q8c = respuestas.q8c || "";
  var q9 = respuestas.q9 || "";
  var q10 = parseInt(respuestas.q10 || "5", 10);
  var q11 = respuestas.q11 || "";
  var q12 = respuestas.q12 || "";
  var q13 = respuestas.q13 || "";
  var q15 = respuestas.q15 || "";
  var q16 = respuestas.q16 || "";
  var q17 = respuestas.q17 || "";
  var esSi = function(valor) { return valor === "Si" || valor === ("S" + String.fromCharCode(237)); };

  var hallazgosRevision = [];
  var hallazgosRecontacto = [];
  var hallazgosNoPaso = [];
  var observacionesInternas = [];

  var agregar = function(lista, pregunta, respuesta, detalle) {
    var texto = pregunta + ": respuesta '" + (respuesta || "Sin dato") + "'";
    if (detalle) texto += ". " + detalle;
    lista.push(texto);
  };

  var enumerar = function(lista) {
    var salida = [];
    for (var i = 0; i < lista.length; i++) {
      salida.push((i + 1) + '. ' + lista[i]);
    }
    return salida.join(' | ');
  };

  var contienePalabrasClaveNegativas = function(texto) {
    if (!texto) return false;
    var keywords = ["reclamo", "problema", "no me explicaron", "nadie me llamo", "disconforme", "mentira", "engano", "no entiendo", "duda", "molestia"];
    var lower = texto.toLowerCase();
    for (var i = 0; i < keywords.length; i++) {
      if (lower.indexOf(keywords[i]) !== -1) return true;
    }
    return false;
  };

  var contieneDudasPago = function(texto) {
    if (!texto) return false;
    var keywords = ["duda", "no se", "mal cobrado", "error", "diferente", "mas", "menos"];
    var lower = texto.toLowerCase();
    for (var i = 0; i < keywords.length; i++) {
      if (lower.indexOf(keywords[i]) !== -1) return true;
    }
    return false;
  };

  if (q10 === 1 || q10 === 2) agregar(hallazgosRevision, "Q10", q10, "Calificacion muy baja del vendedor.");
  if (q2 === "No recuerdo") agregar(hallazgosRevision, "Q2", q2, "No recuerda informacion sobre licitacion.");
  if (q3 === "No recuerdo") agregar(hallazgosRevision, "Q3", q3, "No recuerda informacion sobre adjudicacion.");
  if (q4 === "Parcialmente") agregar(hallazgosRevision, "Q4", q4, "Diferencia entre licitar y adjudicar no clara.");
  if (q5 === "No recuerdo") agregar(hallazgosRevision, "Q5", q5, "No recuerda monto de segunda cuota.");
  if (q11 === "Parcialmente") agregar(hallazgosRevision, "Q11", q11, "Explicacion parcial de caracteristicas de la unidad.");
  if (q12 && q12.toLowerCase() !== "no" && q12.trim() !== "") agregar(hallazgosRevision, "Q12", q12, "Menciona otro plan o gestion reciente.");
  if (esSi(q13)) agregar(hallazgosRevision, "Q13", q13, "Declara entrega de vehiculo usado.");

  if (esSi(q17)) agregar(hallazgosRecontacto, "Q17", q17, "Solicita contacto posterior.");
  if (q8c === "No" || q8c === "Parcialmente") agregar(hallazgosRecontacto, "Q8C", q8c, "No quedo claro el debito o forma de pago.");
  if (contieneDudasPago(q6)) agregar(hallazgosRecontacto, "Q6", q6, "Hay dudas o inconsistencia sobre pago inicial.");
  if (contienePalabrasClaveNegativas(q16)) agregar(hallazgosRecontacto, "Q16", q16, "Observacion critica del cliente.");

  if (q1 === "No") agregar(hallazgosNoPaso, "Q1", q1, "No conoce correctamente el plan.");
  if (q2 === "No") agregar(hallazgosNoPaso, "Q2", q2, "Indica que no le explicaron licitacion.");
  if (q3 === "No") agregar(hallazgosNoPaso, "Q3", q3, "Indica que no le explicaron adjudicacion.");
  if (q4 === "No") agregar(hallazgosNoPaso, "Q4", q4, "No distingue licitar de adjudicar.");
  if (q5 === "No") agregar(hallazgosNoPaso, "Q5", q5, "Indica que no le informaron el monto de segunda cuota.");
  if (!q9 || q9.toLowerCase().indexOf("vacio") !== -1 || q9.toLowerCase().indexOf("no se") !== -1 || q9.trim() === "") agregar(hallazgosNoPaso, "Q9", q9, "No identifica al vendedor.");
  if (q15 === "Se lo prometieron pero no lo recibio" || q15 === ("Se lo prometieron pero no lo recibi" + String.fromCharCode(243))) agregar(hallazgosNoPaso, "Q15", q15, "Declara beneficio prometido no entregado.");

  if (q16) observacionesInternas.push("Observacion cliente: " + q16);

  if (hallazgosNoPaso.length > 0) {
    resultado = "No paso scoring";
    area = "Administracion Plan de Ahorro";
    if (!q9 || q9.trim() === "") area = "Asesor comercial";
    motivo = enumerar(hallazgosNoPaso);
  } else if (hallazgosRecontacto.length > 0) {
    resultado = "Requiere recontacto";
    requiereRecontacto = "Si";
    area = esSi(q17) ? "Contact Center" : "Gestion de pagos";
    motivo = enumerar(hallazgosRecontacto);
  } else if (hallazgosRevision.length > 0) {
    resultado = "Requiere revision";
    area = esSi(q13) ? "Entrega / usado" : "Asesor comercial";
    motivo = enumerar(hallazgosRevision);
  }

  if (hallazgosRevision.length > 0 && resultado !== "Requiere revision") {
    observacionesInternas.push("Alertas de revision: " + enumerar(hallazgosRevision));
  }
  if (hallazgosRecontacto.length > 0 && resultado !== "Requiere recontacto") {
    observacionesInternas.push("Alertas de recontacto: " + enumerar(hallazgosRecontacto));
  }
  if (hallazgosNoPaso.length > 0 && resultado !== "No paso scoring") {
    observacionesInternas.push("Alertas criticas: " + enumerar(hallazgosNoPaso));
  }

  return {
    resultado: resultado,
    motivo: motivo,
    requiereRecontacto: requiereRecontacto,
    area: area,
    observacion: observacionesInternas.join(' | ')
  };
}

function generarLinks() {
  var resultado = generarLinksInterno();
  if (resultado.error) return "Error: " + resultado.error;
  return "Se generaron " + resultado.count + " links correctamente.";
}

function generarLinksInterno() {
  var sheet = getSheet("Base_Clientes");
  var headerMap = getHeaderMap(sheet);
  var data = sheet.getDataRange().getValues();
  var count = 0;
  var rowsActualizadas = [];

  var netlifyBaseUrl;
  try {
    netlifyBaseUrl = normalizarNetlifyBaseUrl();
  } catch (error) {
    return { error: error.message, count: 0, rows: [] };
  }

  for (var i = 1; i < data.length; i++) {
    var nombre = data[i][headerMap["Nombre y Apellido"] - 1];
    var celular = data[i][headerMap["Celular"] - 1];
    var tokenExistente = data[i][headerMap["TOKEN"] - 1];

    if (nombre && celular && !tokenExistente) {
      var rowIndex = i + 1;
      var token = "T" + Utilities.getUuid().slice(0, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
      var link = netlifyBaseUrl + "?t=" + token;

      sheet.getRange(rowIndex, headerMap["TOKEN"]).setValue(token);
      setCeldaLinkEncuesta(sheet, rowIndex, headerMap["LINK_ENCUESTA"], link);
      sheet.getRange(rowIndex, headerMap["ESTADO_ENCUESTA"]).setValue("Link generado");
      sheet.getRange(rowIndex, headerMap["FECHA_ENVIO_LINK"]).setValue(new Date());
      sheet.getRange(rowIndex, headerMap["INTENTOS_INVALIDOS"]).setValue(0);
      if (headerMap["ESTADO_ENVIO_WPP"]) sheet.getRange(rowIndex, headerMap["ESTADO_ENVIO_WPP"]).setValue("Pendiente de preparacion");
      if (headerMap["CANTIDAD_INTENTOS_WPP"]) sheet.getRange(rowIndex, headerMap["CANTIDAD_INTENTOS_WPP"]).setValue(0);
      if (headerMap["RESPONDIO_CLIENTE"]) sheet.getRange(rowIndex, headerMap["RESPONDIO_CLIENTE"]).setValue("No");
      if (headerMap["ESTADO_FINAL_CC"]) sheet.getRange(rowIndex, headerMap["ESTADO_FINAL_CC"]).setValue("Pendiente");

      rowsActualizadas.push(rowIndex);
      count++;
    }
  }

  return { count: count, rows: rowsActualizadas, error: "" };
}

function regenerarLinksExistentes() {
  var sheet = getSheet("Base_Clientes");
  var headerMap = getHeaderMap(sheet);
  var data = sheet.getDataRange().getValues();
  var count = 0;

  var netlifyBaseUrl;
  try {
    netlifyBaseUrl = normalizarNetlifyBaseUrl();
  } catch (error) {
    return "Error: " + error.message;
  }

  for (var i = 1; i < data.length; i++) {
    var token = data[i][headerMap["TOKEN"] - 1];
    if (!token) continue;

    var link = netlifyBaseUrl + "?t=" + token;
    setCeldaLinkEncuesta(sheet, i + 1, headerMap["LINK_ENCUESTA"], link);
    if (headerMap["ESTADO_ENCUESTA"] && !data[i][headerMap["ESTADO_ENCUESTA"] - 1]) {
      sheet.getRange(i + 1, headerMap["ESTADO_ENCUESTA"]).setValue("Link generado");
    }

    upsertSeguimientoCCDesdeBase(i + 1);
    count++;
  }

  return "Se regeneraron " + count + " links a partir de los tokens existentes.";
}

function procesarNuevosIngresos() {
  var resultado = generarLinksInterno();
  if (resultado.error) return "Error: " + resultado.error;
  if (resultado.count === 0) return "No habia clientes nuevos para procesar.";

  var resultadoWpp = generarMensajeWhatsAppParaFilas(resultado.rows);
  sincronizarSeguimientoCCFilas(resultado.rows);
  return "Se procesaron " + resultado.count + " clientes nuevos. | " + resultadoWpp;
}

function generarMensajeWhatsApp() {
  var sheet = getSheet("Base_Clientes");
  var lastRow = sheet.getLastRow();
  var rows = [];
  for (var row = 2; row <= lastRow; row++) rows.push(row);
  return generarMensajeWhatsAppParaFilas(rows);
}

function generarMensajeWhatsAppParaFilas(rows) {
  if (!rows || rows.length === 0) return "No habia filas para preparar en WhatsApp.";

  var sheet = getSheet("Base_Clientes");
  var headerMap = getHeaderMap(sheet);
  var count = 0;

  for (var r = 0; r < rows.length; r++) {
    var rowIndex = rows[r];
    var rowValues = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nombre = rowValues[headerMap["Nombre y Apellido"] - 1];
    var celular = rowValues[headerMap["Celular"] - 1];
    var linkEncuesta = rowValues[headerMap["LINK_ENCUESTA"] - 1];

    if (nombre && celular && linkEncuesta) {
      var cellClean = celular.toString().replace(/\D/g, "");
      if (cellClean.length === 10) cellClean = "549" + cellClean;

      var mensajeText = "Hola, Sr./Sra. " + nombre + ". Mi nombre es " + NOMBRE_CONTACT + ", me comunico desde Autosol.\n\n" +
        "Le compartimos el link para realizar la validacion de su suscripcion al Plan de Ahorro:\n\n" +
        linkEncuesta + "\n\n" +
        "La encuesta es breve y nos permite confirmar que la informacion de su plan fue correctamente explicada y registrada. Para ingresar, debera colocar su DNI unicamente como validacion de identidad.\n\n" +
        "Muchas gracias. Saludos cordiales.";

      var waLink = "https://wa.me/" + cellClean + "?text=" + encodeURIComponent(mensajeText);
      setCeldaLinkWhatsApp(sheet, rowIndex, headerMap["ENVIAR WPP"], waLink, nombre);
      if (headerMap["ESTADO_ENVIO_WPP"]) sheet.getRange(rowIndex, headerMap["ESTADO_ENVIO_WPP"]).setValue("Listo para enviar");
      count++;
    }
  }

  return "Se compilaron " + count + " links de WhatsApp.";
}

function procesarScoringLlamadas() {
  var trackingSheet = getSheet("Seguimiento_CC");
  if (trackingSheet.getLastRow() < 2) return "No hay filas para procesar por llamada.";

  var headerMap = getHeaderMap(trackingSheet);
  var labels = getSeguimientoLabelByKeyMap();
  var data = trackingSheet.getRange(2, 1, trackingSheet.getLastRow() - 1, trackingSheet.getLastColumn()).getValues();
  var procesados = 0;
  var omitidos = 0;

  for (var i = 0; i < data.length; i++) {
    var rowIndex = i + 2;
    var canal = headerMap[labels["CANAL_SCORING"]] ? data[i][headerMap[labels["CANAL_SCORING"]] - 1] : "";
    var estadoGestion = headerMap[labels["ESTADO_GESTION"]] ? data[i][headerMap[labels["ESTADO_GESTION"]] - 1] : "";
    var proximaAccion = headerMap[labels["PROXIMA_ACCION"]] ? data[i][headerMap[labels["PROXIMA_ACCION"]] - 1] : "";

    var esLlamada = canal === "Llamada" || canal === "Hibrido";
    var listoParaAplicar = estadoGestion === "Llamada completa" || proximaAccion === "Aplicar scoring";
    if (!esLlamada || !listoParaAplicar) continue;

    var idCliente = headerMap[labels["ID_CLIENTE"]] ? data[i][headerMap[labels["ID_CLIENTE"]] - 1] : "";
    var token = headerMap[labels["TOKEN"]] ? data[i][headerMap[labels["TOKEN"]] - 1] : "";
    var baseRow = findBaseRowByIdOrToken(idCliente, token);
    if (!baseRow) {
      omitidos++;
      continue;
    }

    var respuestas = buildRespuestasFromSeguimientoRow(data[i], headerMap, labels);
    if (!respuestas.q1 || !respuestas.q2 || !respuestas.q3 || !respuestas.q4 || !respuestas.q5 || !respuestas.q9 || !respuestas.q10 || !respuestas.q11 || !respuestas.q14 || !respuestas.q15 || !respuestas.q17) {
      omitidos++;
      continue;
    }

    var scoring = calcularScoring(respuestas);
    var clienteInfo = {
      idCliente: baseRow.values[baseRow.headerMap["ID_CLIENTE"] - 1],
      nombre: baseRow.values[baseRow.headerMap["Nombre y Apellido"] - 1],
      modelo: baseRow.values[baseRow.headerMap["Modelo suscripto/falta plan"] - 1],
      asesor: baseRow.values[baseRow.headerMap["Nombre del Asesor"] - 1],
      montoCuota2Base: baseRow.values[baseRow.headerMap["Monto 2da cuota (aprox)"] - 1],
      token: token || (baseRow.headerMap["TOKEN"] ? baseRow.values[baseRow.headerMap["TOKEN"] - 1] : ""),
      dniHash: baseRow.headerMap["DNI_HASH"] ? baseRow.values[baseRow.headerMap["DNI_HASH"] - 1] : ""
    };

    guardarRespuestaScoring(clienteInfo, respuestas, scoring);
    actualizarBaseCliente(baseRow.rowIndex, scoring, { origen: "LLAMADA" });

    if (headerMap[labels["RESPONDIO_CLIENTE"]]) trackingSheet.getRange(rowIndex, headerMap[labels["RESPONDIO_CLIENTE"]]).setValue("Si");
    if (headerMap[labels["RESULTADO_SCORING"]]) trackingSheet.getRange(rowIndex, headerMap[labels["RESULTADO_SCORING"]]).setValue(scoring.resultado);
    if (headerMap[labels["MOTIVO_RESULTADO"]]) trackingSheet.getRange(rowIndex, headerMap[labels["MOTIVO_RESULTADO"]]).setValue(scoring.motivo);
    if (headerMap[labels["REQUIERE_RECONTACTO"]]) trackingSheet.getRange(rowIndex, headerMap[labels["REQUIERE_RECONTACTO"]]).setValue(scoring.requiereRecontacto);
    if (headerMap[labels["ESTADO_FINAL_CC"]]) trackingSheet.getRange(rowIndex, headerMap[labels["ESTADO_FINAL_CC"]]).setValue(scoring.resultado);
    if (headerMap[labels["AREA_A_REVISAR"]]) trackingSheet.getRange(rowIndex, headerMap[labels["AREA_A_REVISAR"]]).setValue(scoring.area);
    if (headerMap[labels["OBSERVACION_INTERNA"]]) trackingSheet.getRange(rowIndex, headerMap[labels["OBSERVACION_INTERNA"]]).setValue(scoring.observacion);
    if (headerMap[labels["ESTADO_GESTION"]]) trackingSheet.getRange(rowIndex, headerMap[labels["ESTADO_GESTION"]]).setValue("Scoring cerrado");
    if (headerMap[labels["PROXIMA_ACCION"]]) trackingSheet.getRange(rowIndex, headerMap[labels["PROXIMA_ACCION"]]).setValue("Cerrado");
    if (headerMap[labels["ESTADO_ENCUESTA"]]) trackingSheet.getRange(rowIndex, headerMap[labels["ESTADO_ENCUESTA"]]).setValue("Scoring por llamada");
    procesados++;
  }

  formatearSeguimientoCC();
  return "Scoring de llamada aplicado en " + procesados + " filas. Omitidas: " + omitidos + ".";
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
  if (!nombreCompleto) return "Enviar mensaje";
  var nombre = nombreCompleto.toString().trim().split(/\s+/)[0];
  return "Enviar mensaje a " + nombre;
}

function setCeldaLinkWhatsApp(sheet, rowIndex, colIndex, url, nombreCompleto) {
  var texto = construirTextoBotonWhatsApp(nombreCompleto);
  var richText = SpreadsheetApp.newRichTextValue()
    .setText(texto)
    .setLinkUrl(url)
    .build();
  sheet.getRange(rowIndex, colIndex).setRichTextValue(richText);
}

function sincronizarSeguimientoCCFilas(rows) {
  if (!rows || rows.length === 0) return "No habia filas para sincronizar.";
  for (var i = 0; i < rows.length; i++) {
    upsertSeguimientoCCDesdeBase(rows[i]);
  }
  return "Seguimiento parcial sincronizado.";
}

function actualizarGestionCC(idCliente, estadoFinal, observacion, operador, respondioCliente) {
  var sheet = getSheet("Base_Clientes");
  var headerMap = getHeaderMap(sheet);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][headerMap["ID_CLIENTE"] - 1] == idCliente) {
      var rowIndex = i + 1;
      if (estadoFinal && headerMap["ESTADO_FINAL_CC"]) sheet.getRange(rowIndex, headerMap["ESTADO_FINAL_CC"]).setValue(estadoFinal);
      if (observacion !== undefined && observacion !== null && headerMap["OBS_CC"]) sheet.getRange(rowIndex, headerMap["OBS_CC"]).setValue(observacion);
      if (operador && headerMap["OPERADOR_CC"]) sheet.getRange(rowIndex, headerMap["OPERADOR_CC"]).setValue(operador);
      if (headerMap["ULTIMO_CONTACTO_CC"]) sheet.getRange(rowIndex, headerMap["ULTIMO_CONTACTO_CC"]).setValue(new Date());
      if (respondioCliente && headerMap["RESPONDIO_CLIENTE"]) sheet.getRange(rowIndex, headerMap["RESPONDIO_CLIENTE"]).setValue(respondioCliente);
      upsertSeguimientoCCDesdeBase(rowIndex);
      return "Gestion actualizada para " + idCliente;
    }
  }

  return "No se encontro el cliente " + idCliente;
}

function registrarEnvioWhatsApp(idCliente, operador) {
  var sheet = getSheet("Base_Clientes");
  var headerMap = getHeaderMap(sheet);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][headerMap["ID_CLIENTE"] - 1] == idCliente) {
      var rowIndex = i + 1;
      var intentosActuales = parseInt(data[i][headerMap["CANTIDAD_INTENTOS_WPP"] - 1] || 0, 10);
      sheet.getRange(rowIndex, headerMap["ESTADO_ENVIO_WPP"]).setValue("Enviado");
      sheet.getRange(rowIndex, headerMap["FECHA_ULTIMO_ENVIO_WPP"]).setValue(new Date());
      sheet.getRange(rowIndex, headerMap["ULTIMO_CONTACTO_CC"]).setValue(new Date());
      sheet.getRange(rowIndex, headerMap["CANTIDAD_INTENTOS_WPP"]).setValue(intentosActuales + 1);
      if (operador) sheet.getRange(rowIndex, headerMap["OPERADOR_CC"]).setValue(operador);
      upsertSeguimientoCCDesdeBase(rowIndex);
      return "Envio registrado para " + idCliente;
    }
  }

  return "No se encontro el cliente " + idCliente;
}

function registrarLog(token, dniHash, resultado, detalle, origen) {
  try {
    var sheet = getSheet("Log_Seguridad");
    sheet.appendRow([new Date(), token || "N/A", dniHash || "N/A", resultado, detalle, origen || "Backend"]);
  } catch (err) {
    Logger.log("Error al escribir log de seguridad: " + err.toString());
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
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

function obtenerValorPorHeaders(rowValues, headerMap, possibleHeaders) {
  for (var i = 0; i < possibleHeaders.length; i++) {
    var key = possibleHeaders[i];
    if (headerMap[key]) return rowValues[headerMap[key] - 1];
  }
  return "";
}

function normalizarNetlifyBaseUrl() {
  var raw = PropertiesService.getScriptProperties().getProperty("NETLIFY_BASE_URL");
  if (!raw) {
    throw new Error("NETLIFY_BASE_URL no esta configurado en Script Properties.");
  }

  var url = raw.toString().trim();
  url = url.replace(/\/+$/, "");
  url = url.replace(/\?.*$/, "");

  if (!/^https:\/\//i.test(url)) {
    throw new Error("NETLIFY_BASE_URL invalido: debe comenzar con https:// y hoy vale: " + url);
  }

  if (url.indexOf("netlify.app") === -1 && url.indexOf("plan-encuesta") === -1) {
    throw new Error("NETLIFY_BASE_URL parece incorrecto: " + url);
  }

  return url + "/";
}

function getHeaderMap(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  var headers = headerRange.getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    if (headers[i]) map[headers[i].toString().trim()] = i + 1;
  }
  return map;
}

function getSeguimientoColumns() {
  return [
    { key: "ENVIAR WPP", label: "WhatsApp" },
    { key: "Nombre y Apellido", label: "Cliente" },
    { key: "Celular", label: "Celular" },
    { key: "LINK_ENCUESTA", label: "Encuesta" },
    { key: "CANAL_SCORING", label: "Canal" },
    { key: "ESTADO_GESTION", label: "Estado gestion" },
    { key: "PROXIMA_ACCION", label: "Proxima accion" },
    { key: "ESTADO_ENVIO_WPP", label: "Estado envio" },
    { key: "ESTADO_ENCUESTA", label: "Estado encuesta" },
    { key: "RESPONDIO_CLIENTE", label: "Respondio" },
    { key: "RESULTADO_SCORING", label: "Resultado" },
    { key: "MOTIVO_RESULTADO", label: "Motivo / detalle" },
    { key: "REQUIERE_RECONTACTO", label: "Recontacto" },
    { key: "OBS_CC", label: "Observaciones operador" },
    { key: "OPERADOR_CC", label: "Operador" },
    { key: "CALL_Q1", label: "Llamada Q1 - Conocia plan" },
    { key: "CALL_Q2", label: "Llamada Q2 - Informaron licitacion" },
    { key: "CALL_Q3", label: "Llamada Q3 - Informaron adjudicacion" },
    { key: "CALL_Q4", label: "Llamada Q4 - Diferencia licitar/adjudicar" },
    { key: "CALL_Q5", label: "Llamada Q5 - Informaron cuota 2" },
    { key: "CALL_Q6", label: "Llamada Q6 - Primera cuota y medio" },
    { key: "CALL_Q7", label: "Llamada Q7 - Fecha primera cuota" },
    { key: "CALL_Q8", label: "Llamada Q8 - Como seguira pagando" },
    { key: "CALL_Q8B", label: "Llamada Q8B - Firmo anexo debito" },
    { key: "CALL_Q8C", label: "Llamada Q8C - Entendio debito" },
    { key: "CALL_Q9", label: "Llamada Q9 - Quien es su vendedor" },
    { key: "CALL_Q10", label: "Llamada Q10 - Calificacion vendedor" },
    { key: "CALL_Q11", label: "Llamada Q11 - Explico unidad" },
    { key: "CALL_Q12", label: "Llamada Q12 - Otro plan reciente" },
    { key: "CALL_Q13", label: "Llamada Q13 - Tiene usado" },
    { key: "CALL_Q13A", label: "Llamada Q13A - Vehiculo usado" },
    { key: "CALL_Q14", label: "Llamada Q14 - Como conocio propuesta" },
    { key: "CALL_Q15", label: "Llamada Q15 - Beneficio o regalo" },
    { key: "CALL_Q15A", label: "Llamada Q15A - Detalle beneficio" },
    { key: "CALL_Q16", label: "Llamada Q16 - Observaciones cliente" },
    { key: "CALL_Q17", label: "Llamada Q17 - Necesita recontacto" },
    { key: "ESTADO_FINAL_CC", label: "Estado final" },
    { key: "AREA_A_REVISAR", label: "Area a revisar" },
    { key: "OBSERVACION_INTERNA", label: "Observaciones internas" },
    { key: "Nombre del Asesor", label: "Asesor" },
    { key: "FECHA_ULTIMO_ENVIO_WPP", label: "Ultimo envio" },
    { key: "ULTIMO_CONTACTO_CC", label: "Ultimo contacto" },
    { key: "CANTIDAD_INTENTOS_WPP", label: "Intentos" },
    { key: "ID_CLIENTE", label: "ID interno" },
    { key: "TOKEN", label: "Token" }
  ];
}

function getSeguimientoHeaders() {
  var columns = getSeguimientoColumns();
  var headers = [];
  for (var i = 0; i < columns.length; i++) headers.push(columns[i].label);
  return headers;
}

function getSeguimientoKeyByLabelMap() {
  var columns = getSeguimientoColumns();
  var map = {};
  for (var i = 0; i < columns.length; i++) map[columns[i].label] = columns[i].key;
  return map;
}

function getSeguimientoLabelByKeyMap() {
  var columns = getSeguimientoColumns();
  var map = {};
  for (var i = 0; i < columns.length; i++) map[columns[i].key] = columns[i].label;
  return map;
}

function getSeguimientoEditableLocalKeys() {
  return {
    "CANAL_SCORING": true,
    "ESTADO_GESTION": true,
    "PROXIMA_ACCION": true,
    "OPERADOR_CC": true,
    "OBS_CC": true,
    "CALL_Q1": true,
    "CALL_Q2": true,
    "CALL_Q3": true,
    "CALL_Q4": true,
    "CALL_Q5": true,
    "CALL_Q6": true,
    "CALL_Q7": true,
    "CALL_Q8": true,
    "CALL_Q8B": true,
    "CALL_Q8C": true,
    "CALL_Q9": true,
    "CALL_Q10": true,
    "CALL_Q11": true,
    "CALL_Q12": true,
    "CALL_Q13": true,
    "CALL_Q13A": true,
    "CALL_Q14": true,
    "CALL_Q15": true,
    "CALL_Q15A": true,
    "CALL_Q16": true,
    "CALL_Q17": true
  };
}

function getSeguimientoDefaultValue(key) {
  if (key === "CANAL_SCORING") return "WhatsApp";
  if (key === "ESTADO_GESTION") return "Nuevo";
  if (key === "PROXIMA_ACCION") return "Enviar WPP";
  return "";
}

function buildRespuestasFromSeguimientoRow(rowValues, headerMap, labels) {
  var valueOf = function(key) {
    var label = labels[key];
    if (!label || !headerMap[label]) return "";
    return rowValues[headerMap[label] - 1] || "";
  };

  return {
    q1: valueOf("CALL_Q1"),
    q2: valueOf("CALL_Q2"),
    q3: valueOf("CALL_Q3"),
    q4: valueOf("CALL_Q4"),
    q5: valueOf("CALL_Q5"),
    q6: valueOf("CALL_Q6"),
    q7: valueOf("CALL_Q7"),
    q8: valueOf("CALL_Q8"),
    q8b: valueOf("CALL_Q8B"),
    q8c: valueOf("CALL_Q8C"),
    q9: valueOf("CALL_Q9"),
    q10: valueOf("CALL_Q10"),
    q11: valueOf("CALL_Q11"),
    q12: valueOf("CALL_Q12"),
    q13: valueOf("CALL_Q13"),
    q13a: valueOf("CALL_Q13A"),
    q14: valueOf("CALL_Q14"),
    q15: valueOf("CALL_Q15"),
    beneficioDetalle: valueOf("CALL_Q15A"),
    q16: valueOf("CALL_Q16"),
    q17: valueOf("CALL_Q17")
  };
}

function findBaseRowByIdOrToken(idCliente, token) {
  var sheet = getSheet("Base_Clientes");
  var headerMap = getHeaderMap(sheet);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rowId = headerMap["ID_CLIENTE"] ? data[i][headerMap["ID_CLIENTE"] - 1] : "";
    var rowToken = headerMap["TOKEN"] ? data[i][headerMap["TOKEN"] - 1] : "";
    if ((idCliente && rowId == idCliente) || (token && rowToken == token)) {
      return { rowIndex: i + 1, values: data[i], headerMap: headerMap };
    }
  }
  return null;
}

function ensureSheets() {
  var ss = getSpreadsheet();
  var required = ["Base_Clientes", "Respuestas_Scoring", "Preguntas", "Log_Seguridad", "Dashboard", "Vendedores", "Seguimiento_CC", "Instructivo_CC"];
  for (var i = 0; i < required.length; i++) {
    if (!ss.getSheetByName(required[i])) ss.insertSheet(required[i]);
  }
}

function ensureHeadersPresent(sheetName, headers) {
  var sheet = getSheet(sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#eef2f7");
    sheet.setFrozenRows(1);
    return;
  }

  var currentHeaders = [];
  if (sheet.getLastColumn() > 0) {
    currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }

  var existing = {};
  for (var i = 0; i < currentHeaders.length; i++) {
    if (currentHeaders[i]) existing[currentHeaders[i].toString().trim()] = true;
  }

  var missing = [];
  for (var j = 0; j < headers.length; j++) {
    if (!existing[headers[j]]) missing.push(headers[j]);
  }

  if (missing.length > 0) {
    sheet.getRange(1, sheet.getLastColumn() + 1, 1, missing.length).setValues([missing]);
  }

  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold").setBackground("#eef2f7");
  sheet.setFrozenRows(1);
}

function ensureHeaders() {
  var headersBase = [
    "Mes", "Nº", "fecha de carga de planilla", "Nro de solicitud", "Nombre y Apellido",
    "Celular", "Mail", "Modelo suscripto/falta plan", "Nombre del Asesor", "Monto 2da cuota (aprox)",
    "¿Como seguira pagando su plan?", "Observaciones", "ID_CLIENTE", "Modelo detectado", "Porcentaje financiado",
    "Porcentaje licitacion", "Adjudicacion asegurada", "Cuotas adjudicacion", "Beneficio detectado",
    "Nombre persona contactada", "Estado contacto", "Gestionado por Asesor CC", "Fecha 1er llamado",
    "Fecha 2do llamado", "Fecha 3er llamado", "Fecha realizacion scoring", "TOKEN", "DNI_HASH",
    "LINK_ENCUESTA", "ENVIAR WPP", "ESTADO_ENVIO_WPP", "OPERADOR_CC", "FECHA_ULTIMO_ENVIO_WPP",
    "CANTIDAD_INTENTOS_WPP", "ULTIMO_CONTACTO_CC", "ESTADO_ENCUESTA", "RESPONDIO_CLIENTE", "FECHA_ENVIO_LINK", "FECHA_RESPUESTA_WEB",
    "RESULTADO_SCORING", "MOTIVO_RESULTADO", "REQUIERE_RECONTACTO", "AREA_A_REVISAR", "ESTADO_FINAL_CC", "OBS_CC", "OBSERVACION_INTERNA",
    "INTENTOS_INVALIDOS"
  ];

  var headersScoring = [
    "ID_RESPUESTA", "ID_CLIENTE", "TOKEN_HASH", "DNI_HASH", "Fecha respuesta", "Nombre y Apellido",
    "Modelo suscripto", "Nombre del Asesor", "Q1_Conocia_plan", "Q2_Informaron_licitacion",
    "Q3_Informaron_adjudicacion", "Q4_Diferencia_licitar_adjudicar", "Monto_2da_cuota_base",
    "Q5_Informaron_monto_cuota_2", "Q6_Primera_cuota_monto_medio", "Q7_Fecha_pago_primera_cuota",
    "Q8_Como_seguira_pagando", "Q8B_Firmo_anexo_debito", "Q8C_Entendio_debito", "Q9_Quien_es_vendedor",
    "Q10_Calificacion_vendedor", "Q11_Explico_caracteristicas_unidad", "Q12_Otro_plan_reciente",
    "Q13_Tiene_usado", "Q13A_Vehiculo_usado", "Q14_Como_conocio_propuesta", "Q15_Recibio_beneficio_regalo",
    "Q15A_Detalle_beneficio", "Q16_Observaciones_cliente", "Q17_Necesita_recontacto", "RESULTADO_SCORING",
    "MOTIVO_RESULTADO", "REQUIERE_RECONTACTO", "AREA_A_REVISAR", "OBSERVACION_INTERNA"
  ];

  var headersPreguntas = ["Codigo", "Bloque", "Orden", "Pregunta", "Tipo", "Opciones", "Obligatoria", "Condicion", "Columna_respuesta", "Activa"];
  var headersLogs = ["Fecha", "Token", "DNI_HASH", "Resultado", "Detalle", "Origen"];
  var headersDashboard = ["Indicador", "Valor", "Observacion"];
  var headersSeguimiento = getSeguimientoHeaders();
  var headersVendedores = ["Nombre del Vendedor"];

  ensureHeadersPresent("Base_Clientes", headersBase);
  ensureHeadersPresent("Respuestas_Scoring", headersScoring);
  ensureHeadersPresent("Preguntas", headersPreguntas);
  ensureHeadersPresent("Log_Seguridad", headersLogs);
  ensureHeadersPresent("Dashboard", headersDashboard);
  ensureHeadersPresent("Seguimiento_CC", headersSeguimiento);
  ensureHeadersPresent("Vendedores", headersVendedores);

  var vendSheet = getSheet("Vendedores");
  if (vendSheet.getLastRow() === 1) {
    var defaultVendors = [
      ["ARIADNA PETRUCIOLI"],
      ["BRIAN DOUTHAT"],
      ["EMILSE DIAZ"],
      ["GASTON BASTOS"],
      ["HORACIO ZELAYA"],
      ["JOSE SALUZZO"],
      ["RODRIGO VILLAFAÑE"],
      ["VANESA ZAMBRANO"]
    ];
    vendSheet.getRange(2, 1, defaultVendors.length, 1).setValues(defaultVendors);
  }
}

function upsertSeguimientoCCDesdeBase(rowIndex) {
  var baseSheet = getSheet("Base_Clientes");
  var trackingSheet = getSheet("Seguimiento_CC");
  var baseHeaders = getHeaderMap(baseSheet);
  var trackingHeaders = getHeaderMap(trackingSheet);
  var rowValues = baseSheet.getRange(rowIndex, 1, 1, baseSheet.getLastColumn()).getValues()[0];
  var idCliente = rowValues[baseHeaders["ID_CLIENTE"] - 1];
  var token = rowValues[baseHeaders["TOKEN"] - 1];
  if (!idCliente && !token) return;

  var targetRow = 0;
  var labelByKey = getSeguimientoLabelByKeyMap();
  var keyByLabel = getSeguimientoKeyByLabelMap();
  var localEditable = getSeguimientoEditableLocalKeys();
  var trackingIdLabel = labelByKey["ID_CLIENTE"];
  var trackingTokenLabel = labelByKey["TOKEN"];
  var trackingLastRow = trackingSheet.getLastRow();
  var existingRow = null;

  if (trackingLastRow > 1) {
    var trackingData = trackingSheet.getRange(2, 1, trackingLastRow - 1, trackingSheet.getLastColumn()).getValues();
    for (var i = 0; i < trackingData.length; i++) {
      var trackId = trackingHeaders[trackingIdLabel] ? trackingData[i][trackingHeaders[trackingIdLabel] - 1] : "";
      var trackToken = trackingHeaders[trackingTokenLabel] ? trackingData[i][trackingHeaders[trackingTokenLabel] - 1] : "";
      if ((idCliente && trackId === idCliente) || (token && trackToken === token)) {
        targetRow = i + 2;
        existingRow = trackingData[i];
        break;
      }
    }
  }
  if (!targetRow) targetRow = trackingSheet.getLastRow() + 1;

  var orderedHeaders = trackingSheet.getRange(1, 1, 1, trackingSheet.getLastColumn()).getValues()[0];
  var values = [];
  for (var j = 0; j < orderedHeaders.length; j++) {
    var label = orderedHeaders[j];
    var key = keyByLabel[label] || label;
    var currentValue = existingRow && trackingHeaders[label] ? existingRow[trackingHeaders[label] - 1] : "";

    if (key === "LINK_ENCUESTA") {
      values.push(construirTextoBotonEncuesta());
    } else if (key === "ENVIAR WPP") {
      values.push(construirTextoBotonWhatsApp(rowValues[baseHeaders["Nombre y Apellido"] - 1]));
    } else if (localEditable[key]) {
      values.push(currentValue || getSeguimientoDefaultValue(key));
    } else if (baseHeaders[key]) {
      values.push(rowValues[baseHeaders[key] - 1]);
    } else {
      values.push(currentValue || getSeguimientoDefaultValue(key));
    }
  }

  trackingSheet.getRange(targetRow, 1, 1, values.length).setValues([values]);

  var encuestaLabel = labelByKey["LINK_ENCUESTA"];
  if (trackingHeaders[encuestaLabel] && baseHeaders["LINK_ENCUESTA"]) {
    var encuestaRichText = baseSheet.getRange(rowIndex, baseHeaders["LINK_ENCUESTA"]).getRichTextValue();
    if (encuestaRichText && encuestaRichText.getLinkUrl()) {
      trackingSheet.getRange(targetRow, trackingHeaders[encuestaLabel]).setRichTextValue(encuestaRichText);
    }
  }

  var wppLabel = labelByKey["ENVIAR WPP"];
  if (trackingHeaders[wppLabel] && baseHeaders["ENVIAR WPP"]) {
    var richText = baseSheet.getRange(rowIndex, baseHeaders["ENVIAR WPP"]).getRichTextValue();
    if (richText && richText.getLinkUrl()) {
      trackingSheet.getRange(targetRow, trackingHeaders[wppLabel]).setRichTextValue(richText);
    }
  }
}

function sincronizarSeguimientoCC() {
  var baseSheet = getSheet("Base_Clientes");
  if (baseSheet.getLastRow() < 2) return "No hay clientes para sincronizar.";
  for (var row = 2; row <= baseSheet.getLastRow(); row++) {
    upsertSeguimientoCCDesdeBase(row);
  }
  formatearSeguimientoCC();
  return "Seguimiento_CC sincronizado correctamente.";
}

function formatearSeguimientoCC() {
  var sheet = getSheet("Seguimiento_CC");
  if (sheet.getLastColumn() === 0) return;

  var headerMap = getHeaderMap(sheet);
  var labels = getSeguimientoLabelByKeyMap();
  var lastRow = Math.max(sheet.getLastRow(), 1);
  var lastColumn = sheet.getLastColumn();

  sheet.setFrozenRows(1);
  sheet.setTabColor("#0f766e");
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(1, 1, lastRow, lastColumn).createFilter();

  var fullRange = sheet.getRange(1, 1, lastRow, lastColumn);
  fullRange.setFontFamily("Arial");
  fullRange.setBorder(false, false, false, false, false, false);

  sheet.getRange(1, 1, 1, lastColumn)
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#0f766e")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sheet.setRowHeight(1, 36);
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastColumn)
      .setFontColor("#111827")
      .setBackground("#ffffff")
      .setFontWeight("normal")
      .setVerticalAlignment("middle")
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  }

  var widths = {};
  widths[labels["ENVIAR WPP"]] = 170;
  widths[labels["Nombre y Apellido"]] = 220;
  widths[labels["Celular"]] = 115;
  widths[labels["LINK_ENCUESTA"]] = 110;
  widths[labels["CANAL_SCORING"]] = 95;
  widths[labels["ESTADO_GESTION"]] = 135;
  widths[labels["PROXIMA_ACCION"]] = 135;
  widths[labels["ESTADO_ENVIO_WPP"]] = 120;
  widths[labels["ESTADO_ENCUESTA"]] = 125;
  widths[labels["RESPONDIO_CLIENTE"]] = 90;
  widths[labels["RESULTADO_SCORING"]] = 125;
  widths[labels["MOTIVO_RESULTADO"]] = 330;
  widths[labels["REQUIERE_RECONTACTO"]] = 95;
  widths[labels["OBS_CC"]] = 240;
  widths[labels["OPERADOR_CC"]] = 120;
  widths[labels["ESTADO_FINAL_CC"]] = 130;
  widths[labels["AREA_A_REVISAR"]] = 135;
  widths[labels["OBSERVACION_INTERNA"]] = 260;
  widths[labels["Nombre del Asesor"]] = 140;
  widths[labels["FECHA_ULTIMO_ENVIO_WPP"]] = 110;
  widths[labels["ULTIMO_CONTACTO_CC"]] = 110;
  widths[labels["CANTIDAD_INTENTOS_WPP"]] = 80;
  widths[labels["ID_CLIENTE"]] = 95;
  widths[labels["TOKEN"]] = 120;

  var columns = getSeguimientoColumns();
  for (var c = 0; c < columns.length; c++) {
    if (columns[c].key.indexOf("CALL_Q") === 0) widths[columns[c].label] = 170;
  }

  for (var key in widths) {
    if (headerMap[key]) sheet.setColumnWidth(headerMap[key], widths[key]);
  }

  var centerColumns = [
    labels["ENVIAR WPP"], labels["LINK_ENCUESTA"], labels["CANAL_SCORING"], labels["ESTADO_GESTION"], labels["PROXIMA_ACCION"], labels["ESTADO_ENVIO_WPP"],
    labels["ESTADO_ENCUESTA"], labels["RESPONDIO_CLIENTE"], labels["RESULTADO_SCORING"], labels["REQUIERE_RECONTACTO"], labels["ESTADO_FINAL_CC"],
    labels["FECHA_ULTIMO_ENVIO_WPP"], labels["ULTIMO_CONTACTO_CC"], labels["CANTIDAD_INTENTOS_WPP"], labels["ID_CLIENTE"]
  ];

  for (var i = 0; i < centerColumns.length; i++) {
    var col = headerMap[centerColumns[i]];
    if (col && lastRow > 1) sheet.getRange(2, col, lastRow - 1, 1).setHorizontalAlignment("center");
  }

  var paintColumn = function(key, color) {
    var label = labels[key];
    var col = headerMap[label];
    if (col && lastRow > 1) sheet.getRange(2, col, lastRow - 1, 1).setBackground(color);
  };

  paintColumn("ENVIAR WPP", "#eff6ff");
  paintColumn("LINK_ENCUESTA", "#eff6ff");
  paintColumn("CANAL_SCORING", "#ecfeff");
  paintColumn("ESTADO_GESTION", "#ecfeff");
  paintColumn("PROXIMA_ACCION", "#ecfeff");
  paintColumn("RESULTADO_SCORING", "#fefce8");
  paintColumn("MOTIVO_RESULTADO", "#fefce8");
  paintColumn("OBS_CC", "#fff7ed");

  for (var q = 0; q < columns.length; q++) {
    if (columns[q].key.indexOf("CALL_Q") === 0 && headerMap[columns[q].label] && lastRow > 1) {
      sheet.getRange(2, headerMap[columns[q].label], lastRow - 1, 1).setBackground("#f8fafc");
    }
  }

  if (headerMap[labels["TOKEN"]]) sheet.hideColumns(headerMap[labels["TOKEN"]]);
  if (headerMap[labels["ID_CLIENTE"]]) sheet.hideColumns(headerMap[labels["ID_CLIENTE"]]);

  if (lastRow > 1 && headerMap[labels["ESTADO_FINAL_CC"]]) {
    var estadoCol = headerMap[labels["ESTADO_FINAL_CC"]];
    var estados = sheet.getRange(2, estadoCol, lastRow - 1, 1).getValues();
    var backgrounds = [];
    for (var r = 0; r < estados.length; r++) {
      var estado = (estados[r][0] || "").toString();
      var color = "#ffffff";
      if (estado === "Paso scoring") color = "#dcfce7";
      else if (estado === "Requiere recontacto") color = "#fef3c7";
      else if (estado === "Requiere revision") color = "#fde68a";
      else if (estado === "No paso scoring") color = "#fee2e2";
      else if (estado === "Pendiente") color = "#e5e7eb";
      backgrounds.push([color]);
    }
    sheet.getRange(2, estadoCol, backgrounds.length, 1).setBackgrounds(backgrounds);
  }

  if (lastRow > 1) {
    if (headerMap[labels["CANAL_SCORING"]]) {
      var ruleCanal = SpreadsheetApp.newDataValidation().requireValueInList(["WhatsApp", "Llamada", "Hibrido"], true).setAllowInvalid(true).build();
      sheet.getRange(2, headerMap[labels["CANAL_SCORING"]], lastRow - 1, 1).setDataValidation(ruleCanal);
    }
    if (headerMap[labels["ESTADO_GESTION"]]) {
      var ruleEstado = SpreadsheetApp.newDataValidation().requireValueInList(["Nuevo", "Pendiente contacto", "En gestion", "Llamada completa", "Scoring cerrado"], true).setAllowInvalid(true).build();
      sheet.getRange(2, headerMap[labels["ESTADO_GESTION"]], lastRow - 1, 1).setDataValidation(ruleEstado);
    }
    if (headerMap[labels["PROXIMA_ACCION"]]) {
      var ruleAccion = SpreadsheetApp.newDataValidation().requireValueInList(["Enviar WPP", "Esperar respuesta", "Llamar", "Aplicar scoring", "Recontactar", "Cerrado"], true).setAllowInvalid(true).build();
      sheet.getRange(2, headerMap[labels["PROXIMA_ACCION"]], lastRow - 1, 1).setDataValidation(ruleAccion);
    }
  }

  try {
    sheet.getBandings().forEach(function(band) { band.remove(); });
  } catch (e) {}
}

function actualizarCatalogoPreguntas() {
  var headers = ["Codigo", "Bloque", "Orden", "Pregunta", "Tipo", "Opciones", "Obligatoria", "Condicion", "Columna_respuesta", "Activa"];
  ensureHeadersPresent("Preguntas", headers);

  var sheet = getSheet("Preguntas");
  var rows = [
    ["Q1", "Plan", 1, "Le informaron que accedio a un plan de ahorro con porcentaje financiado del vehiculo. Lo sabia?", "Seleccion", "Si | No | No estoy seguro/a", "Si", "", "q1", "Si"],
    ["Q2", "Plan", 2, "Le informaron que puede licitar a partir de la cuota 2 con el porcentaje indicado?", "Seleccion", "Si | No | No recuerda", "Si", "", "q2", "Si"],
    ["Q3", "Plan", 3, "Le informaron si tiene adjudicacion asegurada y en que cuota?", "Seleccion", "Si | No | No recuerda", "Si", "", "q3", "Si"],
    ["Q4", "Plan", 4, "Su asesor le explico la diferencia entre licitar y adjudicar?", "Seleccion", "Si | No | Parcialmente", "Si", "", "q4", "Si"],
    ["Q5", "Plan", 5, "Le informaron el monto estimado de la cuota 2? Cuanto le dijeron?", "Texto", "", "Si", "", "q5", "Si"],
    ["Q6", "Pagos", 6, "Cuanto pago en la primera cuota y por que medio la pago?", "Texto", "", "Si", "", "q6", "Si"],
    ["Q7", "Pagos", 7, "Cuando pago la primera cuota?", "Texto", "", "No", "", "q7", "Si"],
    ["Q8", "Pagos", 8, "Como seguira pagando su plan?", "Texto", "", "No", "", "q8", "Si"],
    ["Q8B", "Pagos", 9, "Si sigue por debito automatico: firmo el anexo y sabe que esta en el contrato?", "Seleccion", "Si | No | No corresponde", "No", "Solo si el medio es debito automatico", "q8b", "Si"],
    ["Q8C", "Pagos", 10, "Si sigue por debito automatico: entendio como funciona y la permanencia minima?", "Seleccion", "Si | No | No corresponde", "No", "Solo si el medio es debito automatico", "q8c", "Si"],
    ["Q9", "Vendedor", 11, "Quien es su vendedor o asesor?", "Texto", "", "Si", "", "q9", "Si"],
    ["Q10", "Vendedor", 12, "Como califica del 1 al 5 la atencion del vendedor?", "Seleccion", "1 | 2 | 3 | 4 | 5", "Si", "", "q10", "Si"],
    ["Q11", "Vendedor", 13, "El vendedor supo explicar caracteristicas especificas de la unidad?", "Seleccion", "Si | No | Parcialmente | No corresponde / no recuerda", "Si", "", "q11", "Si"],
    ["Q12", "Historial", 14, "Estuvo pagando otro plan de ahorro recientemente? De que marca y hasta que mes?", "Texto", "", "Si", "", "q12", "Si"],
    ["Q13", "Usado", 15, "Tiene un vehiculo usado para entregar como parte de pago?", "Seleccion", "Si | No | Aun no sabe", "Si", "", "q13", "Si"],
    ["Q13A", "Usado", 16, "Si tiene usado, cual es el vehiculo?", "Texto", "", "No", "Solo si en Q13 responde Si", "q13a", "Si"],
    ["Q14", "Origen", 17, "Como conocio la propuesta?", "Seleccion", "Redes sociales | Referido | Asesor / vendedor | Local comercial | WhatsApp | Web | Otro", "Si", "", "q14", "Si"],
    ["Q15", "Beneficios", 18, "Recibio algun beneficio o regalo por haberse suscripto?", "Seleccion", "Si | No | Se lo prometieron pero no lo recibio | No recuerda", "Si", "", "q15", "Si"],
    ["Q15A", "Beneficios", 19, "Si hubo beneficio o regalo, cual fue?", "Texto", "", "No", "Solo si en Q15 responde Si o beneficio prometido no entregado", "beneficioDetalle", "Si"],
    ["Q16", "Cierre", 20, "Desea agregar alguna observacion adicional?", "Texto", "", "No", "", "q16", "Si"],
    ["Q17", "Cierre", 21, "Necesita que un asesor vuelva a contactarlo?", "Seleccion", "Si | No", "Si", "", "q17", "Si"]
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#dbeafe").setFontColor("#1e3a8a");
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 80);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 60);
  sheet.setColumnWidth(4, 420);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 330);
  sheet.setColumnWidth(7, 90);
  sheet.setColumnWidth(8, 260);
  sheet.setColumnWidth(9, 140);
  sheet.setColumnWidth(10, 70);
  sheet.getRange(2, 1, rows.length, headers.length).setWrap(true).setVerticalAlignment("middle");
}

function actualizarInstructivoCC() {
  var sheet = getSheet("Instructivo_CC");
  sheet.clear();
  sheet.getRange("A1").setValue("Instructivo Operativo - Encuestas Autosol");
  sheet.getRange("A1").setFontSize(16).setFontWeight("bold").setFontColor("#0f766e");
  sheet.getRange("A2").setValue("Flujo simple para Contact Center");
  sheet.getRange("A2").setFontWeight("bold").setFontColor("#334155");

  var rows = [
    ["Base tecnica", "Base_Clientes guarda el maestro de datos y Recepcion puede seguir alimentandola."],
    ["Base operativa", "Seguimiento_CC es la unica hoja de trabajo diario para Contact Center."],
    ["Preguntas", "La hoja Preguntas contiene el guion editable de llamada y la estructura de la encuesta."],
    ["Paso 1", "Cuando entren clientes nuevos en Base_Clientes, hacer clic en Menu > Encuestas Autosol > Actualizar nuevos clientes."],
    ["Paso 2", "Cada cliente nuevo aparece en Seguimiento_CC con boton de WhatsApp, boton de encuesta y estado inicial."],
    ["Paso 3", "Si el caso va por encuesta web, dejar Canal = WhatsApp y usar el boton Enviar mensaje."],
    ["Paso 4", "Si el caso va por llamada, cambiar Canal a Llamada o Hibrido y completar en esa misma fila las columnas Llamada Q1 a Llamada Q17."],
    ["Paso 5", "Cuando la llamada termina, poner Estado gestion = Llamada completa o Proxima accion = Aplicar scoring."],
    ["Paso 6", "Luego hacer clic en Menu > Encuestas Autosol > Aplicar scoring de llamada."],
    ["Resultado", "El sistema escribe Resultado, Motivo / detalle, Recontacto y Estado final tanto en Seguimiento_CC como en Base_Clientes."],
    ["Lectura rapida", "Motivo / detalle deja marcado el numero de pregunta y la respuesta que genero la observacion para facilitar el recontacto."],
    ["Orden diario", "Usar los filtros de Canal, Estado gestion y Proxima accion para separar pendientes, llamadas y cerrados."],
    ["Criterio recomendado", "Usar Base_Clientes como hoja tecnica y Seguimiento_CC como mesa operativa. Asi el equipo no se pierde entre hojas."]
  ];

  sheet.getRange(4, 1, rows.length, 2).setValues(rows);
  sheet.getRange(4, 1, rows.length, 1).setFontWeight("bold").setFontColor("#111827");
  sheet.getRange(4, 2, rows.length, 1).setWrap(true).setFontColor("#1f2937");
  sheet.setColumnWidth(1, 190);
  sheet.setColumnWidth(2, 820);
  sheet.setFrozenRows(3);
  try {
    sheet.getBandings().forEach(function(band) { band.remove(); });
  } catch (e) {}
  sheet.getRange("A4:B" + (rows.length + 3)).applyRowBanding(SpreadsheetApp.BandingTheme.TEAL, true, false);
}

function obtenerListaVendedores() {
  try {
    var sheet = getSheet("Vendedores");
    var values = sheet.getDataRange().getValues();
    var lista = [];
    for (var i = 1; i < values.length; i++) {
      var nombre = values[i][0];
      if (nombre && nombre.toString().trim() !== "") lista.push(nombre.toString().trim());
    }
    if (lista.length === 0) {
      lista = [
        "ARIADNA PETRUCIOLI",
        "BRIAN DOUTHAT",
        "EMILSE DIAZ",
        "GASTON BASTOS",
        "HORACIO ZELAYA",
        "JOSE SALUZZO",
        "RODRIGO VILLAFAÑE",
        "VANESA ZAMBRANO"
      ];
    }
    lista.sort();
    return lista;
  } catch (e) {
    return [
      "ARIADNA PETRUCIOLI",
      "BRIAN DOUTHAT",
      "EMILSE DIAZ",
      "GASTON BASTOS",
      "HORACIO ZELAYA",
      "JOSE SALUZZO",
      "RODRIGO VILLAFAÑE",
      "VANESA ZAMBRANO"
    ];
  }
}
