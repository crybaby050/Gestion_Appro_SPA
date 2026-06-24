import { getSession, isAdmin } from "../utils/auth.js";

export function renderSidebar() {
  const admin = isAdmin();

  const NAV_LINKS = [
    { page: "products",      label: "Produits",      icon: "fa-box" },
    ...(admin ? [
      { page: "categories",   label: "Catégories",   icon: "fa-tags" },
      { page: "fournisseurs", label: "Fournisseurs", icon: "fa-truck" },
    ] : []),
  ];

  const items = NAV_LINKS.map((link) => `
    <button class="nav-link flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950" data-page="${link.page}">
      <i class="fa-solid ${link.icon} w-5 text-center"></i>
      <span>${link.label}</span>
    </button>
  `).join("");

  const session = getSession();
  const roleBadge = admin
    ? `<span class="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">Admin</span>`
    : `<span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">Fournisseur</span>`;

  return `
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0">
      <div class="flex items-center gap-3 px-5 py-5">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-sm font-black tracking-wide text-white shadow-lg shadow-indigo-200">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <div>
          <h1 class="text-lg font-extrabold tracking-tight text-slate-950">Gestion Appro</h1>
        </div>
      </div>

      <nav class="grid gap-2 px-4 pb-4" aria-label="Navigation principale">
        ${items}
      </nav>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Profil + Déconnexion -->
      <div class="border-t border-slate-100 p-4">
        <div class="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
            <i class="fa-solid fa-user text-sm"></i>
          </div>
          <div class="min-w-0">
            <p class="truncate text-xs font-bold text-slate-800">${escapeEmailForDisplay(session?.email)}</p>
            <div class="mt-0.5">${roleBadge}</div>
          </div>
        </div>
        <button id="logoutBtn" class="flex w-full items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
          Se déconnecter
        </button>
      </div>
    </aside>

    <div id="sidebarOverlay" class="fixed inset-0 z-30 hidden bg-slate-950/40 backdrop-blur-sm lg:hidden"></div>
  `;
}

function escapeEmailForDisplay(email) {
  return String(email ?? "").replace(/</g, "&lt;");
}