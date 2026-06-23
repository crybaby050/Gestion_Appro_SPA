import { uploadProductImage } from '../services/cloudinary.js';
import { showToast } from '../components/toast.js';


export function setupImageUpload(modal) {
    const fileInput = modal.querySelector("#productImageInput");
    const dropzone = modal.querySelector("#productImageDropzone");
    const preview = modal.querySelector("#productImagePreview");
    const previewImg = modal.querySelector("#productImagePreviewImg");
    const placeholder = modal.querySelector("#productImagePlaceholder");
    const loading = modal.querySelector("#productImageLoading");
    const errorElement = modal.querySelector("#productImageError");
    const removeBtn = modal.querySelector("#productImageRemoveBtn");
    const imageUrlInput = modal.querySelector("#productImageUrl");
    const imagePublicIdInput = modal.querySelector("#productImagePublicId");


// Fonction pour afficher l'aperçu
function showPreview(url) {
    previewImg.src = url;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    removeBtn.classList.remove('hidden');
    imageUrlInput.value = url;
}

// Fonction pour réinitialiser l'upload
function resetUpload() {
    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
    loading.classList.add('hidden');
    removeBtn.classList.add('hidden');
    imageUrlInput.value = '';
    imagePublicIdInput.value = '';
    fileInput.value = '';
    errorElement.classList.add('hidden');
}

// Fonction pour afficher une erreur dans l'élément dédié
function showError(message) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    setTimeout(() => errorElement.classList.add('hidden'), 5000);
}

  // ÉTAPE 1 : Clic sur la zone → ouvre le sélecteur de fichier
  dropzone.addEventListener('click', (e) => {
    // Si on clique sur le bouton supprimer, on ne fait rien
    if (e.target.closest('#productImageRemoveBtn')) return;
    fileInput.click();
  });

  // ÉTAPE 2 : Quand un fichier est sélectionné
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Afficher le chargement
    loading.classList.remove('hidden');
    placeholder.classList.add('hidden');
    preview.classList.add('hidden');
    errorElement.classList.add('hidden');

    try {
      // Upload vers Cloudinary
      const result = await uploadProductImage(file);
      
      // Afficher l'aperçu
      showPreview(result.imageUrl);
      imagePublicIdInput.value = result.imagePublicId;
      
      // Cacher le chargement
      loading.classList.add('hidden');
      
      // Notification de succès (avec ton toast)
      showToast("Image uploadée avec succès !", "success");
      
    } catch (error) {
      // En cas d'erreur
      loading.classList.add('hidden');
      placeholder.classList.remove('hidden');
      showError(error.message);
      
      // Afficher également un toast d'erreur
      showToast(error.message, "error");
      
      fileInput.value = ''; // Réinitialiser l'input
    }
  });

// ÉTAPE 3 : Supprimer l'image
removeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Empêcher l'ouverture du sélecteur
    openConfirm({
        message: "Voulez-vous vraiment supprimer cette image ?",
        confirmLabel: "Supprimer",
        onConfirm: () => {
            resetUpload();
            showToast("Image supprimée", "success");
            return true; // Important : retourner true pour fermer la modale
        }
    });
});

  // ÉTAPE 4 : Si une image existe déjà (mode édition), l'afficher
  if (imageUrlInput.value) {
    showPreview(imageUrlInput.value);
    imagePublicIdInput.value = imagePublicIdInput.value || '';
  }
}