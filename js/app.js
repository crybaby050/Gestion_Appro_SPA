import { renderSidebar } from "./components/sidebar.js";
import { renderNavbar } from "./components/navbar.js";
import { navigate } from "./router.js";
import { requireAuth, isAdmin } from "./utils/auth.js";
import { logout } from "./services/authService.js";
import { renderLoginPage } from "./pages/loginPage.js";
import { showToast } from "./components/toast.js";

function mountLayout() {
  document.getElementById("sidebarRoot").innerHTML = renderSidebar();
  document.getElementById("navbarRoot").innerHTML  = renderNavbar();
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const toggle  = document.getElementById("sidebarToggle");

  const close = () => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  };

  toggle?.addEventListener("click", () => {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  });

  overlay?.addEventListener("click", close);

  return { close };
}

function initNavigation(sidebar) {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", async () => {
      await navigate(button.dataset.page);
      if (window.innerWidth < 1024) sidebar.close();
    });
  });
}

function initLogout() {
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    logout();
    showToast("Vous êtes déconnecté.");
    // Remonter la page de login
    startApp();
  });
}

export function startApp() {
  // Pas de session → afficher login
  if (!requireAuth()) {
    renderLoginPage();
    return;
  }

  // Restaurer le layout
  document.getElementById("app").className = "";
  document.body.className = "min-h-screen bg-slate-100 font-sans text-slate-900";

  mountLayout();
  const sidebar = initSidebar();
  initNavigation(sidebar);
  initLogout();

  // Page de démarrage selon rôle
  const defaultPage = isAdmin() ? "categories" : "products";
  navigate(defaultPage);
}

startApp();
window.addEventListener("app:login", () => startApp());