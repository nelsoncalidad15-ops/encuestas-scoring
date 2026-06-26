/**
 * Autosol Subscription Validator - app.js
 * Frontend Core Engine and API Client
 */

// Global State
let urlToken = "";
let validatedDni = "";
let clientData = null;
let currentStep = 2; // Survey questions start at Paso 2 (Paso 1 is DNI Validation)
const totalSteps = 6;

// DOM Elements
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
const simulatedBanner = document.getElementById("simulated-banner");

// Step panel elements
const stepPanel2 = document.getElementById("step-panel-2");
const stepPanel3 = document.getElementById("step-panel-3");
const stepPanel4 = document.getElementById("step-panel-4");
const stepPanel5 = document.getElementById("step-panel-5");
const stepPanel6 = document.getElementById("step-panel-6");

// Navigation buttons
const btnNavPrev = document.getElementById("btn-nav-prev");
const btnNavNext = document.getElementById("btn-nav-next");
const btnNextText = document.getElementById("btn-next-text");
const btnNextIcon = document.getElementById("btn-next-icon");

// Init application on load
window.addEventListener("DOMContentLoaded", async () => {
  // Parse query parameters
  const params = new URLSearchParams(window.location.search);
  urlToken = params.get("t") || "";

  // Check health and mode (simulated or live)
  try {
    const healthRes = await fetch("/api/health");
    if (healthRes.ok) {
      const healthData = await healthRes.json();
      if (healthData.mode === "mock") {
        simulatedBanner.classList.remove("hidden");
      }
    }
  } catch (err) {
    console.warn("Could not retrieve backend mode. Standard operations will continue.");
  }

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Handle Token Verification Flow
  setTimeout(() => {
    hideElement(viewInitialCheck);
    if (!urlToken) {
      showElement(viewTokenError);
      document.getElementById("token-error-title").textContent = "Link incompleto";
      document.getElementById("token-error-desc").textContent = "El link de validación no contiene un identificador único. Por favor, comuníquese con Autosol para recibir su enlace personalizado.";
    } else {
      showElement(viewStepValidation);
    }
  }, 800);
});

// Helper for simulated mode token filling
window.fillMockToken = (token, dni) => {
  urlToken = token;
  // Update browser URL query parameter silently
  const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?t=" + token;
  window.history.pushState({ path: newUrl }, "", newUrl);
  
  const dniInput = document.getElementById("input-dni");
  if (dniInput) {
    dniInput.value = dni;
  }
  
  // Transition from the token error view to the input/validation step
  hideElement(viewTokenError);
  showElement(viewStepValidation);
  hideToast();
  showToast("Token de prueba cargado. Presione 'Validar y Continuar' para iniciar la encuesta.", "info");
};

// UI Helper Functions
function showElement(el) {
  if (el) {
    el.classList.remove("hidden");
    el.classList.add("step-transition");
  }
}

function hideElement(el) {
  if (el) {
    el.classList.add("hidden");
    el.classList.remove("step-transition");
  }
}

function showToast(message, type = "error") {
  errorToastMessage.textContent = message;
  errorToast.classList.remove("hidden", "bg-red-50", "border-red-100", "text-red-800", "bg-blue-50", "border-blue-100", "text-blue-800");
  
  if (type === "error") {
    errorToast.classList.add("bg-red-50", "border-red-100", "text-red-800");
  } else {
    errorToast.classList.add("bg-blue-50", "border-blue-100", "text-blue-800");
  }
  
  errorToast.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideToast() {
  errorToast.classList.add("hidden");
}

// API Call: Validate Client (Step 1 -> Step 2)
async function validateDni(event) {
  event.preventDefault();
  hideToast();
  
  const dniInput = document.getElementById("input-dni");
  const dniVal = dniInput.value.replace(/\D/g, "");

  if (dniVal.length < 7 || dniVal.length > 8) {
    showToast("El DNI debe tener entre 7 y 8 números.");
    return;
  }

  // Show Loading overlay
  hideElement(viewStepValidation);
  showElement(viewLoadingOverlay);
  loadingOverlayText.textContent = "Verificando identidad de forma segura...";

  try {
    const response = await fetch("/.netlify/functions/validarCliente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: urlToken, dni: dniVal })
    });

    const data = await response.json();
    hideElement(viewLoadingOverlay);

    if (data.status === "OK") {
      // Identity validated! Proceed to survey
      validatedDni = dniVal;
      clientData = data.cliente;
      
      // Populate Client Data Badges
      document.getElementById("client-badge-name").textContent = clientData.nombre;
      document.getElementById("client-badge-model").textContent = clientData.modelo;
      document.getElementById("span-modelo").textContent = clientData.modelo;
      document.getElementById("client-badge-advisor").textContent = clientData.asesor;
      document.getElementById("client-badge-quote").textContent = `$ ${clientData.montoCuota2}`;

      // Populate dynamic list of vendors
      populateVendors(data.vendedores);

      // Initialize Survey step 2
      currentStep = 2;
      showElement(progressContainer);
      showElement(surveyQuestionsContainer);
      updateStepUI();
    } else {
      // Restore view and show message
      showElement(viewStepValidation);
      if (data.status === "DNI_INVALIDO") {
        showToast("El DNI ingresado no coincide con el registrado para esta validación. Verifique los números e intente de nuevo.");
      } else if (data.status === "TOKEN_INVALIDO") {
        showToast("El link no es válido o se encuentra vencido. Por favor comuníquese con Autosol.");
      } else if (data.status === "YA_RESPONDIO") {
        hideElement(viewStepValidation);
        showElement(viewSuccess);
        document.getElementById("view-success").querySelector("h2").textContent = "Validación ya Realizada";
        document.getElementById("view-success").querySelector("p").textContent = "Esta validación ya fue registrada anteriormente. Muchas gracias por su colaboración.";
      } else {
        showToast(data.message || "No pudimos validar su identidad en este momento. Intente de nuevo.");
      }
    }
  } catch (err) {
    console.error("Validation error:", err);
    hideElement(viewLoadingOverlay);
    showElement(viewStepValidation);
    showToast("Error de conexión. Verifique su acceso a internet e intente nuevamente.");
  }
}

