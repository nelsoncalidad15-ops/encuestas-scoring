/**
 * Google Apps Script - Code.gs
 * Backend de Base de Datos Privada en Google Sheets
 * 
 * Este archivo se instala como un Web App en Google Apps Script
 * vinculado a un archivo de Google Sheets privado de Autosol.
 */

// Constantes Configurables
var NOMBRE_CONTACT = "Abigail Wierna";

/**
 * Recibe peticiones POST seguras desde Netlify Functions
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var backendSecret = payload.backendSecret;
    
    // 1. Validar BACKEND_SECRET
    var correctSecret = PropertiesService.getScriptProperties().getProperty("BACKEND_SECRET");
    if (!correctSecret || backendSecret !== correctSecret) {
      return jsonResponse({ status: "ERROR", message: "No autorizado. Credenciales de backend incorrectas." });
    }
    
    // 2. Procesar acciones
    if (action === "validarCliente") {
      return validarCliente(payload.token, payload.dni);
    } else if (action === "guardarEncuesta") {
      return guardarEncuesta(payload.token, payload.dni, payload.respuestas);
    } else {
      return jsonResponse({ status: "ERROR", message: "Acción no reconocida." });
    }
    
  } catch (err) {
    registrarLog("SYSTEM", "", "ERROR", err.toString(), "Apps Script - doPost");
    return jsonResponse({ status: "ERROR", message: "Excepción en servidor: " + err.toString() });
  }
}

/**
 * Inicialización inicial de hojas y estructura de columnas
 */
function setupInicial() {
  ensureSheets();
  ensureHeaders();
}

/**
 * Normaliza y limpia un DNI (solo dígitos)
 */
function normalizarDni(dni) {
  if (!dni) return "";
  return dni.toString().replace(/\D/g, "");
}

/**
 * Genera un hash HMAC SHA-256 seguro usando DNI_SALT
 */
function generarHash(valor) {
  var salt = PropertiesService.getScriptProperties().getProperty("DNI_SALT");
  if (!salt) {
    throw new Error("Falta configurar DNI_SALT en Script Properties.");
  }
  var rawHash = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, normalizarDni(valor), salt);
  var hash = "";
  for (var i = 0; i < rawHash.length; i++) {
    var byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    var byteString = byteVal.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    hash += byteString;
  }
  return hash;
}

/**
 * Función pública para generar hash de DNI para cargas manuales en las planillas
 */
function generarHashDniParaCarga(dni) {
  return generarHash(dni);
}

/**
 * Busca un cliente por su TOKEN único en la Base_Clientes
 */
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

/**
 * Valida TOKEN + DNI_HASH del cliente
 */
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
    registrarLog(token, dniHashInput, "YA_RESPONDIO", "El cliente ya había completado la encuesta anteriormente", "validarCliente");
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
    medioPagoPrevisto: rowValues[headerMap["¿Cómo seguirá pagando su plan?"] - 1]
  };
  
  var listaVendedores = obtenerListaVendedores();
  
  registrarLog(token, dniHashInput, "OK", "Cliente validado e ingresado a la encuesta", "validarCliente");
  return jsonResponse({
    status: "OK",
    cliente: clienteSeguro,
    vendedores: listaVendedores
  });
}

/**
 * Guarda respuestas, calcula scoring y actualiza la base de clientes
 */
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
  
  return jsonResponse({
    status: "OK",
    scoringResult: scoring.resultado
  });
}

/**
 * Inserta respuestas en la hoja Respuestas_Scoring
 */
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

/**
 * Actualiza la fila de un cliente en Base_Clientes con su resultado
 */
function actualizarBaseCliente(rowIndex, scoring) {
  var sheet = getSheet("Base_Clientes");
  var headerMap = getHeaderMap(sheet);
  var fechaActual = new Date();
  
  sheet.getRange(rowIndex, headerMap["ESTADO_ENCUESTA"]).setValue("Respondido");
  sheet.getRange(rowIndex, headerMap["FECHA_RESPUESTA_WEB"]).setValue(fechaActual);
  sheet.getRange(rowIndex, headerMap["Fecha realización scoring"]).setValue(fechaActual);
  sheet.getRange(rowIndex, headerMap["RESULTADO_SCORING"]).setValue(scoring.resultado);
  sheet.getRange(rowIndex, headerMap["MOTIVO_RESULTADO"]).setValue(scoring.motivo);
  sheet.getRange(rowIndex, headerMap["REQUIERE_RECONTACTO"]).setValue(scoring.requiereRecontacto);
  sheet.getRange(rowIndex, headerMap["AREA_A_REVISAR"]).setValue(scoring.area);
  sheet.getRange(rowIndex, headerMap["OBSERVACION_INTERNA"]).setValue(scoring.observacion);
}

/**
 * Motor de Scoring Automático (Reglas Corporativas de Autosol)
 */
