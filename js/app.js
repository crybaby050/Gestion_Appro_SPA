import { renderSidebar } from "./components/sidebar.js";
import { renderNavbar } from "./components/navbar.js";
import { navigate } from "./router.js";

function mountLayout() {
  document.getElementById("sidebarRoot").innerHTML = renderSidebar();
  document.getElementById("navbarRoot").innerHTML = renderNavbar();
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const toggle = document.getElementById("sidebarToggle");

  const close = () => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  };

  toggle.addEventListener("click", () => {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  });

  overlay.addEventListener("click", close);

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

function startApp() {
  mountLayout();
  const sidebar = initSidebar();
  initNavigation(sidebar);
  navigate("categories");
}

startApp();