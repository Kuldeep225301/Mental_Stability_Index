const API_BASE = "http://127.0.0.1:8000";

const form = document.getElementById("predictForm");
const submitBtn = document.getElementById("submitBtn");
const apiBanner = document.getElementById("apiBanner");

const formCard = document.getElementById("formCard");
const resultCard = document.getElementById("resultCard");
const backBtn = document.getElementById("backBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");

const gaugeFill = document.getElementById("gaugeFill");
const gaugeScore = document.getElementById("gaugeScore");
const resultLabel = document.getElementById("resultLabel");
const resultCopy = document.getElementById("resultCopy");

const GAUGE_CIRCUMFERENCE = 540.35; // 2 * PI * r(86), must match style.css
const SCORE_MAX = 10;

// Field constraints mirrored from the MentalHealth pydantic model,
// used only for instant client-side feedback (the backend still validates).
const FIELD_RULES = {
  Age: { type: "number", min: 10, max: 100, label: "Age" },
  Gender: { type: "select", label: "Gender" },
  Country: { type: "text", label: "Country" },
  Academic_Level: { type: "select", label: "Academic level" },
  Most_Used_Platform: { type: "select", label: "Most used platform" },
  Purpose_Of_Use: { type: "select", label: "Purpose of use" },
  Avg_Daily_Usage_Hours: { type: "number", min: 0, max: 24, label: "Avg. daily screen time" },
  Daily_Unlocks: { type: "number", min: 0, label: "Daily phone unlocks" },
  Study_Hours: { type: "number", min: 0, max: 24, label: "Study hours" },
  Physical_Activity_Hours: { type: "number", min: 0, label: "Physical activity hours" },
  Sleep_Hours_Per_Night: { type: "number", min: 0, max: 24, label: "Sleep per night" },
  Stress_Level: { type: "select", label: "Stress level" },
};

function clearFieldError(name) {
  const field = form.elements[name].closest(".field");
  const errorEl = form.querySelector(`[data-error-for="${name}"]`);
  if (field) field.classList.remove("has-error");
  if (errorEl) errorEl.textContent = "";
}

function setFieldError(name, message) {
  const field = form.elements[name].closest(".field");
  const errorEl = form.querySelector(`[data-error-for="${name}"]`);
  if (field) field.classList.add("has-error");
  if (errorEl) errorEl.textContent = message;
}

function hideApiBanner() {
  apiBanner.hidden = true;
  apiBanner.textContent = "";
}

function showApiBanner(message) {
  apiBanner.hidden = false;
  apiBanner.textContent = message;
}

// Validates every field against FIELD_RULES. Returns true if the form is valid.
function validateForm() {
  let isValid = true;

  for (const [name, rule] of Object.entries(FIELD_RULES)) {
    const el = form.elements[name];
    clearFieldError(name);
    const rawValue = el.value.trim();

    if (rawValue === "") {
      setFieldError(name, `${rule.label} is required.`);
      isValid = false;
      continue;
    }

    if (rule.type === "number") {
      const num = Number(rawValue);
      if (Number.isNaN(num)) {
        setFieldError(name, `${rule.label} must be a number.`);
        isValid = false;
      } else if (rule.min !== undefined && num < rule.min) {
        setFieldError(name, `${rule.label} must be at least ${rule.min}.`);
        isValid = false;
      } else if (rule.max !== undefined && num > rule.max) {
        setFieldError(name, `${rule.label} must be at most ${rule.max}.`);
        isValid = false;
      }
    }
  }

  return isValid;
}

function buildPayload() {
  return {
    Age: Number(form.elements.Age.value),
    Gender: form.elements.Gender.value,
    Country: form.elements.Country.value.trim(),
    Academic_Level: form.elements.Academic_Level.value,
    Most_Used_Platform: form.elements.Most_Used_Platform.value,
    Purpose_Of_Use: form.elements.Purpose_Of_Use.value,
    Avg_Daily_Usage_Hours: Number(form.elements.Avg_Daily_Usage_Hours.value),
    Daily_Unlocks: Number(form.elements.Daily_Unlocks.value),
    Study_Hours: Number(form.elements.Study_Hours.value),
    Physical_Activity_Hours: Number(form.elements.Physical_Activity_Hours.value),
    Sleep_Hours_Per_Night: Number(form.elements.Sleep_Hours_Per_Night.value),
    Stress_Level: form.elements.Stress_Level.value,
  };
}

