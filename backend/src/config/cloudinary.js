const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ========================================
// Storage para FOTOS DE RELÓGIOS (PÚBLICO)
// ========================================
const watchStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "nobile-relogios/watches",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
    resource_type: "image",
    // access_mode: 'public' (padrão - não precisa especificar)
  },
});

// ========================================
// Storage para DOCUMENTOS DE VERIFICAÇÃO (PRIVADO)
// ========================================
const verificationStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Pega o userId do token JWT (injetado pelo authMiddleware)
    const userId = req.user?.id || "unknown";

    return {
      folder: `nobile-relogios/verifications/${userId}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      // Maior qualidade para documentos (não redimensiona tanto)
      transformation: [
        { width: 1200, height: 1200, crop: "limit", quality: "auto:best" },
      ],
      resource_type: "image",

      // ⚠️ IMPORTANTE: Configuração de privacidade
      // Nota: O Cloudinary pode não suportar access_mode/type via multer-storage
      // Se der erro, remova essas linhas e configure via Dashboard
      // access_mode: 'authenticated',
      // type: 'private',

      // Adiciona metadados para auditoria
      context: {
        userId: userId.toString(),
        purpose: "user_verification",
        uploadedAt: new Date().toISOString(),
      },

      // Nome do arquivo com timestamp para evitar conflitos
      public_id: `${file.fieldname}_${Date.now()}`,
    };
  },
});

const uploadWatch = multer({ storage: watchStorage });
const uploadVerification = multer({ storage: verificationStorage });

module.exports = {
  cloudinary,
  uploadWatch, // Para fotos de relógios
  uploadVerification, // Para documentos de verificação
  upload: uploadWatch, // Mantém compatibilidade com código existente
};
