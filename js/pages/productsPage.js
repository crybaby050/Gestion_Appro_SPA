// pages/productsPage.js

import { pageHeader } from "../components/pageHeader.js";
import { renderTable } from "../components/table.js";
import { openModal, openConfirm } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { escapeHtml } from "../utils/html.js";
import { getCategories } from "../services/categorieService.js";
import { createFormValidator, Rules } from "../utils/formValidator.js";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../services/productService.js";
import { setupImageUpload } from "../utils/uploadHandlers.js";

// ─── Schéma de validation du formulaire produit ───────────────────────────

const PRODUCT_SCHEMA = {
  productLibelle: {
    rules: [Rules.required("Le libellé est obligatoire.")],
    transform: (v) => v.trim(),
    as: "libelle",
  },
  productDescription: {
    rules: [],
    transform: (v) => v.trim(),
    as: "description",
  },
  productPrix: {
    rules: [
      Rules.required("Le prix est obligatoire."),
      Rules.numeric("Le prix doit être un nombre."),
      Rules.positive("Le prix doit être supérieur à 0."),
    ],
    transform: Number,
    as: "prix",
  },
  productCategorie: {
    rules: [],
    transform: (v) => v || null,
    as: "categorieId",
  },
};

// ─── Corps du formulaire ──────────────────────────────────────────────────

function productFormBody(product = null, categories = []) {
  const libelle        = product?.libelle        || "";
  const description    = product?.description    || "";
  const prix           = product?.prix           || "";
  const categorieId    = product?.categorieId    || "";
  const imageUrl       = product?.imageUrl       || "";
  const imagePublicId  = product?.imagePublicId  || "";

  const categoriesOptions = categories
    .map((cat) => `<option value="${cat.id}" ${cat.id == categorieId ? "selected" : ""}>${cat.libelle}</option>`)
    .join("");

  return `
    <div class="grid gap-4">
      <div>
        <label for="productLibelle" class="block text-sm font-bold text-slate-700 mb-1">
          Libellé <span class="text-rose-500">*</span>
        </label>
        <input 
          type="text" 
          id="productLibelle" 
          value="${libelle}"
          class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Nom du produit"
        >
      </div>

      <div>
        <label for="productDescription" class="block text-sm font-bold text-slate-700 mb-1">
          Description
        </label>
        <textarea 
          id="productDescription" 
          rows="3"
          class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Description du produit"
        >${description}</textarea>
      </div>

      <div>
        <label for="productPrix" class="block text-sm font-bold text-slate-700 mb-1">
          Prix (F) <span class="text-rose-500">*</span>
        </label>
        <input 
          type="number" 
          id="productPrix" 
          value="${prix}"
          step="0.01"
          min="0"
          class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="0.00"
        >
      </div>

      <div>
        <label for="productCategorie" class="block text-sm font-bold text-slate-700 mb-1">
          Catégorie
        </label>
        <select 
          id="productCategorie" 
          class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">Aucune catégorie</option>
          ${categoriesOptions}
        </select>
      </div>

      <div class="border-t border-slate-200 pt-4">
        <label class="block text-sm font-bold text-slate-700 mb-2">Image du produit</label>

        <input type="hidden" id="productImageUrl"      value="${imageUrl}">
        <input type="hidden" id="productImagePublicId" value="${imagePublicId}">

        <div class="relative">
          <input type="file" id="productImageInput" accept="image/*" class="hidden">

          <div
            id="productImageDropzone"
            class="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:bg-slate-100 cursor-pointer"
          >
            <div id="productImagePreview" class="${imageUrl ? "" : "hidden"} mb-3">
              <img id="productImagePreviewImg" src="${imageUrl}" alt="Aperçu" class="h-32 w-32 rounded-xl object-cover">
            </div>

            <div id="productImagePlaceholder" class="${imageUrl ? "hidden" : ""} text-center">
              <i class="fa-solid fa-cloud-upload-alt text-4xl text-slate-400 mb-2"></i>
              <p class="text-sm text-slate-600"><span class="font-bold text-indigo-600">Cliquez</span> pour choisir une image</p>
              <p class="text-xs text-slate-500">PNG, JPG, GIF jusqu'à 2 Mo</p>
            </div>

            <div id="productImageLoading" class="hidden">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                <span class="text-sm font-medium text-slate-600">Upload en cours...</span>
              </div>
            </div>
          </div>

          <button
            id="productImageRemoveBtn"
            type="button"
            class="${imageUrl ? "" : "hidden"} absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 transition hover:bg-rose-200"
            title="Supprimer l'image"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p id="productImageError" class="mt-2 hidden text-sm text-rose-600"></p>
      </div>
    </div>
  `;
}