// Step Navigation Handler
function navigateStep(direction) {
  hideToast();

  // If going forward, validate current step fields
  if (direction === 1) {
    if (!validateCurrentStep()) {
      showToast("Por favor complete todas las preguntas obligatorias antes de continuar.");
      return;
    }
    
    if (currentStep === totalSteps) {
      // If we are on the final step, submit the survey!
      submitSurvey();
      return;
    }
  }

  // Update current step pointer
  currentStep += direction;
  updateStepUI();
}

// Validate active step fields
function validateCurrentStep() {
  if (currentStep === 2) {
    // Requires q1, q2, q3, q4
    return getRadioValue("q1") && getRadioValue("q2") && getRadioValue("q3") && getRadioValue("q4");
  }
  
  if (currentStep === 3) {
    // Requires q5, q6 (text), q7 (text), q8
    const q5 = getRadioValue("q5");
    const q6 = document.getElementById("input-q6").value.trim();
    const q7 = document.getElementById("input-q7").value.trim();
    const q8 = getRadioValue("q8");
    
    if (!q5 || !q6 || !q7 || !q8) return false;

    // Conditional q8b and q8c if q8 is Débito Automático (t. credito, t. debito, or debito/ CBU)
    if (q8 === "t. credito" || q8 === "t. debito" || q8 === "debito/ CBU") {
      const q8b = getRadioValue("q8b");
      const q8c = getRadioValue("q8c");
      if (!q8b || !q8c) return false;
    }
    return true;
  }

  if (currentStep === 4) {
    // Requires q9 (select dropdown), q10 (radio 1-5), q11
    const q9 = document.getElementById("input-q9").value;
    let q9Valid = !!q9;
    if (q9 === "Otro") {
      const q9Otro = document.getElementById("input-q9-otro").value.trim();
      q9Valid = !!q9Otro;
    }
    const q10 = getRadioValue("q10");
    const q11 = getRadioValue("q11");
    return q9Valid && q10 && q11;
  }

  if (currentStep === 5) {
    // Requires q12 (text), q13 (radio), q14 (radio), q15 (radio)
    const q12 = document.getElementById("input-q12").value.trim();
    const q13 = getRadioValue("q13");
    const q14 = getRadioValue("q14");
    const q15 = getRadioValue("q15");

    if (!q12 || !q13 || !q14 || !q15) return false;

    // Conditional q13a if q13 is Sí
    if (q13 === "Sí") {
      const q13a = document.getElementById("input-q13a").value.trim();
      if (!q13a) return false;
    }

    // Conditional q15a if q15 is Sí or "Se lo prometieron pero no lo recibió"
    if (q15 === "Sí" || q15 === "Se lo prometieron pero no lo recibió") {
      const q15a = document.getElementById("input-q15a").value.trim();
      if (!q15a) return false;
    }
    return true;
  }

  if (currentStep === 6) {
    // Requires q17 (radio), and q16 (text) is only required if q17 is Sí
    const q17 = getRadioValue("q17");
    if (!q17) return false;

    if (q17 === "Sí") {
      const q16 = document.getElementById("input-q16").value.trim();
      if (!q16) return false;
    }
    return true;
  }

  return true;
}

// Retrieve selected radio value
function getRadioValue(name) {
  const radio = document.querySelector(`input[name="${name}"]:checked`);
  return radio ? radio.value : "";
}

