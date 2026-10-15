// Menu favorites and contact form checks for North Star Bakery.
const bakeryItems = [
  { id: "bread", name: "Breads" },
  { id: "signature", name: "Signature Loaf" },
  { id: "pastries", name: "Pastries" },
  { id: "cakes", name: "Cakes" }
];
const storageKeys = { favorites: "northStarFavorites", requestType: "northStarRequestType" };

function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.favorites) || "[]");
    return Array.isArray(saved) ? saved.filter(id => bakeryItems.some(item => item.id === id)) : [];
  } catch (error) { return []; }
}

function showFavorites(favorites) {
  const summary = document.getElementById("favorites-summary");
  const names = bakeryItems.filter(item => favorites.includes(item.id)).map(item => item.name);
  summary.textContent = names.length ? "Saved favorites: " + names.join(", ") : "No favorites saved yet.";
  document.querySelectorAll(".favorite-button").forEach(button => {
    button.setAttribute("aria-pressed", String(favorites.includes(button.dataset.item)));
  });
}

function setupFavorites() {
  const options = document.getElementById("favorite-options");
  if (!options) return;
  let favorites = readFavorites();
  bakeryItems.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "favorite-button";
    button.dataset.item = item.id;
    button.textContent = "♡ " + item.name;
    button.addEventListener("click", () => {
      favorites = favorites.includes(item.id) ? favorites.filter(id => id !== item.id) : [...favorites, item.id];
      try { localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites)); } catch (error) { /* Browser may block storage. */ }
      showFavorites(favorites);
    });
    options.appendChild(button);
  });
  showFavorites(favorites);
}

const validationFields = [
  { id: "customer-name", message: "Please enter your name (at least 2 characters).", valid: value => value.trim().length >= 2 },
  { id: "customer-email", message: "Enter a valid email address, like name@example.com.", valid: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) },
  { id: "request-type", message: "Please choose a request type.", valid: value => value !== "" },
  { id: "item-details", message: "Please add at least 8 characters about your request.", valid: value => value.trim().length >= 8 }
];

function checkField(rule) {
  const field = document.getElementById(rule.id);
  const good = rule.valid(field.value);
  let message = document.getElementById(rule.id + "-error");
  if (!message) {
    message = document.createElement("p");
    message.id = rule.id + "-error";
    message.className = "field-error";
    field.insertAdjacentElement("afterend", message);
  }
  message.textContent = good ? "" : rule.message;
  field.classList.toggle("invalid-field", !good);
  field.setAttribute("aria-invalid", String(!good));
  if (good) field.removeAttribute("aria-describedby");
  else field.setAttribute("aria-describedby", message.id);
  return good;
}

function setupForm() {
  const form = document.getElementById("request-form");
  if (!form) return;
  const type = document.getElementById("request-type");
  try {
    const savedType = localStorage.getItem(storageKeys.requestType);
    if (["pre-order", "question"].includes(savedType)) type.value = savedType;
  } catch (error) { /* Storage may be unavailable. */ }
  type.addEventListener("change", () => {
    try { localStorage.setItem(storageKeys.requestType, type.value); } catch (error) {}
  });
  validationFields.forEach(rule => {
    const field = document.getElementById(rule.id);
    field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => {
      if (field.getAttribute("aria-invalid") !== null) checkField(rule);
    });
  });
  form.addEventListener("submit", event => {
    event.preventDefault(); // This is a class demo, not a real ordering system.
    const results = validationFields.map(checkField);
    const status = document.getElementById("form-status");
    if (results.every(Boolean)) {
      status.textContent = "Your request looks good. This is a demo, so nothing was sent.";
      status.className = "form-status success";
    } else {
      status.textContent = "Please fix the highlighted fields before continuing.";
      status.className = "form-status";
      const firstInvalid = validationFields[results.indexOf(false)];
      document.getElementById(firstInvalid.id).focus();
    }
  });
}

setupFavorites();
setupForm();