// ─── Ouverture de la modale ───────────────────────────────────────────────

function openProductForm(product = null, categories = []) {
  let validator;

  openModal({
    title: product ? "Modifier le produit" : "Nouveau produit",
    icon: "fa-box",
    body: productFormBody(product, categories),
    confirmLabel: product ? "Enregistrer" : "Créer",

    onMount: (modal) => {
      setupImageUpload(modal);
      validator = createFormValidator(modal, PRODUCT_SCHEMA);
    },

    onConfirm: async (modal) => {
      const data = validator.validate();
      if (!data) return false; // erreurs affichées, on bloque la fermeture

      // Les champs image sont gérés par setupImageUpload, on les ajoute manuellement
      data.imageUrl      = modal.querySelector("#productImageUrl").value;
      data.imagePublicId = modal.querySelector("#productImagePublicId").value;

      try {
        if (product) {
          await updateProduct(product.id, data);
          showToast("Produit modifié avec succès.");
        } else {
          await createProduct(data);
          showToast("Produit créé avec succès.");
        }

        await renderProductsPage();
        return true;
      } catch (error) {
        showToast(error.message, "error");
        return false;
      }
    },
  });
}

// ─── Rendu de la page ─────────────────────────────────────────────────────

export async function renderProductsPage() {
  const app = document.getElementById("app");

  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.libelle]));

  app.innerHTML = `
    <section>
      ${pageHeader({
        kicker: "Catalogue",
        title: "Produits",
        subtitle: "Créer, modifier et supprimer les produits de l'application.",
        actionLabel: "Nouveau produit",
        actionId: "addProductBtn",
        actionIcon: "fa-plus",
      })}

      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-xl font-black text-slate-950">Liste des produits</h2>
            <p class="text-sm text-slate-500">${products.length} produit(s) enregistré(s).</p>
          </div>
        </div>

        ${renderTable({
          rows: products,
          emptyMessage: "Aucun produit enregistré.",
          columns: [
            {
              label: "Image",
              render: (p) =>
                p.imageUrl
                  ? `<img src="${p.imageUrl}" alt="${escapeHtml(p.libelle)}" class="h-12 w-12 rounded-xl object-cover">`
                  : `<div class="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><i class="fa-solid fa-image"></i></div>`,
            },
            {
              label: "Libellé",
              render: (p) => `<strong class="font-bold text-slate-950">${escapeHtml(p.libelle)}</strong>`,
            },
            {
              label: "Description",
              render: (p) =>
                p.description
                  ? `<span class="text-slate-500">${escapeHtml(p.description)}</span>`
                  : `<span class="text-slate-300 italic">—</span>`,
            },
            {
              label: "Prix",
              render: (p) =>
                `<span class="font-semibold text-indigo-600">${Number(p.prix).toLocaleString("fr-FR")} F</span>`,
            },
            {
              label: "Catégorie",
              render: (p) =>
                p.categorieId && categoryMap[p.categorieId]
                  ? `<span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">${escapeHtml(categoryMap[p.categorieId])}</span>`
                  : `<span class="text-slate-300 italic">—</span>`,
            },
            {
              label: "Actions",
              render: (p) => `
                <div class="flex flex-wrap gap-2">
                  <button class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" data-edit="${escapeHtml(p.id)}">
                    <i class="fa-solid fa-pen"></i> Modifier
                  </button>
                  <button class="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700" data-delete="${escapeHtml(p.id)}">
                    <i class="fa-solid fa-trash"></i> Supprimer
                  </button>
                </div>
              `,
            },
          ],
        })}
      </article>
    </section>
  `;

  bindProductEvents(products, categories);
}

// ─── Événements ───────────────────────────────────────────────────────────

function bindProductEvents(products, categories) {
  document.getElementById("addProductBtn").addEventListener("click", () =>
    openProductForm(null, categories)
  );

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = products.find((p) => p.id === btn.dataset.edit);
      if (product) openProductForm(product, categories);
    });
  });

  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openConfirm({
        message: "Voulez-vous supprimer ce produit ?",
        onConfirm: async () => {
          try {
            await deleteProduct(btn.dataset.delete);
            showToast("Produit supprimé.");
            await renderProductsPage();
          } catch (error) {
            showToast(error.message, "error");
          }
        },
      });
    });
  });
}