// Turns FastAPI's 422 pydantic error body into field-level messages + a summary.
function applyServerValidationErrors(detail) {
  if (!Array.isArray(detail)) return "The server rejected some of your answers.";

  detail.forEach((err) => {
    const fieldName = err.loc && err.loc[err.loc.length - 1];
    if (fieldName && form.elements[fieldName]) {
      setFieldError(fieldName, err.msg || "Invalid value.");
    }
  });
  return "Please fix the highlighted fields and try again.";
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("is-loading", isLoading);
  submitBtn.querySelector(".btn-label").textContent = isLoading
    ? "Predicting…"
    : "Predict my score";
}

function scoreZone(score) {
  if (score >= 7) {
    return { color: "var(--good)", label: "Looking steady", copy: "Your habits line up with a healthier balance — keep an eye on what's working." };
  }
  if (score >= 5) {
    return { color: "var(--mid)", label: "Room to recalibrate", copy: "A few habits — sleep, screen time, or stress — may be pulling this down. Small adjustments could help." };
  }
  return { color: "var(--danger)", label: "Worth paying attention to", copy: "This estimate is on the lower end. Consider talking to someone you trust or a counselor about how you're doing." };
}

function renderResult(score) {
  const clamped = Math.max(0, Math.min(SCORE_MAX, score));
  const offset = GAUGE_CIRCUMFERENCE * (1 - clamped / SCORE_MAX);
  const zone = scoreZone(clamped);

  gaugeScore.textContent = score.toFixed(1);
  gaugeFill.style.stroke = zone.color;

  // Animate from full offset for a satisfying fill-in effect.
  gaugeFill.style.transition = "none";
  gaugeFill.style.strokeDashoffset = GAUGE_CIRCUMFERENCE;
  // Force reflow so the transition below actually animates.
  void gaugeFill.getBoundingClientRect();
  gaugeFill.style.transition = "";
  requestAnimationFrame(() => {
    gaugeFill.style.strokeDashoffset = offset;
  });

  resultLabel.textContent = zone.label;
  resultCopy.textContent = `${zone.copy} This is a machine-learning estimate, not a medical diagnosis.`;

  formCard.hidden = true;
  resultCard.hidden = false;
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showForm() {
  resultCard.hidden = true;
  formCard.hidden = false;
  formCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function submitPrediction(event) {
  event.preventDefault();
  hideApiBanner();

  if (!validateForm()) {
    showApiBanner("Some answers need a second look before we can predict.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });

    let body = null;
    try {
      body = await response.json();
    } catch (_) {
      // Non-JSON body — fall through to the generic error below.
    }

    if (!response.ok) {
      if (response.status === 422 && body && body.detail) {
        showApiBanner(applyServerValidationErrors(body.detail));
      } else if (body && typeof body.detail === "string") {
        showApiBanner(body.detail);
      } else {
        showApiBanner(`The server returned an error (status ${response.status}). Please try again.`);
      }
      return;
    }

    if (!body || typeof body.predicted_Mental_Health_Score !== "number") {
      showApiBanner("The server responded, but not with a score we recognize.");
      return;
    }

    renderResult(body.predicted_Mental_Health_Score);
  } catch (networkError) {
    showApiBanner(
      "Couldn't reach the prediction server. Make sure your FastAPI backend is running at " +
        API_BASE +
        " and that CORS is enabled."
    );
  } finally {
    setLoading(false);
  }
}

form.addEventListener("submit", submitPrediction);

// Clear a field's error as soon as the user edits it.
Object.keys(FIELD_RULES).forEach((name) => {
  form.elements[name].addEventListener("input", () => clearFieldError(name));
  form.elements[name].addEventListener("change", () => clearFieldError(name));
});

backBtn.addEventListener("click", showForm);
tryAgainBtn.addEventListener("click", showForm);
