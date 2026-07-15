/**
 * Autosol Subscription Validator - app.js
 */

let urlToken = "";
let isDemoMode = false;
let validatedDni = "";
let clientData = null;
let currentStep = 2;
let isSubmitting = false;
const totalSteps = 5;

const viewInitialCheck = document.getElementById("view-initial-check");
const viewTokenError = document.getElementById("view-token-error");
const viewStepValidation = document.getElementById("view-step-validation");
const viewLoadingOverlay = document.getElementById("view-loading-overlay");
const loadingOverlayText = document.getElementById("loading-overlay-text");
const surveyQuestionsContainer = document.getElementById("survey-questions-container");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");
const stepTitle = document.getElementById("step-title");
const stepCounter = document.getElementById("step-counter");
const viewSuccess = document.getElementById("view-success");
const successIconWrap = document.getElementById("success-icon-wrap");
const successIcon = document.getElementById("success-icon");
const successTitle = document.getElementById("success-title");
const successDescription = document.getElementById("success-description");
const successPendingNote = document.getElementById("success-pending-note");
const successList = document.getElementById("success-list");
const errorToast = document.getElementById("error-toast");
const errorToastMessage = document.getElementById("error-toast-message");

const panels = {
  2: document.getElementById("step-panel-2"),
  3: document.getElementById("step-panel-3"),
  4: document.getElementById("step-panel-4"),
  5: document.getElementById("step-panel-5"),
};

const btnNavPrev = document.getElementById("btn-nav-prev");
const btnNavNext = document.getElementById("btn-nav-next");
const btnNextText = document.getElementById("btn-next-text");
const btnValidateSubmit = document.getElementById("btn-validate-submit");

const stepTitles = {
  2: "Informacion del plan",
  3: "Cuotas y debito",
  4: "Vendedor y origen",
  5: "Cierre",
};

window.addEventListener("beforeunload", (event) => {
  if (!isSubmitting) return;
  event.preventDefault();
  event.returnValue = "";
});

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  urlToken = params.get("t") || "";
  isDemoMode = params.get("demo") === "1" || params.get("prueba") === "1" || (params.get("modo") || "").toLowerCase() === "prueba";

  refreshIcons();

  bindInteractiveFields();
  prewarmValidationBackend();

  window.requestAnimationFrame(() => {
    hideElement(viewInitialCheck);
    if (isDemoMode) {
      startDemoMode();
      return;
    }
    if (!urlToken) {
      showElement(viewTokenError);
      document.getElementById("token-error-title").textContent = "Link incompleto";
      document.getElementById("token-error-desc").textContent = "El enlace de validacion no contiene un identificador unico de cliente. Si solo quiere probar la encuesta, use ?demo=1.";
    } else {
      showElement(viewStepValidation);
      const dniInput = document.getElementById("input-dni");
      if (dniInput) dniInput.focus();
    }
  });
});

function bindInteractiveFields() {
  document.querySelectorAll('input[name="q7"]').forEach((input) => {
    input.addEventListener("change", () => toggleOtherPlanField(input.value === "Si"));
  });
  document.querySelectorAll('input[name="q9"]').forEach((input) => {
    input.addEventListener("change", () => toggleObservationsRequired(input.value === "Si"));
  });
}

function showElement(el) {
  if (el) el.classList.remove("hidden");
}

function hideElement(el) {
  if (el) el.classList.add("hidden");
}