// Toggle Debit questions (q8b, q8c) dynamically
window.toggleDebitQuestions = (show) => {
  const debitPanel = document.getElementById("debit-conditional-fields");
  const q8bRadios = document.getElementsByName("q8b");
  const q8cRadios = document.getElementsByName("q8c");

  if (show) {
    debitPanel.classList.remove("hidden");
    // Make them required internally (via JS validations, we do manually)
  } else {
    debitPanel.classList.add("hidden");
    // Clear selections
    clearRadios(q8bRadios);
    clearRadios(q8cRadios);
  }
};

// Toggle Used Vehicle question (q13a) dynamically
window.toggleUsedVehicleField = (show) => {
  const usedVehiclePanel = document.getElementById("used-vehicle-conditional");
  const usedVehicleInput = document.getElementById("input-q13a");

  if (show) {
    usedVehiclePanel.classList.remove("hidden");
    usedVehicleInput.setAttribute("required", "required");
  } else {
    usedVehiclePanel.classList.add("hidden");
    usedVehicleInput.removeAttribute("required");
    usedVehicleInput.value = "";
  }
};

// Populate Dynamic Vendors List in Select dropdown
function populateVendors(vendedores) {
  const select = document.getElementById("input-q9");
  const wrapperQ9Otro = document.getElementById("wrapper-q9-otro");
  const inputQ9Otro = document.getElementById("input-q9-otro");
  if (!select) return;

  // Clear existing options except the first placeholder
  while (select.options.length > 1) {
    select.remove(1);
  }

  // Add vendors from backend or defaults
  const vendorList = (vendedores && vendedores.length > 0) ? vendedores : [
    "ARIADNA PETRUCIOLI",
    "BRIAN DOUTHAT",
    "EMILSE DIAZ",
    "GASTON BASTOS",
    "HORACIO ZELAYA",
    "JOSE SALUZZO",
    "RODRIGO VILLAFAÑE",
    "VANESA ZAMBRANO"
  ];

  vendorList.forEach(vendedor => {
    const option = document.createElement("option");
    option.value = vendedor;
    option.textContent = vendedor;
    select.appendChild(option);
  });

  // Add "Otro" option
  const optionOtro = document.createElement("option");
  optionOtro.value = "Otro";
  optionOtro.textContent = "Otro (No figura en la lista)";
  select.appendChild(optionOtro);

  // Setup event listener if not already initialized
  if (!select.dataset.listenerAdded) {
    select.addEventListener("change", (e) => {
      if (e.target.value === "Otro") {
        wrapperQ9Otro.classList.remove("hidden");
        inputQ9Otro.setAttribute("required", "required");
      } else {
        wrapperQ9Otro.classList.add("hidden");
        inputQ9Otro.removeAttribute("required");
        inputQ9Otro.value = "";
      }
    });
    select.dataset.listenerAdded = "true";
  }

  // Reset to default
  select.value = "";
  wrapperQ9Otro.classList.add("hidden");
  inputQ9Otro.removeAttribute("required");
  inputQ9Otro.value = "";
}

// Toggle Benefit detail question (q15a) dynamically
window.toggleBenefitField = (show) => {
  const benefitPanel = document.getElementById("benefit-conditional");
  const benefitInput = document.getElementById("input-q15a");

  if (show) {
    benefitPanel.classList.remove("hidden");
    benefitInput.setAttribute("required", "required");
  } else {
    benefitPanel.classList.add("hidden");
    benefitInput.removeAttribute("required");
    benefitInput.value = "";
  }
};

// Toggle whether observations are mandatory based on recontact (q17 === Sí)
window.toggleObservationsRequired = (required) => {
  const q16Textarea = document.getElementById("input-q16");
  const q16Label = document.getElementById("label-q16");
  const q16Helper = document.getElementById("q16-required-helper");

  if (required) {
    q16Textarea.setAttribute("required", "required");
    q16Label.innerHTML = "16. ¿Desea agregar alguna observación? *";
    q16Helper.classList.remove("hidden");
  } else {
    q16Textarea.removeAttribute("required");
    q16Label.innerHTML = "16. ¿Desea agregar alguna observación?";
    q16Helper.classList.add("hidden");
  }
};

function clearRadios(radios) {
  for (let i = 0; i < radios.length; i++) {
    radios[i].checked = false;
  }
}