function calcularScoring(respuestas) {
  var resultado = "Pasó scoring";
  var motivo = "Validación conforme.";
  var requiereRecontacto = "No";
  var area = "Sin revisión";
  var observacion = respuestas.q16 || "";
  
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
  
  var contienePalabrasClaveNegativas = function(texto) {
    if (!texto) return false;
    var keywords = ["reclamo", "problema", "no me explicaron", "nadie me llamó", "disconforme", "mentira", "engaño", "no entiendo", "duda", "molestia"];
    var lower = texto.toLowerCase();
    for (var i = 0; i < keywords.length; i++) {
      if (lower.indexOf(keywords[i]) !== -1) return true;
    }
    return false;
  };
  
  var contieneDudasPago = function(texto) {
    if (!texto) return false;
    var keywords = ["duda", "no sé", "no se", "mal cobrado", "error", "diferente", "mas", "más", "menos"];
    var lower = texto.toLowerCase();
    for (var i = 0; i < keywords.length; i++) {
      if (lower.indexOf(keywords[i]) !== -1) return true;
    }
    return false;
  };
  
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
    resultado = "Requiere revisión";
    area = "Asesor comercial";
    motivo = "Alertas de revisión comercial (baja calificación o dudas menores).";
    
    if (q13 === "Sí") {
      area = "Entrega / usado";
      motivo = "Cliente indica entrega de vehículo usado.";
    }
    if (q2 === "No recuerdo" || q3 === "No recuerdo" || q5 === "No recuerdo") {
      area = "Asesor comercial";
      motivo = "El cliente no recuerda explicaciones fundamentales sobre su plan.";
    }
  }
  
  if (
    q17 === "Sí" ||
    q8c === "No" || q8c === "Parcialmente" ||
    contienePalabrasClaveNegativas(q16) ||
    contieneDudasPago(q6)
  ) {
    resultado = "Requiere recontacto";
    requiereRecontacto = "Sí";
    area = q17 === "Sí" ? "Contact Center" : "Gestión de pagos";
    motivo = "Cliente solicita contacto directo o tiene dudas sobre sus pagos/débito.";
    
    if (contienePalabrasClaveNegativas(q16)) {
      motivo = "Detección de palabras clave críticas en observaciones.";
    }
  }
  
  if (
    q1 === "No" ||
    q2 === "No" ||
    q3 === "No" ||
    q4 === "No" ||
    q5 === "No" ||
    (!q9 || q9.toLowerCase().indexOf("vacio") !== -1 || q9.toLowerCase().indexOf("no se") !== -1 || q9.trim() === "") ||
    q15 === "Se lo prometieron pero no lo recibió"
  ) {
    resultado = "No pasó scoring";
    area = "Administración Plan de Ahorro";
    motivo = "Incumplimiento de pautas obligatorias de información del plan.";
    
    if (!q9 || q9.trim() === "") {
      motivo = "Cliente no identifica el nombre del vendedor.";
      area = "Asesor comercial";
    }
    if (q15 === "Se lo prometieron pero no lo recibió") {
      motivo = "El cliente declara beneficio prometido no entregado.";
    }
  }
  
  return {
    resultado: resultado,
    motivo: motivo,
    requiereRecontacto: requiereRecontacto,
    area: area,
    observacion: observacion
  };
}