function showToast(message) {
  errorToastMessage.textContent = message;
  errorToast.classList.remove("hidden");
  errorToast.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideToast() {
  errorToast.classList.add("hidden");
}

function setButtonLoading(button, active, label) {
  if (!button) return;
  button.disabled = active;
  button.classList.toggle("opacity-70", active);
  button.classList.toggle("cursor-not-allowed", active);
  if (label && button.tagName === "BUTTON") {
    if (button === btnNavNext && btnNextText) btnNextText.textContent = label;
    else button.textContent = label;
  }
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function setSubmittingState(active) {
  isSubmitting = active;
}

function setSuccessState(mode) {
  const states = {
    pending: {
      wrapClass: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-700",
      icon: "loader-circle",
      title: "Estamos registrando su validacion",
      description: "Su encuesta ya fue enviada. Estamos guardando la informacion de forma segura en nuestro sistema.",
      note: "No cierre esta ventana por unos segundos hasta que finalice el proceso.",
      items: [
        "El envio ya esta en proceso.",
        "En unos segundos vera la confirmacion final.",
        "Si solicito contacto, el equipo lo revisara al finalizar."
      ]
    },
    pendingConfirm: {
      wrapClass: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-700",
      icon: "clock-3",
      title: "Validacion enviada",
      description: "Recibimos su envio y estamos terminando de confirmarlo en nuestro sistema. Si la pagina tardo o su conexion fue inestable, no hace falta reenviar de inmediato.",
      note: "Espere unos segundos antes de volver a intentar.",
      items: [
        "La informacion ya fue enviada para registrarse.",
        "Si solicito contacto, el equipo lo revisara al finalizar.",
        "Solo reintente si luego confirma que no quedo registrada."
      ]
    },
    success: {
      wrapClass: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700",
      icon: "badge-check",
      title: "Validacion completada",
      description: "Su validacion fue registrada correctamente en nuestro sistema central. Agradecemos su tiempo para ayudarnos a mantener la transparencia y seguridad de su Plan de Ahorro Autosol.",
      note: "",
      items: [
        "Un asesor de Autosol auditara sus respuestas.",
        "Si corresponde, se revisara internamente la gestion comercial.",
        "Si solicito contacto, un asesor lo llamara a la brevedad."
      ]
    },
    alreadyDone: {
      wrapClass: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-700",
      icon: "shield-check",
      title: "Validacion ya realizada",
      description: "Esta validacion ya fue registrada anteriormente. Muchas gracias por su colaboracion.",
      note: "",
      items: [
        "No necesita volver a completar este formulario."
      ]
    },
    demo: {
      wrapClass: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700",
      icon: "flask-conical",
      title: "Modo prueba finalizado",
      description: "La encuesta se completo en modo prueba. No se valido identidad ni se guardaron respuestas.",
      note: "",
      items: [
        "Este recorrido sirvio solo para revisar la experiencia."
      ]
    }
  };

  const state = states[mode] || states.success;
  if (successIconWrap) successIconWrap.className = state.wrapClass;
  if (successIcon) successIcon.setAttribute("data-lucide", state.icon);
  if (successTitle) successTitle.textContent = state.title;
  if (successDescription) successDescription.textContent = state.description;
  if (successPendingNote) {
    successPendingNote.textContent = state.note || "";
    successPendingNote.classList.toggle("hidden", !state.note);
  }
  if (successList) {
    successList.innerHTML = state.items.map((item) => "<li>" + item + "</li>").join("");
  }
  refreshIcons();
}
function setLoadingMessageSequence(messages, intervalMs) {
  let index = 0;
  loadingOverlayText.textContent = messages[0] || "Procesando...";
  const timer = setInterval(() => {
    index += 1;
    if (index >= messages.length) {
      clearInterval(timer);
      return;
    }
    loadingOverlayText.textContent = messages[index];
  }, intervalMs || 1200);
  return () => clearInterval(timer);
}

function getValidationCacheKey(token, dni) {
  return `autosol-validacion-v2::${token || ""}::${dni || ""}`;
}

function readValidationCache(token, dni) {
  try {
    const raw = window.sessionStorage.getItem(getValidationCacheKey(token, dni));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.status === "OK" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function writeValidationCache(token, dni, payload) {
  try {
    window.sessionStorage.setItem(getValidationCacheKey(token, dni), JSON.stringify(payload));
  } catch (error) {
    console.warn("No se pudo guardar cache de validacion", error);
  }
}

function applyValidatedClient(data, dniVal) {
  validatedDni = dniVal;
  clientData = data.cliente;
  applyClientContext();
  applyQuestionConfig(data.preguntas);
  showElement(progressContainer);
  showElement(surveyQuestionsContainer);
  currentStep = 2;
  updateStepUI();
}

function applyClientContext() {
  document.getElementById("client-badge-name").textContent = clientData?.nombre || "-";
  document.getElementById("client-badge-model").textContent = clientData?.modelo || "-";
  document.getElementById("input-q6").value = clientData?.asesor || "";
  document.getElementById("input-q4a").placeholder = clientData?.montoCuota2 ? `Ej: $ ${clientData.montoCuota2}` : "Ej: $ 185000";
}

function setQuestionText(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

function setQuestionNote(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  const value = (text || "").trim();
  el.textContent = value;
  el.classList.toggle("hidden", !value);
}

function setRadioOptions(name, options) {
  if (!Array.isArray(options) || options.length === 0) return;
  const radios = Array.from(document.querySelectorAll(`input[name="${name}"]`));
  if (radios.length !== options.length) return;
  radios.forEach((radio, index) => {
    radio.value = options[index];
    const label = radio.closest("label");
    const span = label ? label.querySelector("span") : null;
    if (span) span.textContent = options[index];
  });
}

function applyQuestionConfig(preguntas) {
  const q3Block = document.getElementById("q3-block");
  if (!preguntas) {
    if (q3Block) q3Block.classList.remove("hidden");
    return;
  }
  const map = preguntas;
  const targets = {
    q1: "q1-text",
    q2: "q2-text",
    q3: "q3-text",
    q4: "q4-text",
    q4a: "q4a-label",
    q5: "q5-label",
    q5a: "q5a-text",
    q5b: "q5b-label",
    q6: "q6-label",
    q7: "q7-text",
    q7a: "q7a-label",
    q8: "q8-text",
    q9: "q9-text",
    q10: "q10-label",
  };

  Object.keys(targets).forEach((key) => {
    if (map[key]?.pregunta) setQuestionText(targets[key], map[key].pregunta);
    if (map[key]?.opciones?.length) setRadioOptions(key, map[key].opciones);
  });

  setQuestionNote("q2-note", map.q2?.observacion || "");
  if (q3Block) q3Block.classList.toggle("hidden", !map.q3);
}

function getBackendRoute(name) {
  const host = window.location.hostname;
  const isLocal = host === "127.0.0.1" || host === "localhost";
  return isLocal ? "/.netlify/functions/" + name : "/api/" + name;
}

function prewarmValidationBackend() {
  if (!urlToken) return;
  const route = getBackendRoute("prewarmValidacion");
  try {
    fetch(route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: urlToken }),
      keepalive: true,
    }).catch(() => {});
  } catch (error) {
    // Es solo una aceleracion silenciosa.
  }
}

function startDemoMode() {
  validatedDni = "00000000";
  clientData = {
    nombre: "Cliente de prueba",
    modelo: "Amarok demo",
    asesor: "Asesor demo",
    montoCuota2: "185000",
  };

  hideElement(viewTokenError);
  hideElement(viewStepValidation);
  applyClientContext();
  showElement(progressContainer);
  showElement(surveyQuestionsContainer);
  currentStep = 2;
  updateStepUI();
  showToast("Modo prueba activo. Esta encuesta no valida DNI ni guarda respuestas.");
}

async function validateDni(event) {
  event.preventDefault();
  hideToast();

  const dniVal = document.getElementById("input-dni").value.replace(/\D/g, "");
  if (dniVal.length < 7 || dniVal.length > 8) {
    showToast("El DNI debe tener entre 7 y 8 numeros.");
    return;
  }

  const cachedValidation = readValidationCache(urlToken, dniVal);
  if (cachedValidation) {
    hideElement(viewStepValidation);
    applyValidatedClient(cachedValidation, dniVal);
    return;
  }

  let overlayVisible = false;
  const overlayTimer = window.setTimeout(() => {
    overlayVisible = true;
    hideElement(viewStepValidation);
    showElement(viewLoadingOverlay);
  }, 450);

  setButtonLoading(btnValidateSubmit, true, "Validando...");
  const stopLoadingMessages = setLoadingMessageSequence([
    "Verificando identidad de forma segura...",
    "Buscando su validacion...",
    "Preparando su formulario..."
  ], 900);

  try {
    const response = await fetch(getBackendRoute("validarCliente"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: urlToken, dni: dniVal }),
    });

    const data = await response.json();
    window.clearTimeout(overlayTimer);
    stopLoadingMessages();
    if (overlayVisible) hideElement(viewLoadingOverlay);
    setButtonLoading(btnValidateSubmit, false, "Validar y continuar");

    if (data.status === "OK") {
      writeValidationCache(urlToken, dniVal, data);
      hideElement(viewStepValidation);
      applyValidatedClient(data, dniVal);
      return;
    }

    showElement(viewStepValidation);
    if (data.status === "DNI_INVALIDO") showToast("El DNI ingresado no coincide con el registrado para esta validacion.");
    else if (data.status === "TOKEN_INVALIDO") showToast("El enlace no es valido o se encuentra vencido.");
    else if (data.status === "YA_RESPONDIO") {
      hideElement(viewStepValidation);
      setSuccessState("alreadyDone");
      showElement(viewSuccess);
    } else showToast(data.message || "No pudimos validar su identidad en este momento.");
  } catch (error) {
    console.error(error);
    window.clearTimeout(overlayTimer);
    stopLoadingMessages();
    if (overlayVisible) hideElement(viewLoadingOverlay);
    setButtonLoading(btnValidateSubmit, false, "Validar y continuar");
    showElement(viewStepValidation);
    showToast("Error de conexion. Verifique su acceso a internet e intente nuevamente.");
  }
}