// Update survey step visible panel and indicators
function updateStepUI() {
  // Hide all step panels first
  hideElement(stepPanel2);
  hideElement(stepPanel3);
  hideElement(stepPanel4);
  hideElement(stepPanel5);
  hideElement(stepPanel6);

  // Show active step panel
  if (currentStep === 2) {
    showElement(stepPanel2);
    stepTitle.textContent = "Información del Plan";
  } else if (currentStep === 3) {
    showElement(stepPanel3);
    stepTitle.textContent = "Cuotas y Pagos";
  } else if (currentStep === 4) {
    showElement(stepPanel4);
    stepTitle.textContent = "Experiencia con el Vendedor";
  } else if (currentStep === 5) {
    showElement(stepPanel5);
    stepTitle.textContent = "Otros Detalles de Compra";
  } else if (currentStep === 6) {
    showElement(stepPanel6);
    stepTitle.textContent = "Observaciones Finales";
  }

  // Update Progress values
  // Since 5 actual survey steps (2, 3, 4, 5, 6), progress represents current/total
  const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;
  progressBar.style.width = `${pct}%`;
  stepCounter.textContent = `Paso ${currentStep} de ${totalSteps}`;

  // Configure navigation buttons state
  if (currentStep === 2) {
    btnNavPrev.disabled = true;
    btnNavPrev.classList.add("opacity-40", "cursor-not-allowed");
  } else {
    btnNavPrev.disabled = false;
    btnNavPrev.classList.remove("opacity-40", "cursor-not-allowed");
  }

  // Next button layout (Submit or Next Step)
  if (currentStep === totalSteps) {
    btnNextText.textContent = "Enviar Validación";
    btnNextIcon.setAttribute("data-lucide", "check-circle");
    btnNavNext.classList.remove("bg-autosol-primary", "hover:bg-blue-700");
    btnNavNext.classList.add("bg-emerald-600", "hover:bg-emerald-700", "shadow-emerald-100");
  } else {
    btnNextText.textContent = "Siguiente";
    btnNextIcon.setAttribute("data-lucide", "arrow-right");
    btnNavNext.classList.remove("bg-emerald-600", "hover:bg-emerald-700", "shadow-emerald-100");
    btnNavNext.classList.add("bg-autosol-primary", "hover:bg-blue-700");
  }

  // Refresh lucide icons dynamically for navigation
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Scroll back to card top on transitions
  document.getElementById("survey-card").scrollIntoView({ behavior: "smooth", block: "start" });
}

// API Call: Submit Survey (Save Encuesta and Scoring)
async function submitSurvey() {
  hideToast();
  
  // Package responses
  const surveyPayload = {
    token: urlToken,
    dni: validatedDni,
    respuestas: {
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
      q9: document.getElementById("input-q9").value === "Otro" ? document.getElementById("input-q9-otro").value.trim() : document.getElementById("input-q9").value,
      q10: getRadioValue("q10"),
      q11: getRadioValue("q11"),
      q12: document.getElementById("input-q12").value.trim(),
      q13: getRadioValue("q13"),
      q13a: document.getElementById("input-q13a").value.trim(),
      q14: getRadioValue("q14"),
      q15: getRadioValue("q15"),
      beneficioDetalle: document.getElementById("input-q15a").value.trim(),
      q16: document.getElementById("input-q16").value.trim(),
      q17: getRadioValue("q17")
    }
  };

  // Disable UI elements and show loading overlay
  hideElement(surveyQuestionsContainer);
  hideElement(progressContainer);
  showElement(viewLoadingOverlay);
  loadingOverlayText.textContent = "Guardando respuestas de forma segura y calculando scoring...";

  try {
    const response = await fetch("/.netlify/functions/enviarEncuesta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(surveyPayload)
    });

    const data = await response.json();
    hideElement(viewLoadingOverlay);

    if (data.status === "OK") {
      // Survey saved successfully!
      showElement(viewSuccess);
    } else {
      // Re-enable and show error
      showElement(progressContainer);
      showElement(surveyQuestionsContainer);
      
      if (data.status === "DNI_INVALIDO") {
        showToast("Error de validación: El DNI no coincide. Verifique e intente de nuevo.");
      } else if (data.status === "TOKEN_INVALIDO") {
        showToast("El link no es válido o ya venció. Por favor comuníquese con Autosol.");
      } else if (data.status === "YA_RESPONDIO") {
        hideElement(surveyQuestionsContainer);
        hideElement(progressContainer);
        showElement(viewSuccess);
        document.getElementById("view-success").querySelector("h2").textContent = "Validación ya Realizada";
        document.getElementById("view-success").querySelector("p").textContent = "Esta validación ya fue registrada anteriormente. Muchas gracias por su colaboración.";
      } else {
        showToast(data.message || "No pudimos guardar sus respuestas en este momento. Intente nuevamente.");
      }
    }
  } catch (err) {
    console.error("Submission error:", err);
    hideElement(viewLoadingOverlay);
    showElement(progressContainer);
    showElement(surveyQuestionsContainer);
    showToast("Error de red. No pudimos guardar su encuesta. Compruebe su conexión e intente nuevamente.");
  }
}
