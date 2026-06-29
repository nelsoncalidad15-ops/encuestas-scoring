/**
 * Autosol Subscription Validator - app.js
 */

let urlToken = "";
let validatedDni = "";
let clientData = null;
let currentStep = 2;
const totalSteps = 6;

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
  6: document.getElementById("step-panel-6"),
};

const btnNavPrev = document.getElementById("btn-nav-prev");
const btnNavNext = document.getElementById("btn-nav-next");
const btnNextText = document.getElementById("btn-next-text");

const stepTitles = {
  2: "Informacion del plan",
  3: "Cuotas y pagos",
  4: "Vendedor",
  5: "Otros datos",
  6: "Cierre",
};

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  urlToken = params.get("t") || "";

  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    hideElement(viewInitialCheck);
    if (!urlToken) {
      showElement(viewTokenError);
      document.getElementById("token-error-title").textContent = "Link incompleto";
      document.getElementById("token-error-desc").textContent = "El enlace de validacion no contiene un identificador unico de cliente.";
    } else {
      showElement(viewStepValidation);
    }
  }, 600);
});

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
  loadingOverlayText.textContent = "Verificando identidad de forma segura...";

  try {
    const response = await fetch("/.netlify/functions/validarCliente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: urlToken, dni: dniVal }),
    });

    const data = await response.json();
    hideElement(viewLoadingOverlay);

    if (data.status === "OK") {
      validatedDni = dniVal;
      clientData = data.cliente;
      document.getElementById("client-badge-name").textContent = clientData.nombre || "-";
      document.getElementById("client-badge-model").textContent = clientData.modelo || "-";
      document.getElementById("span-modelo").textContent = clientData.modelo || "-";
      document.getElementById("client-badge-advisor").textContent = clientData.asesor || "-";
      document.getElementById("client-badge-quote").textContent = clientData.montoCuota2 ? `$ ${clientData.montoCuota2}` : "-";
      populateVendors(data.vendedores || []);
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
    hideElement(viewLoadingOverlay);
    showElement(viewStepValidation);
    showToast("Error de conexion. Verifique su acceso a internet e intente nuevamente.");
  }
}

function populateVendors(vendors) {
  const select = document.getElementById("input-q9");
  select.innerHTML = '<option value="" disabled selected>Seleccione su vendedor</option>';
  const normalized = [...new Set((vendors || []).map((vendor) => String(vendor || "").trim()).filter(Boolean))];

  if (clientData?.asesor && !normalized.includes(clientData.asesor)) {
    normalized.unshift(clientData.asesor);
  }

  normalized.sort((a, b) => a.localeCompare(b, "es"));

  normalized.forEach((vendor) => {
    const option = document.createElement("option");
    option.value = vendor;
    option.textContent = vendor;
    select.appendChild(option);
  });
  const extra = document.createElement("option");
  extra.value = "Otro";
  extra.textContent = "Otro";
  select.appendChild(extra);

  select.onchange = () => {
    document.getElementById("wrapper-q9-otro").classList.toggle("hidden", select.value !== "Otro");
  };
}

function updateStepUI() {
  Object.values(panels).forEach((panel) => hideElement(panel));
  showElement(panels[currentStep]);

  stepTitle.textContent = stepTitles[currentStep];
  stepCounter.textContent = `Paso ${currentStep - 1} de ${totalSteps - 1}`;
  progressBar.style.width = `${((currentStep - 2) / (totalSteps - 2)) * 100}%`;

  btnNavPrev.classList.toggle("invisible", currentStep === 2);
  btnNextText.textContent = currentStep === totalSteps ? "Enviar validacion" : "Continuar";
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  if (currentStep === 2) return getRadioValue("q1") && getRadioValue("q2") && getRadioValue("q3") && getRadioValue("q4");

  if (currentStep === 3) {
    const q5 = getRadioValue("q5");
    const q6 = document.getElementById("input-q6").value.trim();
    const q7 = document.getElementById("input-q7").value.trim();
    const q8 = getRadioValue("q8");
    if (!q5 || !q6 || !q7 || !q8) return false;
    if (["t. credito", "t. debito", "debito/ CBU"].includes(q8)) {
      return !!getRadioValue("q8b") && !!getRadioValue("q8c");
    }
    return true;
  }

  if (currentStep === 4) {
    const q9 = document.getElementById("input-q9").value;
    const q10 = getRadioValue("q10");
    const q11 = getRadioValue("q11");
    if (!q9 || !q10 || !q11) return false;
    if (q9 === "Otro") return !!document.getElementById("input-q9-otro").value.trim();
    return true;
  }

  if (currentStep === 5) {
    const q12 = document.getElementById("input-q12").value.trim();
    const q13 = getRadioValue("q13");
    const q14 = getRadioValue("q14");
    const q15 = getRadioValue("q15");
    if (!q12 || !q13 || !q14 || !q15) return false;
    if (q13 === "Si" && !document.getElementById("input-q13a").value.trim()) return false;
    if ((q15 === "Si" || q15 === "Se lo prometieron pero no lo recibio") && !document.getElementById("input-q15a").value.trim()) return false;
    return true;
  }

  if (currentStep === 6) {
    const q17 = getRadioValue("q17");
    if (!q17) return false;
    if (q17 === "Si" && !document.getElementById("input-q16").value.trim()) return false;
  }

  return true;
}

function toggleDebitQuestions(show) {
  document.getElementById("debit-conditional-fields").classList.toggle("hidden", !show);
}

function toggleUsedVehicleField(show) {
  document.getElementById("used-vehicle-conditional").classList.toggle("hidden", !show);
}

function toggleBenefitField(show) {
  document.getElementById("benefit-conditional").classList.toggle("hidden", !show);
}

function toggleObservationsRequired(required) {
  document.getElementById("q16-required-helper").classList.toggle("hidden", !required);
}

async function submitSurvey() {
  hideToast();
  hideElement(surveyQuestionsContainer);
  showElement(viewLoadingOverlay);
  loadingOverlayText.textContent = "Guardando validacion...";

  const q9Value = document.getElementById("input-q9").value === "Otro"
    ? document.getElementById("input-q9-otro").value.trim()
    : document.getElementById("input-q9").value;

  const respuestas = {
    q1: getRadioValue("q1"),
    q2: getRadioValue("q2"),
    q3: getRadioValue("q3"),
    q4: getRadioValue("q4"),
    q5: getRadioValue("q5"),
    q6: document.getElementById("input-q6").value.trim(),
    q7: document.getElementById("input-q7").value.trim(),
    q8: getRadioValue("q8"),
    q8b: getRadioValue("q8b"),
    q8c: getRadioValue("q8c"),
    q9: q9Value,
    q10: getRadioValue("q10"),
    q11: getRadioValue("q11"),
    q12: document.getElementById("input-q12").value.trim(),
    q13: getRadioValue("q13"),
    q13a: document.getElementById("input-q13a").value.trim(),
    q14: getRadioValue("q14"),
    q15: getRadioValue("q15"),
    beneficioDetalle: document.getElementById("input-q15a").value.trim(),
    q16: document.getElementById("input-q16").value.trim(),
    q17: getRadioValue("q17"),
  };

  try {
    const response = await fetch("/.netlify/functions/enviarEncuesta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: urlToken, dni: validatedDni, respuestas }),
    });

    const data = await response.json();
    hideElement(viewLoadingOverlay);

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
    hideElement(viewLoadingOverlay);
    showElement(surveyQuestionsContainer);
    showToast("Error de red. No pudimos guardar su encuesta. Compruebe su conexion e intente nuevamente.");
  }
}

