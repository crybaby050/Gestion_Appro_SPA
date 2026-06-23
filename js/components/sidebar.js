const NAV_LINKS = [
  { page: "categories", label: "Catégories", icon: "fa-tags" },
  { page: "products", label: "Produits", icon: "fa-box" },

];

export function renderSidebar() {
  const items = NAV_LINKS.map((link) => `
    <button class="nav-link flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950" data-page="${link.page}">
      <i class="fa-solid ${link.icon} w-5 text-center"></i>
      <span>${link.label}</span>
    </button>
  `).join("");

  return `
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-40 w-72 -translate-x-full border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0">
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

      <div class="absolute bottom-5 w-full px-5">
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          <div class="mb-2 flex items-center gap-2 font-semibold text-slate-700">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            API JSON Server
          </div>
          <code class="rounded-lg bg-white px-2 py-1 text-[11px] text-slate-700">localhost:3000</code>
        </div>
      </div>
    </aside>

    <div id="sidebarOverlay" class="fixed inset-0 z-30 hidden bg-slate-950/40 backdrop-blur-sm lg:hidden"></div>
  `;
}