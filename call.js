let urlToken = "";
let clientData = null;

const viewLoading = document.getElementById("view-loading");
const viewForm = document.getElementById("view-form");
const viewSuccess = document.getElementById("view-success");
const errorToast = document.getElementById("error-toast");
const errorToastMessage = document.getElementById("error-toast-message");
const loadingText = document.getElementById("loading-text");
const btnSaveCall = document.getElementById("btn-save-call");

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const params = new URLSearchParams(window.location.search);
  urlToken = params.get("t") || "";

  bindConditionalFields();

  if (!urlToken) {
    showToast("No se encontro el token de llamada.");
    loadingText.textContent = "Link de llamada incompleto.";
    return;
  }

  loadCallSheet();
});

function getBackendRoute(name) {
  const host = window.location.hostname;
  const isLocal = host === "127.0.0.1" || host === "localhost";
  return isLocal ? "/.netlify/functions/" + name : "/api/" + name;
}

function showToast(message) {
  errorToastMessage.textContent = message;
  errorToast.classList.remove("hidden");
}

function hideToast() {
  errorToast.classList.add("hidden");
}

function getValidationContainer(field) {
  if (!field) return null;
  let current = field;
  while (current && current !== document.body) {
    if (current.id === 'other-plan-conditional') return current;
    if (current.classList?.contains('space-y-2') || current.classList?.contains('space-y-1.5')) return current;
    current = current.parentElement;
  }
  return field.parentElement;
}

function clearValidationState(field) {
  const container = getValidationContainer(field);
  if (!container) return;
  container.classList.remove('validation-error');
  const error = container.querySelector('.field-error-text');
  if (error) error.remove();
}

function clearValidationStateAll() {
  document.querySelectorAll('.validation-error').forEach((el) => el.classList.remove('validation-error'));
  document.querySelectorAll('.field-error-text').forEach((el) => el.remove());
}

function showFieldError(field, message) {
  const container = getValidationContainer(field);
  if (!container) return;
  clearValidationState(field);
  container.classList.add('validation-error');
  const error = document.createElement('p');
  error.className = 'field-error-text';
  error.textContent = message;
  container.appendChild(error);
}

function focusInvalidField(field) {
  if (!field) return;
  const container = getValidationContainer(field) || field;
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => {
    if (field.type === 'radio') field.focus();
    else field.focus({ preventScroll: true });
  }, 120);
}

function buildValidationIssue(field, message) {
  return { field, message };
}

function setButtonLoading(active, text) {
  btnSaveCall.disabled = active;
  btnSaveCall.classList.toggle("opacity-70", active);
  btnSaveCall.classList.toggle("cursor-not-allowed", active);
  btnSaveCall.textContent = text;
}

function bindConditionalFields() {
  document.querySelectorAll('input[name="q7"]').forEach((input) => {
    input.addEventListener("change", () => {
      document.getElementById("other-plan-conditional").classList.toggle("hidden", input.value !== "Si");
      clearValidationState(input);
      clearValidationState(document.getElementById("input-q7a"));
    });
  });

  document.querySelectorAll('input[name="q9"]').forEach((input) => {
    input.addEventListener("change", () => {
      document.getElementById("q10-required-helper").classList.toggle("hidden", input.value !== "Si");
      clearValidationState(input);
      clearValidationState(document.getElementById("input-q10"));
    });
  });

  document.querySelectorAll('input[type="text"], input[type="date"], textarea').forEach((input) => {
    input.addEventListener("input", () => clearValidationState(input));
    input.addEventListener("change", () => clearValidationState(input));
  });
  document.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener("change", () => clearValidationState(input));
  });

  document.getElementById("call-form").addEventListener("submit", submitCallForm);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "-";
}

function setQuestionText(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.textContent = value;
}

function setQuestionNote(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  const value = (text || "").trim();
  el.textContent = value;
  el.classList.toggle("hidden", !value);
}

function setRadioOptions(name, options) {
  if (!Array.isArray(options) || !options.length) return;
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
    if (preguntas[key]?.pregunta) setQuestionText(targets[key], preguntas[key].pregunta);
    if (preguntas[key]?.opciones?.length) setRadioOptions(key, preguntas[key].opciones);
  });

  setQuestionNote("q2-note", preguntas.q2?.observacion || "");
  q3Block.classList.toggle("hidden", !preguntas.q3);
}

function fillClientInfo(cliente) {
  setText("client-name", cliente.nombre);
  setText("client-model", cliente.modelo);
  setText("client-asesor", cliente.asesor);
  setText("client-solicitud", cliente.solicitud);
  setText("client-plan", cliente.planAuto || cliente.modelo);
  setText("client-cuota2", cliente.montoCuota2 || "-");
  setText("client-phone", cliente.telefono || "-");
  setText("client-branch", cliente.sucursal || "-");

  document.getElementById("input-q6").value = cliente.asesor || "";
  document.getElementById("input-q4a").placeholder = cliente.montoCuota2 ? `Ej: $ ${cliente.montoCuota2}` : "Ej: $ 185000";
}