function updateStepUI() {
  Object.values(panels).forEach((panel) => hideElement(panel));
  showElement(panels[currentStep]);

  stepTitle.textContent = stepTitles[currentStep];
  stepCounter.textContent = `Paso ${currentStep - 1} de ${totalSteps - 1}`;
  progressBar.style.width = `${((currentStep - 2) / (totalSteps - 2)) * 100}%`;

  btnNavPrev.classList.toggle("hidden", currentStep === 2);
  btnNextText.textContent = currentStep === totalSteps ? "Enviar validacion" : "Continuar";
  document.getElementById("survey-card").scrollIntoView({ block: "start", behavior: "smooth" });
}

function navigateStep(direction) {
  hideToast();

  if (direction === 1) {
    if (!validateCurrentStep()) {
      showToast("Complete todas las preguntas obligatorias antes de continuar.");
      const invalidField = getStepFirstInvalidField();
      if (invalidField) scrollToField(invalidField);
      return;
    }
    if (currentStep === totalSteps) {
      submitSurvey();
      return;
    }
  }

  currentStep += direction;
  updateStepUI();
}

function getRadioValue(name) {
  const radio = document.querySelector(`input[name="${name}"]:checked`);
  return radio ? radio.value : "";
}

function scrollToField(target) {
  if (!target) return;
  const header = document.querySelector("header");
  const headerOffset = header ? header.offsetHeight : 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 18;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  if (typeof target.focus === "function") {
    try {
      target.focus({ preventScroll: true });
    } catch (_) {
      target.focus();
    }
  }
}

