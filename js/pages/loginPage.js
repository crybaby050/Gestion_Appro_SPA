import { login } from "../services/authService.js";
import { showToast } from "../components/toast.js";

export function renderLoginPage() {
  const app = document.getElementById("app");

  // Masquer sidebar et navbar le temps du login
  document.getElementById("sidebarRoot").innerHTML = "";
  document.getElementById("navbarRoot").innerHTML = "";
  document.body.className = "min-h-screen bg-slate-100 font-sans text-slate-900";

  app.className = "flex min-h-screen items-center justify-center p-4";

  app.innerHTML = `
    <div class="w-full max-w-md">
      <!-- Logo / Brand -->
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-xl shadow-indigo-200">
          <i class="fa-solid fa-layer-group text-2xl text-white"></i>
        </div>
        <h1 class="text-3xl font-black tracking-tight text-slate-950">Gestion Appro</h1>
        <p class="mt-1 text-sm text-slate-500">Connectez-vous pour accéder à votre espace</p>
      </div>

      <!-- Card -->
      <div class="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <form id="loginForm" novalidate class="grid gap-5">

          <div>
            <label for="loginEmail" class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
              Adresse e-mail
            </label>
            <input
              type="email"
              id="loginEmail"
              autocomplete="email"
              placeholder="admin@horizon.com"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
            <p id="loginEmailError" class="mt-1 hidden text-xs text-rose-600"></p>
          </div>

          <div>
            <label for="loginPassword" class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
              Mot de passe
            </label>
            <div class="relative">
              <input
                type="password"
                id="loginPassword"
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
              <button
                type="button"
                id="togglePassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                aria-label="Afficher / masquer le mot de passe"
              >
                <i class="fa-solid fa-eye" id="togglePasswordIcon"></i>
              </button>
            </div>
            <p id="loginPasswordError" class="mt-1 hidden text-xs text-rose-600"></p>
          </div>

          <button
            type="submit"
            id="loginBtn"
            class="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <i class="fa-solid fa-arrow-right-to-bracket"></i>
            <span id="loginBtnText">Se connecter</span>
          </button>

        </form>
      </div>

      <!-- Aide -->
      <p class="mt-6 text-center text-xs text-slate-400">
        Contactez votre administrateur si vous avez perdu vos identifiants.
      </p>
    </div>
  `;

  bindLoginEvents();
}

function bindLoginEvents() {
  const form        = document.getElementById("loginForm");
  const emailInput  = document.getElementById("loginEmail");
  const passInput   = document.getElementById("loginPassword");
  const btn         = document.getElementById("loginBtn");
  const btnText     = document.getElementById("loginBtnText");
  const toggleBtn   = document.getElementById("togglePassword");
  const toggleIcon  = document.getElementById("togglePasswordIcon");

  // Afficher / masquer le mot de passe
  toggleBtn.addEventListener("click", () => {
    const isHidden = passInput.type === "password";
    passInput.type = isHidden ? "text" : "password";
    toggleIcon.className = isHidden ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
  });

  // Effacer erreurs à la saisie
  emailInput.addEventListener("input", () => clearError("loginEmail", "loginEmailError"));
  passInput.addEventListener("input",  () => clearError("loginPassword", "loginPasswordError"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email    = emailInput.value.trim();
    const password = passInput.value;

    let valid = true;

    if (!email) {
      showFieldError("loginEmail", "loginEmailError", "L'email est obligatoire.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError("loginEmail", "loginEmailError", "Adresse e-mail invalide.");
      valid = false;
    }

    if (!password) {
      showFieldError("loginPassword", "loginPasswordError", "Le mot de passe est obligatoire.");
      valid = false;
    }

    if (!valid) return;

    // État chargement
    btn.disabled = true;
    btnText.textContent = "Connexion en cours…";

    try {
      const user = await login(email, password);

      showToast(`Bienvenue, ${user.email} !`);

      // Recharger l'app avec la session active
      window.dispatchEvent(new CustomEvent("app:login"));

    } catch (error) {
      showToast(error.message, "error");
      btn.disabled = false;
      btnText.textContent = "Se connecter";
    }
  });
}

function showFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.add("!border-rose-400", "focus:!ring-rose-200");
  error.textContent = message;
  error.classList.remove("hidden");
}

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.remove("!border-rose-400", "focus:!ring-rose-200");
  error.classList.add("hidden");
}