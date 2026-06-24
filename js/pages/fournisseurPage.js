import { pageHeader } from "../components/pageHeader.js";
import { renderTable } from "../components/table.js";
import { openModal, openConfirm } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { escapeHtml } from "../utils/html.js";
import { isAdmin } from "../utils/auth.js";
import { apiRequest } from "../services/apiClient.js";
import { ENDPOINTS } from "../config/api.js";
import { createId } from "../utils/id.js";
import { Rules, createFormValidator } from "../utils/formValidator.js";

//  Service inline fournisseurs 

async function getFournisseurs() {
  // On joint les données user pour afficher l'email
  const [fournisseurs, users] = await Promise.all([
    apiRequest(ENDPOINTS.fournisseurs, {}, "Impossible de charger les fournisseurs."),
    apiRequest(ENDPOINTS.users, {}, "Impossible de charger les utilisateurs."),
  ]);

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return fournisseurs.map((f) => ({
    ...f,
    email: userMap[f.userId]?.email ?? "—",
  }));
}

async function createFournisseur({ nom, telephone, adresse, email, password }) {
  // 1. Créer le user avec role fournisseur
  const user = await apiRequest(
    ENDPOINTS.users,
    {
      method: "POST",
      body: JSON.stringify({
        id: createId("user"),
        email,
        password,
        role: "fournisseur",
        createdAt: new Date().toISOString(),
      }),
    },
    "Impossible de créer le compte fournisseur."
  );

  // 2. Créer la fiche fournisseur liée
  return apiRequest(
    ENDPOINTS.fournisseurs,
    {
      method: "POST",
      body: JSON.stringify({
        id: createId("fourn"),
        userId: user.id,
        nom,
        telephone,
        adresse,
      }),
    },
    "Impossible de créer le fournisseur."
  );
}

