import { ENDPOINTS } from "../config/api.js";
import { apiRequest } from "./apiClient.js";
import { createId } from "../utils/id.js";
import { required } from "../utils/validators.js";

function normalizeProduct(data) {
  return {
    id: data.id,
    libelle: String(data.libelle).trim(),
    description: String(data.description ?? "").trim(),
    prix: Number(data.prix),
    categorieId: data.categorieId ?? null,
    imageUrl: data.imageUrl ?? "",
    imagePublicId: data.imagePublicId ?? "",
  };
}

export async function getProducts() {
  return apiRequest(ENDPOINTS.products, {}, "Impossible de charger les produits.");
}

export async function createProduct(data) {
  required(data.libelle, "Le libellé du produit est obligatoire.");
  required(data.prix, "Le prix du produit est obligatoire.");

  const product = normalizeProduct({
    id: createId("prod"),
    ...data,
  });

  return apiRequest(
    ENDPOINTS.products,
    {
      method: "POST",
      body: JSON.stringify(product),
    },
    "Impossible de créer le produit."
  );
}

export async function updateProduct(id, data) {
  required(data.libelle, "Le libellé du produit est obligatoire.");
  required(data.prix, "Le prix du produit est obligatoire.");

  return apiRequest(
    `${ENDPOINTS.products}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(normalizeProduct({ id, ...data })),
    },
    "Impossible de modifier le produit."
  );
}

export async function deleteProduct(id) {
  return apiRequest(
    `${ENDPOINTS.products}/${id}`,
    {
      method: "DELETE",
    },
    "Impossible de supprimer le produit."
  );
}