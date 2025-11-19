// --- Static location data (simplified) ---
const locationData = {
  "India": {
    code: "+91",
    states: {
      "Gujarat": ["Vaghodia", "Vadodara", "Ahmedabad"],
      "Maharashtra": ["Mumbai", "Pune"]
    }
  },
  "United States": {
    code: "+1",
    states: {
      "California": ["San Francisco", "Los Angeles"],
      "New York": ["New York City", "Buffalo"]
    }
  }
};

// --- Disposable email domains (sample) ---
const disposableDomains = [
  "tempmail.com", "10minutemail.com", "mailinator.com", "yopmail.com", "guerrillamail.com"
];

// --- Elements ---
const form = document.getElementById("registrationForm");
const formAlert = document.getElementById("formAlert");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const age = document.getElementById("age");
const genderError = document.getElementById("genderError");
const address = document.getElementById("address");

const country = document.getElementById("country");
const state = document.getElementById("state");
const city = document.getElementById("city");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const strengthBar = document.getElementById("strengthBar");
const strengthLabel = document.getElementById("strengthLabel");

const terms = document.getElementById("terms");
const successModal = document.getElementById("successModal");
const successClose = document.getElementById("successClose");

// --- Utility ---
function setError(inputEl, errorEl, msg) {
  const group = inputEl.closest(".form-group");
  if (msg) {
    group.classList.add("invalid");
    errorEl.textContent = msg;
  } else {
    group.classList.remove("invalid");
    errorEl.textContent = "";
  }
  updateSubmitButtonState();
}

function setGroupError(groupEl, errorEl, msg) {
  if (msg) {
    groupEl.classList.add("invalid");
    errorEl.textContent = msg;
  } else {
    groupEl.classList.remove("invalid");
    errorEl.textContent = "";
  }
  updateSubmitButtonState();
}

function showAlert(type, message) {
  formAlert.className = `alert ${type}`;
  formAlert.textContent = message;
}

function passwordStrength(pw) {
  // Criteria: length, lowercase, uppercase, number, symbol
  const lengthScore = pw.length >= 8 ? 1 : 0;
  const lower = /[a-z]/.test(pw) ? 1 : 0;
  const upper = /[A-Z]/.test(pw) ? 1 : 0;
  const number = /\d/.test(pw) ? 1 : 0;
  const symbol = /[^A-Za-z0-9]/.test(pw) ? 1 : 0;
  const score = lengthScore + lower + upper + number + symbol;

  if (score <= 2) return "weak";
  if (score === 3 || score === 4) return "medium";
  return "strong";
}

function renderStrength(pw) {
  const level = passwordStrength(pw);
  strengthBar.classList.remove("weak", "medium", "strong");
  if (level === "weak") {
    strengthBar.classList.add("weak");
    strengthLabel.textContent = "Strength: Weak";
  } else if (level === "medium") {
    strengthBar.classList.add("medium");
    strengthLabel.textContent = "Strength: Medium";
  } else {
    strengthBar.classList.add("strong");
    strengthLabel.textContent = "Strength: Strong";
  }
}

// --- Populate Country/State/City ---
function populateCountries() {
  Object.keys(locationData).forEach(c => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    country.appendChild(opt);
  });
}

function updateStates() {
  state.innerHTML = `<option value="">Select State</option>`;
  city.innerHTML = `<option value="">Select City</option>`;
  city.disabled = true;

  const selected = country.value;
  if (!selected) {
    state.disabled = true;
    return;
  }
  state.disabled = false;
  Object.keys(locationData[selected].states).forEach(s => {
    const opt = document.createElement("option");
    opt.value = s; opt.textContent = s;
    state.appendChild(opt);
  });
}

function updateCities() {
  city.innerHTML = `<option value="">Select City</option>`;
  const c = country.value;
  const s = state.value;
  if (!c || !s) {
    city.disabled = true;
    return;
  }
  city.disabled = false;
  locationData[c].states[s].forEach(cityName => {
    const opt = document.createElement("option");
    opt.value = cityName; opt.textContent = cityName;
    city.appendChild(opt);
  });
}

// --- Validation rules ---
function validateFirstName() {
  const el = document.getElementById("firstNameError");
  const value = firstName.value.trim();
  setError(firstName, el, value ? "" : "First name is required.");
}

function validateLastName() {
  const el = document.getElementById("lastNameError");
  const value = lastName.value.trim();
  setError(lastName, el, value ? "" : "Last name is required.");
}