async function updateFournisseur(id, data) {
  return apiRequest(
    `${ENDPOINTS.fournisseurs}/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    "Impossible de modifier le fournisseur."
  );
}

async function deleteFournisseur(id, userId) {
  await apiRequest(
    `${ENDPOINTS.fournisseurs}/${id}`,
    { method: "DELETE" },
    "Impossible de supprimer le fournisseur."
  );
  // Supprimer aussi le user lié
  await apiRequest(
    `${ENDPOINTS.users}/${userId}`,
    { method: "DELETE" },
    "Impossible de supprimer le compte lié."
  );
}

//  Schéma de validation 

const SCHEMA_CREATE = {
  fournNom:       { rules: [Rules.required("Le nom est obligatoire.")], transform: (v) => v.trim(), as: "nom" },
  fournTelephone: { rules: [], transform: (v) => v.trim(), as: "telephone" },
  fournAdresse:   { rules: [], transform: (v) => v.trim(), as: "adresse" },
  fournEmail:     { rules: [Rules.required("L'email est obligatoire."), Rules.email()], transform: (v) => v.trim(), as: "email" },
  fournPassword:  { rules: [Rules.required("Le mot de passe est obligatoire."), Rules.minLength(6, "Minimum 6 caractères.")], transform: (v) => v, as: "password" },
};

const SCHEMA_EDIT = {
  fournNom:       { rules: [Rules.required("Le nom est obligatoire.")], transform: (v) => v.trim(), as: "nom" },
  fournTelephone: { rules: [], transform: (v) => v.trim(), as: "telephone" },
  fournAdresse:   { rules: [], transform: (v) => v.trim(), as: "adresse" },
};

//  Formulaire 

function fournisseurFormBody(fournisseur = null) {
  const isEdit = fournisseur !== null;

  return `
    <div class="grid gap-4">
      <div>
        <label for="fournNom" class="mb-1 block text-sm font-bold text-slate-700">Nom complet <span class="text-rose-500">*</span></label>
        <input type="text" id="fournNom" value="${escapeHtml(fournisseur?.nom || "")}" placeholder="ex: Aliou Diallo"
          class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
      </div>
      <div>
        <label for="fournTelephone" class="mb-1 block text-sm font-bold text-slate-700">Téléphone</label>
        <input type="tel" id="fournTelephone" value="${escapeHtml(fournisseur?.telephone || "")}" placeholder="+221 77 000 00 00"
          class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
      </div>
      <div>
        <label for="fournAdresse" class="mb-1 block text-sm font-bold text-slate-700">Adresse</label>
        <input type="text" id="fournAdresse" value="${escapeHtml(fournisseur?.adresse || "")}" placeholder="Dakar, Médina"
          class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
      </div>

      ${!isEdit ? `
        <div class="border-t border-slate-100 pt-4">
          <p class="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Compte de connexion</p>
          <div class="grid gap-4">
            <div>
              <label for="fournEmail" class="mb-1 block text-sm font-bold text-slate-700">Email <span class="text-rose-500">*</span></label>
              <input type="email" id="fournEmail" placeholder="fournisseur@email.com"
                class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
            </div>
            <div>
              <label for="fournPassword" class="mb-1 block text-sm font-bold text-slate-700">Mot de passe <span class="text-rose-500">*</span></label>
              <input type="password" id="fournPassword" placeholder="Minimum 6 caractères"
                class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
            </div>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function openFournisseurForm(fournisseur = null) {
  const isEdit = fournisseur !== null;
  const schema = isEdit ? SCHEMA_EDIT : SCHEMA_CREATE;
  let validator;

  openModal({
    title: isEdit ? "Modifier le fournisseur" : "Nouveau fournisseur",
    icon: "fa-truck",
    body: fournisseurFormBody(fournisseur),
    confirmLabel: isEdit ? "Enregistrer" : "Créer",

    onMount: (modal) => {
      validator = createFormValidator(modal, schema);
    },

    onConfirm: async () => {
      const data = validator.validate();
      if (!data) return false;

      try {
        if (isEdit) {
          await updateFournisseur(fournisseur.id, data);
          showToast("Fournisseur modifié avec succès.");
        } else {
          await createFournisseur(data);
          showToast("Fournisseur créé avec succès.");
        }
        await renderFournisseursPage();
        return true;
      } catch (error) {
        showToast(error.message, "error");
        return false;
      }
    },
  });
}

//  Rendu de la page 

export async function renderFournisseursPage() {
  const app = document.getElementById("app");
  const admin = isAdmin();

  const fournisseurs = await getFournisseurs();

  app.innerHTML = `
    <section>
      ${pageHeader({
        kicker: "Annuaire",
        title: "Fournisseurs",
        subtitle: "Gérer les fournisseurs et leurs comptes d'accès.",
        actionLabel: admin ? "Nouveau fournisseur" : null,
        actionId: admin ? "addFournisseurBtn" : null,
        actionIcon: "fa-plus",
      })}

      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-xl font-black text-slate-950">Liste des fournisseurs</h2>
            <p class="text-sm text-slate-500">${fournisseurs.length} fournisseur(s) enregistré(s).</p>
          </div>
        </div>

        ${renderTable({
          rows: fournisseurs,
          emptyMessage: "Aucun fournisseur enregistré.",
          columns: [
            { label: "Nom",       render: (f) => `<strong class="font-bold text-slate-950">${escapeHtml(f.nom)}</strong>` },
            { label: "Email",     render: (f) => `<span class="text-slate-600">${escapeHtml(f.email)}</span>` },
            { label: "Téléphone", render: (f) => f.telephone ? escapeHtml(f.telephone) : `<span class="italic text-slate-300">—</span>` },
            { label: "Adresse",   render: (f) => f.adresse   ? escapeHtml(f.adresse)   : `<span class="italic text-slate-300">—</span>` },
            ...(admin ? [{
              label: "Actions",
              render: (f) => `
                <div class="flex flex-wrap gap-2">
                  <button class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" data-edit="${escapeHtml(f.id)}">
                    <i class="fa-solid fa-pen"></i> Modifier
                  </button>
                  <button class="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700" data-delete="${escapeHtml(f.id)}" data-user="${escapeHtml(f.userId)}">
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

  if (admin) bindFournisseurEvents(fournisseurs);
}

function bindFournisseurEvents(fournisseurs) {
  document.getElementById("addFournisseurBtn")?.addEventListener("click", () => openFournisseurForm());

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = fournisseurs.find((item) => item.id === btn.dataset.edit);
      if (f) openFournisseurForm(f);
    });
  });

  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openConfirm({
        message: "Supprimer ce fournisseur et son compte de connexion ?",
        confirmLabel: "Supprimer",
        onConfirm: async () => {
          try {
            await deleteFournisseur(btn.dataset.delete, btn.dataset.user);
            showToast("Fournisseur supprimé.");
            await renderFournisseursPage();
          } catch (error) {
            showToast(error.message, "error");
          }
        },
      });
    });
  });
}