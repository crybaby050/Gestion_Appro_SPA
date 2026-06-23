export function renderNavbar() {
  return `
    <header class="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:left-72">
      <div class="flex items-center gap-3">
        <button id="sidebarToggle" class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden" aria-label="Ouvrir le menu">
          <i class="fa-solid fa-bars"></i>
        </button>
        <div class="flex items-center gap-2 text-sm font-bold text-slate-500">
          <i class="fa-solid fa-house text-slate-400"></i>
          <span id="navbarTitle">Catégories</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <i class="fa-solid fa-user"></i>
        </div>
      </div>
    </header>
  `;
}