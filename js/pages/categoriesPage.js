import { pageHeader } from "../components/pageHeader.js";
import { renderTable } from "../components/table.js";
import { openModal, openConfirm } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { escapeHtml } from "../utils/html.js";
import { createFormValidator, Rules } from "../utils/formValidator.js";
import { isAdmin } from "../utils/auth.js";
import {
  createCategorie,
  deleteCategorie,
  getCategories,
  updateCategorie,
} from "../services/categorieService.js";

// ─── Schéma de validation du formulaire catégorie ─────────────────────────

const CATEGORIE_SCHEMA = {
  categorieLibelle: {
    rules: [
      Rules.required("Le libellé est obligatoire."),
      Rules.minLength(2, "Le libellé doit contenir au moins 2 caractères."),
      Rules.maxLength(50, "Le libellé ne doit pas dépasser 50 caractères."),
    ],
    transform: (v) => v.trim(),
    as: "libelle",
  },
};

// ─── Corps du formulaire ──────────────────────────────────────────────────

function categorieFormBody(categorie = null) {
  return `
    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="categorieLibelle">
        Libellé <span class="text-rose-500">*</span>
      </label>
      <input
        class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        type="text"
        id="categorieLibelle"
        value="${escapeHtml(categorie?.libelle || "")}"
        placeholder="ex: Informatique"
        autocomplete="off"
      />
    </div>
  `;
}

// ─── Ouverture de la modale ───────────────────────────────────────────────

function openCategorieForm(categorie = null) {
  let validator;

  openModal({
    title: categorie ? "Modifier la catégorie" : "Nouvelle catégorie",
    icon: "fa-tag",
    body: categorieFormBody(categorie),
    confirmLabel: categorie ? "Enregistrer" : "Créer",

    onMount: (modal) => {
      validator = createFormValidator(modal, CATEGORIE_SCHEMA);
    },

    onConfirm: async () => {
      const data = validator.validate();
      if (!data) return false;

      try {
        if (categorie) {
          await updateCategorie(categorie.id, data);
          showToast("Catégorie modifiée avec succès.");
        } else {
          await createCategorie(data);
          showToast("Catégorie créée avec succès.");
        }

        await renderCategoriesPage();
        return true;
      } catch (error) {
        showToast(error.message, "error");
        return false;
      }
    },
  });
}

// ─── Rendu de la page ─────────────────────────────────────────────────────

export async function renderCategoriesPage() {
  const app   = document.getElementById("app");
  const admin = isAdmin();

  const categories = await getCategories();

  app.innerHTML = `
    <section>
      ${pageHeader({
        kicker: "Référentiel",
        title: "Catégories",
        subtitle: "Créer, modifier et supprimer les catégories de l'application.",
        actionLabel: admin ? "Nouvelle catégorie" : null,
        actionId:    admin ? "addCategorieBtn"    : null,
        actionIcon: "fa-plus",
      })}

      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-xl font-black text-slate-950">Liste des catégories</h2>
            <p class="text-sm text-slate-500">${categories.length} catégorie(s) enregistrée(s).</p>
          </div>
        </div>

        ${renderTable({
          rows: categories,
          emptyMessage: "Aucune catégorie enregistrée.",
          columns: [
            {
              label: "Libellé",
              render: (cat) => `<strong class="font-bold text-slate-950">${escapeHtml(cat.libelle)}</strong>`,
            },
            // ↓ colonne Actions uniquement pour l'admin
            ...(admin ? [{
              label: "Actions",
              render: (cat) => `
                <div class="flex flex-wrap gap-2">
                  <button class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" data-edit="${escapeHtml(cat.id)}">
                    <i class="fa-solid fa-pen"></i> Modifier
                  </button>
                  <button class="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700" data-delete="${escapeHtml(cat.id)}">
                    <i class="fa-solid fa-trash"></i> Supprimer
                  </button>
                </div>
              `,
            }] : []),
          ],
        })}
      </article>
    </section>
  `;

  if (admin) bindCategorieEvents(categories);
}

// ─── Événements ───────────────────────────────────────────────────────────

function bindCategorieEvents(categories) {
  document.getElementById("addCategorieBtn").addEventListener("click", () =>
    openCategorieForm()
  );

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const categorie = categories.find((c) => c.id === btn.dataset.edit);
      if (categorie) openCategorieForm(categorie);
    });
  });

  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openConfirm({
        message: "Voulez-vous supprimer cette catégorie ?",
        onConfirm: async () => {
          try {
            await deleteCategorie(btn.dataset.delete);
            showToast("Catégorie supprimée.");
            await renderCategoriesPage();
          } catch (error) {
            showToast(error.message, "error");
          }
        },
      });
    });
  });
}