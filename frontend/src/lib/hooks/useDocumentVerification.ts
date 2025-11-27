import imageCompression from "browser-image-compression";
import { useState } from "react";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB em bytes
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
const MIN_ASPECT_RATIO = 0.5;
const MAX_ASPECT_RATIO = 3;

interface ImageQualityResult {
  isValid: boolean;
  error?: string;
}

interface UseDocumentVerificationReturn {
  processImage: (file: File, type: "document" | "selfie") => Promise<File>;
  isProcessing: boolean;
  processingProgress: number;
}

export const useDocumentVerification = (): UseDocumentVerificationReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  /**
   * Valida tipo e tamanho do arquivo
   */
  const validateFileBasics = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Formato de arquivo não suportado. Use apenas imagens JPG, PNG ou WEBP.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "A imagem é muito grande. Use imagens com no máximo 10MB.";
    }

    return null;
  };

  /**
   * Valida qualidade da imagem (resolução e aspect ratio)
   */
  const validateImageQuality = async (
    file: File,
    type: "document" | "selfie"
  ): Promise<ImageQualityResult> => {
    return new Promise(resolve => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        // Validação de resolução mínima
        if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
          resolve({
            isValid: false,
            error: `A imagem está com resolução muito baixa (${img.width}x${img.height}). Use uma foto mais nítida com pelo menos ${MIN_WIDTH}x${MIN_HEIGHT} pixels.`,
          });
          return;
        }

        // Validação de aspect ratio
        const aspectRatio = img.width / img.height;
        if (aspectRatio < MIN_ASPECT_RATIO || aspectRatio > MAX_ASPECT_RATIO) {
          resolve({
            isValid: false,
            error:
              type === "document"
                ? "Proporções da imagem inadequadas. Certifique-se de fotografar o documento completo e centralizado."
                : "Proporções da imagem inadequadas. Tire uma selfie com o rosto centralizado e visível.",
          });
          return;
        }

        // Validação específica para selfie (deve ser mais quadrada/vertical)
        if (type === "selfie" && aspectRatio > 1.5) {
          resolve({
            isValid: false,
            error:
              "A selfie parece muito alongada. Tire uma foto mais próxima do rosto em orientação vertical.",
          });
          return;
        }

        resolve({ isValid: true });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          isValid: false,
          error:
            "Não foi possível ler a imagem. Tente outra foto ou verifique se o arquivo não está corrompido.",
        });
      };

      img.src = objectUrl;
    });
  };

  /**
   * Comprime a imagem mantendo qualidade adequada
   */
  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 2, // Comprimir para no máximo 2MB
        maxWidthOrHeight: 1920, // Resolução máxima mantida
        useWebWorker: true,
        fileType: "image/jpeg", // Padroniza para JPEG (melhor compressão)
        initialQuality: 0.85, // Qualidade inicial
        onProgress: (progress: number) => {
          // Atualiza progresso da compressão (0-50% do total)
          setProcessingProgress(Math.round(progress * 0.5));
        },
      };

      const compressedFile = await imageCompression(file, options);

      // Renomeia o arquivo para manter extensão .jpg
      const newFileName = file.name.replace(/\.[^/.]+$/, ".jpg");
      return new File([compressedFile], newFileName, { type: "image/jpeg" });
    } catch (error) {
      console.error("Erro ao comprimir imagem:", error);
      throw new Error("Não foi possível comprimir a imagem. Tente novamente.");
    }
  };

  /**
   * Processa a imagem: valida, comprime e retorna arquivo otimizado
   */
  const processImage = async (file: File, type: "document" | "selfie"): Promise<File> => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // 1. Validação básica (tipo e tamanho) - 10% do progresso
      const basicValidation = validateFileBasics(file);
      if (basicValidation) {
        throw new Error(basicValidation);
      }
      setProcessingProgress(10);

      // 2. Validação de qualidade (resolução e aspect ratio) - 20% do progresso
      const qualityCheck = await validateImageQuality(file, type);
      if (!qualityCheck.isValid) {
        throw new Error(qualityCheck.error);
      }
      setProcessingProgress(20);

      // 3. Compressão da imagem - 20% a 70% do progresso (controlado pela lib)
      const compressed = await compressImage(file);
      setProcessingProgress(70);

      // 4. Validação final do arquivo comprimido - 90% do progresso
      const finalValidation = validateFileBasics(compressed);
      if (finalValidation) {
        throw new Error("Erro ao processar imagem. Tente novamente.");
      }
      setProcessingProgress(90);

      // 5. Concluído - 100%
      setProcessingProgress(100);

      console.log(`✅ Imagem processada com sucesso:`, {
        original: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        compressed: `${(compressed.size / 1024 / 1024).toFixed(2)}MB`,
        reduction: `${(((file.size - compressed.size) / file.size) * 100).toFixed(1)}%`,
      });

      return compressed;
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      throw error;
    } finally {
      setIsProcessing(false);
      // Reseta progresso após 1 segundo
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  };

  return {
    processImage,
    isProcessing,
    processingProgress,
  };
};