function getStepFirstInvalidField() {
  if (currentStep === 2) {
    if (!getRadioValue("q1")) return document.querySelector('input[name="q1"]');
    if (!getRadioValue("q2")) return document.querySelector('input[name="q2"]');
    const q3Visible = !document.getElementById("q3-block")?.classList.contains("hidden");
    if (q3Visible && !getRadioValue("q3")) return document.querySelector('input[name="q3"]');
    const q4 = getRadioValue("q4");
    if (!q4) return document.querySelector('input[name="q4"]');
    if (q4 === "Si" && !document.getElementById("input-q4a").value.trim()) return document.getElementById("input-q4a");
  }

  if (currentStep === 3) {
    if (!document.getElementById("input-q5").value.trim()) return document.getElementById("input-q5");
    if (!getRadioValue("q5a")) return document.querySelector('input[name="q5a"]');
    if (!document.getElementById("input-q5b").value.trim()) return document.getElementById("input-q5b");
  }

  if (currentStep === 4) {
    if (!document.getElementById("input-q6").value.trim()) return document.getElementById("input-q6");
    const q7 = getRadioValue("q7");
    if (!q7) return document.querySelector('input[name="q7"]');
    if (q7 === "Si" && !document.getElementById("input-q7a").value.trim()) return document.getElementById("input-q7a");
    if (!getRadioValue("q8")) return document.querySelector('input[name="q8"]');
  }

  if (currentStep === 5) {
    const q9 = getRadioValue("q9");
    if (!q9) return document.querySelector('input[name="q9"]');
    if (q9 === "Si" && !document.getElementById("input-q10").value.trim()) return document.getElementById("input-q10");
  }

  return null;
}