function validateEmail() {
  const el = document.getElementById("emailError");
  const value = email.value.trim().toLowerCase();
  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (!basic) return setError(email, el, "Enter a valid email address.");
  const domain = value.split("@")[1] || "";
  if (disposableDomains.includes(domain)) {
    return setError(email, el, "Disposable email domains are not allowed.");
  }
  setError(email, el, "");
}

function validatePhone() {
  const el = document.getElementById("phoneError");
  const value = phone.value.trim();
  const selectedCountry = country.value;
  if (!value) return setError(phone, el, "Phone number is required.");
  if (selectedCountry) {
    const code = locationData[selectedCountry].code;
    if (!value.startsWith(code)) {
      return setError(phone, el, `Phone must start with ${code}.`);
    }
  }
  // basic sanity: allow +digits space digits
  if (!/^\+\d{1,3}\s?\d{6,15}$/.test(value)) {
    return setError(phone, el, "Enter a valid phone number with country code.");
  }
  setError(phone, el, "");
}

function validateGender() {
  const group = document.querySelector(".checkbox-group").closest(".form-group");
  const errorEl = document.getElementById("genderError");
  const checked = Array.from(document.querySelectorAll('input[name="gender"]')).filter(i => i.checked);
  setGroupError(group, errorEl, checked.length > 0 ? "" : "Please select at least one gender.");
}

function validatePassword() {
  const el = document.getElementById("passwordError");
  const value = password.value;
  if (!value) {
    renderStrength("");
    return setError(password, el, "");
  }
  renderStrength(value);
  // Optional minimum policy
  if (value.length < 8) return setError(password, el, "Password must be at least 8 characters.");
  setError(password, el, "");
}

function validateConfirmPassword() {
  const el = document.getElementById("confirmPasswordError");
  const value = confirmPassword.value;
  if (!value && password.value) return setError(confirmPassword, el, "Please confirm your password.");
  if (value && password.value && value !== password.value) {
    return setError(confirmPassword, el, "Passwords do not match.");
  }
  setError(confirmPassword, el, "");
}

function validateTerms() {
  const group = document.querySelector(".terms").closest(".form-group");
  const el = document.getElementById("termsError");
  setGroupError(group, el, terms.checked ? "" : "You must agree to the Terms & Conditions.");
}

function updateSubmitButtonState() {
  // Required: firstName, lastName, email, phone, gender, terms
  const requiredValid =
    firstName.value.trim() &&
    lastName.value.trim() &&
    email.value.trim() &&
    !document.getElementById("emailError").textContent &&
    phone.value.trim() &&
    !document.getElementById("phoneError").textContent &&
    Array.from(document.querySelectorAll('input[name="gender"]')).some(i => i.checked) &&
    terms.checked;

  submitBtn.disabled = !requiredValid;
}

// --- Events ---
document.addEventListener("DOMContentLoaded", () => {
  populateCountries();
  updateStates();

  // Field listeners
  firstName.addEventListener("input", validateFirstName);
  lastName.addEventListener("input", validateLastName);
  email.addEventListener("input", validateEmail);
  phone.addEventListener("input", validatePhone);
  password.addEventListener("input", () => { validatePassword(); validateConfirmPassword(); });
  confirmPassword.addEventListener("input", validateConfirmPassword);
  terms.addEventListener("change", validateTerms);

  country.addEventListener("change", () => { updateStates(); validatePhone(); });
  state.addEventListener("change", updateCities);

  // Initial check
  updateSubmitButtonState();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Run validations
  validateFirstName();
  validateLastName();
  validateEmail();
  validatePhone();
  validateGender();
  validatePassword();
  validateConfirmPassword();
  validateTerms();

  // Collect invalids
  const invalids = Array.from(document.querySelectorAll(".form-group.invalid"));
  if (invalids.length > 0) {
    showAlert("error", "Please correct the highlighted errors.");
    // Scroll to top alert for visibility
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  // Optional: simulate backend success
  showAlert("success", "Registration Successful! Your profile has been submitted successfully.");
  successModal.classList.remove("hidden");

  // Reset form after success
  form.reset();
  updateStates();
  updateSubmitButtonState();
  strengthBar.classList.remove("weak", "medium", "strong");
  strengthLabel.textContent = "Strength: —";
});

successClose.addEventListener("click", () => {
  successModal.classList.add("hidden");
});

resetBtn.addEventListener("click", () => {
  // Clear errors
  document.querySelectorAll(".form-group").forEach(g => g.classList.remove("invalid"));
  document.querySelectorAll(".error").forEach(e => e.textContent = "");
  showAlert("", "");
  strengthBar.classList.remove("weak", "medium", "strong");
  strengthLabel.textContent = "Strength: —";
  updateStates();
  updateSubmitButtonState();
});