function setRadioValue(name, value) {
  if (!value) return;
  const radio = document.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`);
  if (radio) {
    radio.checked = true;
    radio.dispatchEvent(new Event("change"));
  }
}

function fillExistingAnswers(respuestas) {
  if (!respuestas) return;
  ["q1", "q2", "q3", "q4", "q5a", "q7", "q8", "q9"].forEach((key) => setRadioValue(key, respuestas[key] || ""));
  document.getElementById("input-q4a").value = respuestas.q4a || "";
  document.getElementById("input-q5").value = respuestas.q5 || "";
  document.getElementById("input-q5b").value = respuestas.q5b || "";
  document.getElementById("input-q6").value = respuestas.q6 || document.getElementById("input-q6").value;
  document.getElementById("input-q7a").value = respuestas.q7a || "";
  document.getElementById("input-q10").value = respuestas.q10 || "";
}

async function loadCallSheet() {
  hideToast();
  try {
    const response = await fetch(getBackendRoute("cargarLlamada"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: urlToken }),
    });

    const data = await response.json();
    if (data.status !== "OK") {
      throw new Error(data.message || "No se pudo cargar la ficha de llamada.");
    }

    clientData = data.cliente;
    fillClientInfo(data.cliente);
    applyQuestionConfig(data.preguntas || {});
    fillExistingAnswers(data.respuestas || {});

    viewLoading.classList.add("hidden");
    viewForm.classList.remove("hidden");
  } catch (error) {
    showToast(error.message || "No se pudo cargar la llamada.");
    loadingText.textContent = "No se pudo cargar la ficha.";
  }
}

function getRadioValue(name) {
  const radio = document.querySelector(`input[name="${name}"]:checked`);
  return radio ? radio.value : "";
}

function validateForm() {
  clearValidationStateAll();
  const q3Visible = !document.getElementById("q3-block").classList.contains("hidden");
  if (!getRadioValue("q1")) return buildValidationIssue(document.querySelector('input[name="q1"]'), "Por favor, seleccione una respuesta para continuar.");
  if (!getRadioValue("q2")) return buildValidationIssue(document.querySelector('input[name="q2"]'), "Por favor, seleccione una respuesta para continuar.");
  if (q3Visible && !getRadioValue("q3")) return buildValidationIssue(document.querySelector('input[name="q3"]'), "Por favor, seleccione una respuesta para continuar.");
  if (!getRadioValue("q4")) return buildValidationIssue(document.querySelector('input[name="q4"]'), "Por favor, seleccione una respuesta para continuar.");
  if (getRadioValue("q4") === "Si" && !document.getElementById("input-q4a").value.trim()) return buildValidationIssue(document.getElementById("input-q4a"), "Por favor, indique el monto aproximado de la cuota 2.");
  if (!document.getElementById("input-q5").value.trim()) return buildValidationIssue(document.getElementById("input-q5"), "Por favor, complete el monto de la primera cuota.");
  if (!getRadioValue("q5a")) return buildValidationIssue(document.querySelector('input[name="q5a"]'), "Por favor, seleccione una respuesta para continuar.");
  if (!document.getElementById("input-q5b").value.trim()) return buildValidationIssue(document.getElementById("input-q5b"), "Por favor, complete la fecha estimada de pago de la primera cuota.");
  if (!document.getElementById("input-q6").value.trim()) return buildValidationIssue(document.getElementById("input-q6"), "Por favor, complete el nombre del vendedor.");
  if (!getRadioValue("q7")) return buildValidationIssue(document.querySelector('input[name="q7"]'), "Por favor, seleccione una respuesta para continuar.");
  if (getRadioValue("q7") === "Si" && !document.getElementById("input-q7a").value.trim()) return buildValidationIssue(document.getElementById("input-q7a"), "Por favor, indique la marca y hasta que mes pago el otro plan.");
  if (!getRadioValue("q8")) return buildValidationIssue(document.querySelector('input[name="q8"]'), "Por favor, indique como conocio la propuesta.");
  if (!getRadioValue("q9")) return buildValidationIssue(document.querySelector('input[name="q9"]'), "Por favor, indique si desea que un asesor vuelva a contactarlo.");
  if (getRadioValue("q9") === "Si" && !document.getElementById("input-q10").value.trim()) return buildValidationIssue(document.getElementById("input-q10"), "Por favor, deje una observacion para que podamos ayudarlo mejor.");
  return null;
}

async function submitCallForm(event) {
  event.preventDefault();
  hideToast();

  const issue = validateForm();
  if (issue) {
    showFieldError(issue.field, issue.message);
    focusInvalidField(issue.field);
    showToast(issue.message);
    return;
  }

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
    setButtonLoading(true, "Guardando...");
    const response = await fetch(getBackendRoute("guardarLlamada"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: urlToken, respuestas }),
    });

    const data = await response.json();
    if (data.status !== "OK") {
      throw new Error(data.message || "No se pudo guardar la llamada.");
    }

    viewForm.classList.add("hidden");
    viewSuccess.classList.remove("hidden");
  } catch (error) {
    showToast(error.message || "No se pudo guardar la llamada.");
  } finally {
    setButtonLoading(false, "Guardar llamada");
  }
}
