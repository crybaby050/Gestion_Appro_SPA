import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from "../config/cloudinary.js";

export async function uploadProductImage(file) {
  if (!file) return null;

  if (!file.type.startsWith("image/")) {
    throw new Error("Le fichier sélectionné doit être une image.");
  }

  const maxSize = 2 * 1024 * 1024; // 2 Mo

  if (file.size > maxSize) {
    throw new Error("L'image ne doit pas dépasser 2 Mo.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Erreur lors de l'envoi de l'image vers Cloudinary.");
  }

  return {
    imageUrl: data.secure_url,
    imagePublicId: data.public_id,
  };
}