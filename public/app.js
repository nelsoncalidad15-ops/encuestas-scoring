/**
 * Autosol Subscription Validator - app.js
 */

let urlToken = "";
let isDemoMode = false;
let validatedDni = "";
let clientData = null;
let currentStep = 2;
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

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  urlToken = params.get("t") || "";
  isDemoMode = params.get("demo") === "1" || params.get("prueba") === "1" || (params.get("modo") || "").toLowerCase() === "prueba";

  if (window.lucide) window.lucide.createIcons();

  bindInteractiveFields();

  setTimeout(() => {
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
    }
  }, 600);
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

  if (q3Block) q3Block.classList.toggle("hidden", !map.q3);
}

function getBackendRoute(name) {
  const host = window.location.hostname;
  const isLocal = host === "127.0.0.1" || host === "localhost";
  return isLocal ? "/.netlify/functions/" + name : "/api/" + name;
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

  hideElement(viewStepValidation);
  showElement(viewLoadingOverlay);
  setButtonLoading(btnValidateSubmit, true, "Validando...");
  const stopLoadingMessages = setLoadingMessageSequence([
    "Verificando identidad de forma segura...",
    "Buscando su validacion...",
    "Preparando su formulario..."
  ], 1000);

  try {
    const response = await fetch(getBackendRoute("validarCliente"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: urlToken, dni: dniVal }),
    });

    const data = await response.json();
    stopLoadingMessages();
    hideElement(viewLoadingOverlay);
    setButtonLoading(btnValidateSubmit, false, "Validar y continuar");

    if (data.status === "OK") {
      validatedDni = dniVal;
      clientData = data.cliente;
      applyClientContext();
      applyQuestionConfig(data.preguntas);
      showElement(progressContainer);
      showElement(surveyQuestionsContainer);
      currentStep = 2;
      updateStepUI();
      return;
    }

    showElement(viewStepValidation);
    if (data.status === "DNI_INVALIDO") showToast("El DNI ingresado no coincide con el registrado para esta validacion.");
    else if (data.status === "TOKEN_INVALIDO") showToast("El enlace no es valido o se encuentra vencido.");
    else if (data.status === "YA_RESPONDIO") {
      hideElement(viewStepValidation);
      showElement(viewSuccess);
      viewSuccess.querySelector("h2").textContent = "Validacion ya realizada";
      viewSuccess.querySelector("p").textContent = "Esta validacion ya fue registrada anteriormente. Muchas gracias por su colaboracion.";
    } else showToast(data.message || "No pudimos validar su identidad en este momento.");
  } catch (error) {
    console.error(error);
    stopLoadingMessages();
    hideElement(viewLoadingOverlay);
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
  hideElement(surveyQuestionsContainer);
  showElement(viewLoadingOverlay);
  setButtonLoading(btnNavNext, true, "Enviando...");
  const stopSubmitMessages = setLoadingMessageSequence(
    isDemoMode
      ? ["Cerrando modo prueba..."]
      : [
          "Guardando validacion...",
          "Registrando sus respuestas...",
          "Finalizando proceso seguro..."
        ],
    1100
  );

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

  try {
    if (isDemoMode) {
      stopSubmitMessages();
      hideElement(viewLoadingOverlay);
      setButtonLoading(btnNavNext, false, "Enviar validacion");
      hideElement(progressContainer);
      showElement(viewSuccess);
      viewSuccess.querySelector("h2").textContent = "Modo prueba finalizado";
      viewSuccess.querySelector("p").textContent = "La encuesta se completo en modo prueba. No se valido identidad ni se guardaron respuestas.";
      return;
    }

    const response = await fetch(getBackendRoute("enviarEncuesta"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: urlToken, dni: validatedDni, respuestas }),
    });

    const data = await response.json();
    stopSubmitMessages();
    hideElement(viewLoadingOverlay);
    setButtonLoading(btnNavNext, false, "Enviar validacion");

    if (data.status === "OK") {
      hideElement(progressContainer);
      showElement(viewSuccess);
      return;
    }

    showElement(surveyQuestionsContainer);
    if (data.status === "DNI_INVALIDO") showToast("Error de validacion: el DNI no coincide.");
    else if (data.status === "YA_RESPONDIO") {
      hideElement(surveyQuestionsContainer);
      hideElement(progressContainer);
      showElement(viewSuccess);
      viewSuccess.querySelector("h2").textContent = "Validacion ya realizada";
      viewSuccess.querySelector("p").textContent = "Esta validacion ya fue registrada anteriormente. Muchas gracias por su colaboracion.";
    } else showToast(data.message || "No pudimos guardar su encuesta.");
  } catch (error) {
    console.error(error);
    stopSubmitMessages();
    hideElement(viewLoadingOverlay);
    setButtonLoading(btnNavNext, false, "Enviar validacion");
    showElement(surveyQuestionsContainer);
    showToast("Error de red. No pudimos guardar su encuesta. Compruebe su conexion e intente nuevamente.");
  }
}