function validateCurrentStep() {
  if (currentStep === 2) {
    const q4 = getRadioValue("q4");
    const q3Visible = !document.getElementById("q3-block")?.classList.contains("hidden");
    if (!(getRadioValue("q1") && getRadioValue("q2") && (!q3Visible || getRadioValue("q3")) && q4)) return false;
    if (q4 === "Si" && !document.getElementById("input-q4a").value.trim()) return false;
    return true;
  }

  if (currentStep === 3) {
    return !!(
      document.getElementById("input-q5").value.trim() &&
      getRadioValue("q5a") &&
      document.getElementById("input-q5b").value.trim()
    );
  }

  if (currentStep === 4) {
    const q7 = getRadioValue("q7");
    if (!(document.getElementById("input-q6").value.trim() && q7 && getRadioValue("q8"))) return false;
    if (q7 === "Si" && !document.getElementById("input-q7a").value.trim()) return false;
    return true;
  }

  if (currentStep === 5) {
    const q9 = getRadioValue("q9");
    if (!q9) return false;
    if (q9 === "Si" && !document.getElementById("input-q10").value.trim()) return false;
    return true;
  }

  return true;
}

function toggleOtherPlanField(show) {
  document.getElementById("other-plan-conditional").classList.toggle("hidden", !show);
}

function toggleObservationsRequired(required) {
  document.getElementById("q10-required-helper").classList.toggle("hidden", !required);
}

async function submitSurvey() {
  hideToast();

  const respuestas = {
    q1: getRadioValue("q1"),
    q2: getRadioValue("q2"),
    q3: getRadioValue("q3"),
    q4: getRadioValue("q4"),
    q4a: document.getElementById("input-q4a").value.trim(),
    q5: document.getElementById("input-q5").value.trim(),
    q5a: getRadioValue("q5a"),
    q5b: document.getElementById("input-q5b").value.trim(),
    q6: document.getElementById("input-q6").value.trim(),
    q7: getRadioValue("q7"),
    q7a: document.getElementById("input-q7a").value.trim(),
    q8: getRadioValue("q8"),
    q9: getRadioValue("q9"),
    q10: document.getElementById("input-q10").value.trim(),
  };

  if (isDemoMode) {
    hideElement(surveyQuestionsContainer);
    hideElement(progressContainer);
    setSuccessState("demo");
    showElement(viewSuccess);
    return;
  }

  setSubmittingState(true);
  setButtonLoading(btnNavNext, true, "Enviando...");
  hideElement(surveyQuestionsContainer);
  hideElement(viewLoadingOverlay);
  hideElement(progressContainer);
  setSuccessState("pending");
  showElement(viewSuccess);

  try {
    const response = await fetch(getBackendRoute("enviarEncuesta"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: urlToken, dni: validatedDni, respuestas }),
      keepalive: true,
      cache: "no-store",
    });

    const data = await response.json();
    setSubmittingState(false);
    setButtonLoading(btnNavNext, false, "Enviar validacion");

    if (data.status === "OK") {
      setSuccessState("success");
      return;
    }

    if (data.status === "YA_RESPONDIO") {
      setSuccessState("alreadyDone");
      return;
    }

    hideElement(viewSuccess);
    showElement(progressContainer);
    showElement(surveyQuestionsContainer);
    if (data.status === "DNI_INVALIDO") showToast("Error de validacion: el DNI no coincide.");
    else showToast(data.message || "No pudimos guardar su encuesta.");
  } catch (error) {
    console.error(error);
    setSubmittingState(false);
    setButtonLoading(btnNavNext, false, "Enviar validacion");
    setSuccessState("pendingConfirm");
    showElement(viewSuccess);
    return;
  }
}
