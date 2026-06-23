import { ENDPOINTS } from "../config/api.js";
import { apiRequest } from "./apiClient.js";
import { createId } from "../utils/id.js";
import { required } from "../utils/validators.js";

function normalizeCategorie(data) {
  return {
    id: data.id,
    libelle: String(data.libelle).trim(),
  };
}

export async function getCategories() {
  return apiRequest(ENDPOINTS.categories, {}, "Impossible de charger les catégories.");
}

export async function createCategorie(data) {
  required(data.libelle, "Le libellé de la catégorie est obligatoire.");

  const categorie = normalizeCategorie({
    id: createId("cat"),
    ...data,
  });

  return apiRequest(
    ENDPOINTS.categories,
    {
      method: "POST",
      body: JSON.stringify(categorie),
    },
    "Impossible de créer la catégorie."
  );
}

export async function updateCategorie(id, data) {
  required(data.libelle, "Le libellé de la catégorie est obligatoire.");

  return apiRequest(
    `${ENDPOINTS.categories}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(normalizeCategorie({ id, ...data })),
    },
    "Impossible de modifier la catégorie."
  );
}

export async function deleteCategorie(id) {
  return apiRequest(
    `${ENDPOINTS.categories}/${id}`,
    {
      method: "DELETE",
    },
    "Impossible de supprimer la catégorie."
  );
}


