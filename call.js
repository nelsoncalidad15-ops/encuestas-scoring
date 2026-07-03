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
    });
  });

  document.querySelectorAll('input[name="q9"]').forEach((input) => {
    input.addEventListener("change", () => {
      document.getElementById("q10-required-helper").classList.toggle("hidden", input.value !== "Si");
    });
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
  const q3Visible = !document.getElementById("q3-block").classList.contains("hidden");
  if (!getRadioValue("q1") || !getRadioValue("q2") || !getRadioValue("q4")) return false;
  if (q3Visible && !getRadioValue("q3")) return false;
  if (getRadioValue("q4") === "Si" && !document.getElementById("input-q4a").value.trim()) return false;
  if (!document.getElementById("input-q5").value.trim() || !getRadioValue("q5a") || !document.getElementById("input-q5b").value.trim()) return false;
  if (!document.getElementById("input-q6").value.trim() || !getRadioValue("q7") || !getRadioValue("q8") || !getRadioValue("q9")) return false;
  if (getRadioValue("q7") === "Si" && !document.getElementById("input-q7a").value.trim()) return false;
  if (getRadioValue("q9") === "Si" && !document.getElementById("input-q10").value.trim()) return false;
  return true;
}

async function submitCallForm(event) {
  event.preventDefault();
  hideToast();

  if (!validateForm()) {
    showToast("Complete los campos obligatorios antes de guardar.");
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
