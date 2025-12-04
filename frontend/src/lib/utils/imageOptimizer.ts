/**
 * Helper para otimização de imagens antes do upload
 * - Redimensiona imagens mantendo aspect ratio
 * - Converte para WebP (melhor compressão)
 * - Comprime com qualidade ajustável
 */

interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 a 1
  outputFormat?: "image/webp" | "image/jpeg" | "image/png";
}

interface OptimizationResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  dimensions: {
    width: number;
    height: number;
  };
}

const DEFAULT_OPTIONS: Required<OptimizeImageOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  outputFormat: "image/webp",
};

/**
 * Otimiza uma imagem redimensionando e comprimindo
 */
export async function optimizeImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<OptimizationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Não foi possível criar contexto do canvas"));
      return;
    }

    img.onload = () => {
      try {
        // Calcula novas dimensões mantendo aspect ratio
        let { width, height } = img;

        if (width > opts.maxWidth || height > opts.maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = Math.min(width, opts.maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, opts.maxHeight);
            width = height * aspectRatio;
          }
        }

        // Arredonda para inteiros
        width = Math.round(width);
        height = Math.round(height);

        // Configura canvas
        canvas.width = width;
        canvas.height = height;

        // Desenha imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Converte para blob
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error("Falha ao converter imagem"));
              return;
            }

            // Determina extensão baseado no formato
            const extension = opts.outputFormat.split("/")[1];
            const newFileName = file.name.replace(/\.\w+$/, `.${extension}`);

            // Cria novo arquivo
            const optimizedFile = new File([blob], newFileName, {
              type: opts.outputFormat,
              lastModified: Date.now(),
            });

            const result: OptimizationResult = {
              file: optimizedFile,
              originalSize: file.size,
              optimizedSize: optimizedFile.size,
              compressionRatio: Number(
                ((1 - optimizedFile.size / file.size) * 100).toFixed(1)
              ),
              dimensions: { width, height },
            };

            // Libera memória
            URL.revokeObjectURL(img.src);

            resolve(result);
          },
          opts.outputFormat,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Erro ao carregar imagem"));
    };

    // Carrega imagem
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Valida se o arquivo é uma imagem válida
 */
export function validateImageFile(
  file: File,
  options: {
    maxSize?: number; // em bytes
    allowedFormats?: string[];
    minWidth?: number;
    minHeight?: number;
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB padrão
    allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  } = options;

  return new Promise(resolve => {
    // Valida formato
    if (!allowedFormats.includes(file.type)) {
      resolve({
        valid: false,
        error: `Formato não permitido. Use: ${allowedFormats
          //@ts-ignore
          .map(f => f.split("/")[1].toUpperCase())
          .join(", ")}`,
      });
      return;
    }

    // Valida tamanho
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      resolve({
        valid: false,
        error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB`,
      });
      return;
    }

    // Valida dimensões (se especificado)
    if (options.minWidth || options.minHeight) {
      const img = new window.Image();

      img.onload = () => {
        if (options.minWidth && img.width < options.minWidth) {
          resolve({
            valid: false,
            error: `Largura mínima: ${options.minWidth}px`,
          });
          return;
        }

        if (options.minHeight && img.height < options.minHeight) {
          resolve({
            valid: false,
            error: `Altura mínima: ${options.minHeight}px`,
          });
          return;
        }

        URL.revokeObjectURL(img.src);
        resolve({ valid: true });
      };

      img.onerror = () => {
        resolve({
          valid: false,
          error: "Arquivo de imagem inválido ou corrompido",
        });
      };

      img.src = URL.createObjectURL(file);
    } else {
      resolve({ valid: true });
    }
  });
}

/**
 * Formata tamanho de arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Cria preview de imagem a partir de File
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result));
    };

    reader.onerror = () => {
      reject(new Error("Erro ao criar preview da imagem"));
    };

    reader.readAsDataURL(file);
  });
}