function generarLinks() {
  var sheet = getSheet("Base_Clientes");
  var headerMap = getHeaderMap(sheet);
  var data = sheet.getDataRange().getValues();
  
  var count = 0;
  var netlifyBaseUrl = PropertiesService.getScriptProperties().getProperty("NETLIFY_BASE_URL");
  if (!netlifyBaseUrl) {
    return "Error: NETLIFY_BASE_URL no está configurado en Script Properties.";
  }
  
  if (netlifyBaseUrl.slice(-1) !== "/") {
    netlifyBaseUrl += "/";
  }
  
  for (var i = 1; i < data.length; i++) {
    var nombre = data[i][headerMap["Nombre y Apellido"] - 1];
    var celular = data[i][headerMap["Celular"] - 1];
    var tokenExistente = data[i][headerMap["TOKEN"] - 1];
    
    if (nombre && celular && !tokenExistente) {
      var token = "T" + Utilities.getUuid().slice(0, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
      var link = netlifyBaseUrl + "?t=" + token;
      
      sheet.getRange(i + 1, headerMap["TOKEN"]).setValue(token);
      sheet.getRange(i + 1, headerMap["LINK_ENCUESTA"]).setValue(link);
      sheet.getRange(i + 1, headerMap["ESTADO_ENCUESTA"]).setValue("Link generado");
      sheet.getRange(i + 1, headerMap["FECHA_ENVIO_LINK"]).setValue(new Date());
      sheet.getRange(i + 1, headerMap["INTENTOS_INVALIDOS"]).setValue(0);
      
      count++;
    }
  }
  return "Se generaron " + count + " links correctamente.";
}

function generarMensajeWhatsApp() {
  var sheet = getSheet("Base_Clientes");
  var headerMap = getHeaderMap(sheet);
  var data = sheet.getDataRange().getValues();
  var count = 0;
  
  for (var i = 1; i < data.length; i++) {
    var nombre = data[i][headerMap["Nombre y Apellido"] - 1];
    var celular = data[i][headerMap["Celular"] - 1];
    var linkEncuesta = data[i][headerMap["LINK_ENCUESTA"] - 1];
    var enviarWppExistente = data[i][headerMap["ENVIAR WPP"] - 1];
    
    if (nombre && celular && linkEncuesta && !enviarWppExistente) {
      var cellClean = celular.toString().replace(/\D/g, "");
      if (cellClean.length === 10) {
        cellClean = "549" + cellClean;
      }
      
      var mensajeText = "Hola, Sr./Sra. " + nombre + ". Mi nombre es " + NOMBRE_CONTACT + ", me comunico desde Autosol.\n\n" +
        "Le compartimos el link para realizar la validación de su suscripción al Plan de Ahorro:\n\n" +
        linkEncuesta + "\n\n" +
        "La encuesta es breve y nos permite confirmar que la información de su plan fue correctamente explicada y registrada. Para ingresar, deberá colocar su DNI únicamente como validación de identidad.\n\n" +
        "Muchas gracias. Saludos cordiales.";
        
      var waLink = "https://wa.me/" + cellClean + "?text=" + encodeURIComponent(mensajeText);
      sheet.getRange(i + 1, headerMap["ENVIAR WPP"]).setValue(waLink);
      count++;
    }
  }
  return "Se compilaron " + count + " links de WhatsApp.";
}

function registrarLog(token, dniHash, resultado, detalle, origen) {
  try {
    var sheet = getSheet("Log_Seguridad");
    sheet.appendRow([
      new Date(),
      token || "N/A",
      dniHash || "N/A",
      resultado,
      detalle,
      origen || "Backend"
    ]);
  } catch (err) {
    Logger.log("Error al escribir log de seguridad: " + err.toString());
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function getHeaderMap(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  var headers = headerRange.getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    if (headers[i]) {
      map[headers[i].toString().trim()] = i + 1;
    }
  }
  return map;
}

function ensureSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var required = ["Base_Clientes", "Respuestas_Scoring", "Preguntas", "Log_Seguridad", "Dashboard", "Vendedores"];
  for (var i = 0; i < required.length; i++) {
    var sheet = ss.getSheetByName(required[i]);
    if (!sheet) {
      ss.insertSheet(required[i]);
    }
  }
}

function ensureHeaders() {
  var headersBase = [
    "Mes", "Nº", "fecha de carga de planilla", "Nro de solicitud", "Nombre y Apellido", 
    "Celular", "Mail", "Modelo suscripto/falta plan", "Nombre del Asesor", "Monto 2da cuota (aprox)", 
    "¿Cómo seguirá pagando su plan?", "Obsevaciones", "ID_CLIENTE", "Modelo detectado", "Porcentaje financiado", 
    "Porcentaje licitación", "Adjudicación asegurada", "Cuotas adjudicación", "Beneficio detectado", 
    "Nombre persona contactada", "Estado contacto", "Gestionado por Asesor CC", "Fecha 1er llamado", 
    "Fecha 2do llamado", "Fecha 3er llamado", "Fecha realización scoring", "TOKEN", "DNI_HASH", 
    "LINK_ENCUESTA", "ENVIAR WPP", "ESTADO_ENCUESTA", "FECHA_ENVIO_LINK", "FECHA_RESPUESTA_WEB", 
    "RESULTADO_SCORING", "MOTIVO_RESULTADO", "REQUIERE_RECONTACTO", "AREA_A_REVISAR", "OBSERVACION_INTERNA", 
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

  var headersPreguntas = [
    "Codigo", "Bloque", "Orden", "Pregunta", "Tipo", "Opciones", "Obligatoria", "Condicion", "Columna_respuesta", "Activa"
  ];

  var headersLogs = [
    "Fecha", "Token", "DNI_HASH", "Resultado", "Detalle", "Origen"
  ];

  var headersDashboard = [
    "Indicador", "Valor", "Observación"
  ];

  writeHeadersIfEmpty("Base_Clientes", headersBase);
  writeHeadersIfEmpty("Respuestas_Scoring", headersScoring);
  writeHeadersIfEmpty("Preguntas", headersPreguntas);
  writeHeadersIfEmpty("Log_Seguridad", headersLogs);
  writeHeadersIfEmpty("Dashboard", headersDashboard);

  var headersVendedores = ["Nombre del Vendedor"];
  writeHeadersIfEmpty("Vendedores", headersVendedores);

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

function writeHeadersIfEmpty(sheetName, headers) {
  var sheet = getSheet(sheetName);
  var values = sheet.getDataRange().getValues();
  if (sheet.getLastRow() === 0 || (sheet.getLastRow() === 1 && values[0][0] === "")) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#eef2f7");
    sheet.setFrozenRows(1);
  }
}

function obtenerListaVendedores() {
  try {
    var sheet = getSheet("Vendedores");
    var values = sheet.getDataRange().getValues();
    var lista = [];
    for (var i = 1; i < values.length; i++) {
      var nombre = values[i][0];
      if (nombre && nombre.toString().trim() !== "") {
        lista.push(nombre.toString().trim());
      }
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
