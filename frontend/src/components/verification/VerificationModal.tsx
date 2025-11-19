"use client";

import { Button, Icon } from "@/components/ui";
import { authService } from "@/lib/services/auth.service";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Camera } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSubmitted?: () => void;
}

type VerificationStep = "intro" | "document-upload" | "selfie-upload" | "analysis";

interface DocumentImages {
  front: File | null;
  back: File | null;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB em bytes

const validateImageFile = (file: File): string | null => {
  // Valida tipo de arquivo
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Formato de arquivo não suportado. Por favor, use apenas imagens JPG, PNG ou WEBP.";
  }

  // Valida tamanho do arquivo
  if (file.size > MAX_FILE_SIZE) {
    return "A imagem é muito grande. Por favor, use imagens com no máximo 10MB.";
  }

  return null; // Arquivo válido
};

export function VerificationModal({
  isOpen,
  onClose,
  onVerificationSubmitted,
}: VerificationModalProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>("intro");

  const [documentImages, setDocumentImages] = useState<DocumentImages>({
    front: null,
    back: null,
  });
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [documentFrontPreview, setDocumentFrontPreview] = useState<string>("");
  const [documentBackPreview, setDocumentBackPreview] = useState<string>("");
  const [selfiePreview, setSelfiePreview] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const resetModal = () => {
    setCurrentStep("intro");
    setDocumentImages({ front: null, back: null });
    setSelfieImage(null);
    setDocumentFrontPreview("");
    setDocumentBackPreview("");
    setSelfiePreview("");
    setError("");
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  const handleDocumentUpload = (side: "front" | "back", file: File) => {
    // Valida o arquivo antes de fazer upload
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Limpa erro anterior se houver
    setError("");

    setDocumentImages(prev => ({ ...prev, [side]: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === "front") {
        setDocumentFrontPreview(reader.result as string);
      } else {
        setDocumentBackPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelfieUpload = (file: File) => {
    // Valida o arquivo antes de fazer upload
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Limpa erro anterior se houver
    setError("");

    setSelfieImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelfiePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDocuments = () => {
    if (documentImages.front && documentImages.back) {
      setCurrentStep("selfie-upload");
      setError("");
    }
  };

  const getErrorMessage = (error: any): string => {
    // Erro de rede/conexão
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.";
    }

    const status = error.response?.status;
    const errorData = error.response?.data;

    switch (status) {
      case 400:
        // Arquivos faltando ou inválidos
        // Mensagem da API: "É necessário enviar 3 imagens: documentFront, documentBack e selfie."
        return (
          errorData?.error ||
          "Os arquivos enviados são inválidos. Certifique-se de enviar a frente e verso do documento e uma selfie."
        );

      case 401:
        // Não autenticado
        // Mensagem da API: "Token de autenticação não fornecido."
        return "Sua sessão expirou. Por favor, faça login novamente para continuar.";

      case 403:
        // Token inválido
        // Mensagem da API: "Token inválido ou expirado."
        return "Sua sessão é inválida. Por favor, faça login novamente para continuar.";

      case 413:
        // Arquivo muito grande (limite: 10MB por imagem)
        return "Uma ou mais imagens são muito grandes. Por favor, use imagens com no máximo 10MB cada.";

      case 415:
        // Formato não suportado (aceitos: JPG, PNG, WEBP)
        return "Formato de arquivo não suportado. Por favor, use apenas imagens JPG, PNG ou WEBP.";

      case 500:
        // Erro interno do servidor
        // Mensagem da API: "Erro ao enviar documentos de verificação." + details
        const details = errorData?.details;
        return details
          ? `Erro no servidor: ${details}. Tente novamente em alguns instantes.`
          : "Ocorreu um erro ao processar seus documentos. Por favor, tente novamente em alguns instantes.";

      default:
        // Erro genérico - usa mensagem da API ou fallback
        return (
          errorData?.error ||
          errorData?.message ||
          "Erro ao enviar documentos. Por favor, tente novamente."
        );
    }
  };

  const handleSubmitSelfie = async () => {
    if (!selfieImage || !documentImages.front || !documentImages.back) {
      setError("Por favor, envie todos os documentos necessários.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const shouldMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

      const response = shouldMock
        ? await Promise.resolve({ status: 200, message: "Mocked verification success" })
        : await authService.submitVerification(
            documentImages.front,
            documentImages.back,
            selfieImage
          );

      console.log("✅ Verificação enviada com sucesso:", response);

      setCurrentStep("analysis");
    } catch (err) {
      console.error("Erro ao enviar verificação:", err);

      // Obtém mensagem de erro específica baseada no status HTTP
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      // Se for erro de autenticação (401/403), podemos adicionar lógica adicional
      const status = (err as any).response?.status;
      if (status === 401 || status === 403) {
        // Log para debug - em produção, pode-se adicionar redirect ou toast
        console.warn(
          "⚠️ Erro de autenticação detectado. Usuário precisa fazer login novamente."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    onClose();
    resetModal();
    if (onVerificationSubmitted) {
      onVerificationSubmitted();
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    onClose();
    resetModal();
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case "intro":
        return "01/02";
      case "document-upload":
        return "01/02";
      case "selfie-upload":
        return "02/02";
      case "analysis":
        return "02/02";
      default:
        return "01/02";
    }
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-150 focus:outline-none"
      onClose={isSubmitting ? () => {} : handleClose}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 z-150 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center lg:p-4">
          <DialogPanel
            transition
            className="w-full h-full lg:h-auto max-w-fit rounded-xl lg:rounded-[32px] bg-white backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 flex flex-col lg:block"
          >
            {/* Conteúdo com scroll em mobile */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-10 lg:p-12">
                {currentStep !== "analysis" && (
                  <button
                    onClick={handleClose}
                    className="absolute right-5 top-5 lg:right-12 lg:top-12 w-auto bg-transparent"
                    aria-label="Fechar"
                    disabled={isSubmitting}
                  >
                    <Image src="/icons/close-icon.svg" alt="" width={38} height={38} />
                  </button>
                )}

                {currentStep === "intro" && (
                  <div className="max-w-3xl flex flex-col gap-8 items-center lg:items-start">
                    <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-start">
                      <div className="flex justify-between lg:items-start">
                        <div className="relative w-44 h-30 lg:w-32 lg:h-25">
                          <Image
                            src="/images/seller/seller-verification-illustration.svg"
                            alt="Verificação de Vendedor"
                            fill
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between lg:h-5 w-full">
                        <h3 className="text-2xl">
                          Verificação rápida e segura para vendedores
                        </h3>

                        <div className="hidden lg:flex justify-end">
                          <span className="text-sm font-light">{getStepNumber()}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-light text-gray-400 leading-relaxed max-w-[650px] mb-2">
                          Para garantir um ambiente confiável e proteger todos os
                          envolvidos, solicitamos uma verificação simples e segura antes
                          de ativar sua conta como vendedor.
                        </p>
                        <p className="text-sm font-light text-gray-400 leading-relaxed">
                          Esse processo leva apenas alguns minutos e é essencial para
                          manter a transparência e autenticidade da nossa comunidade.
                        </p>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-5">
                      <p className="font-erstoria text-base leading-[20px] text-center lg:text-left">
                        O que você precisa enviar:
                      </p>
                      <div className="grid grid-cols-2 gap-4 lg:gap-6">
                        <div className="flex flex-col items-center justify-center gap-2 lg:gap-3 px-5 py-4 lg:px-12 bg-[#F7F7F7] rounded-xl lg:h-[203px]">
                          <Icon
                            src="/icons/id-card.svg"
                            alt="Id card"
                            size={32}
                            className="[filter:invert(69%)_sepia(68%)_saturate(394%)_hue-rotate(14deg)_brightness(91%)_contrast(93%)]"
                          />
                          <span className="text-xs lg:text-sm leading-[22px] text-center">
                            Uma foto do seu documento oficial com foto (RG ou CNH).
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2 lg:gap-3 px-5 py-4 lg:px-12 bg-[#F7F7F7] rounded-xl lg:h-[203px]">
                          <Icon
                            src="/icons/user-square.svg"
                            alt="User square"
                            size={32}
                            className="[filter:invert(69%)_sepia(68%)_saturate(394%)_hue-rotate(14deg)_brightness(91%)_contrast(93%)]"
                          />
                          <span className="text-xs lg:text-sm leading-[22px] text-center">
                            Uma selfie sua para a verificação do seu rosto.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Document Upload */}
                {currentStep === "document-upload" && (
                  <div className="w-full lg:w-3xl max-w-3xl space-y-8">
                    <div className="space-y-4">
                      <div className="hidden lg:block relative w-32 h-25">
                        <Image
                          src="/images/seller/seller-verification-illustration.svg"
                          alt="Verificação de Vendedor"
                          fill
                        />
                      </div>

                      <div className="flex items-center justify-between lg:h-5">
                        <h3 className="text-2xl">Envie uma foto do seu documento</h3>

                        <div className="hidden lg:flex justify-end">
                          <span className="text-sm font-light">{getStepNumber()}</span>
                        </div>
                      </div>
                      <div className="">
                        <p className="text-sm font-light text-gray-500 leading-relaxed lg:max-w-[600px]">
                          Para garantir uma verificação rápida e segura, envie uma foto
                          nítida, legível e bem iluminada do seu documento.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      {/* Frente */}
                      <label className="block">
                        <span className="font-erstoria block text-base font-normal text-pb-500 mb-2">
                          Frente
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleDocumentUpload("front", file);
                          }}
                          className="hidden"
                          id="document-front"
                        />
                        {!documentFrontPreview ? (
                          <label
                            htmlFor="document-front"
                            className="flex flex-col items-center justify-center gap-2 w-full h-[203px] rounded-xl cursor-pointer bg-[#F7F7F7]"
                          >
                            <Camera className="w-6 h-6 text-[#D5A60A]" />
                            <span className="text-sm text-gray-400 leading-[22px] text-center">
                              Fotografar frente do documento.
                            </span>
                          </label>
                        ) : (
                          <div className="relative w-full h-[203px] rounded-lg overflow-hidden">
                            <Image
                              src={documentFrontPreview}
                              alt="Frente do documento"
                              fill
                              className="object-contain"
                            />
                            <button
                              onClick={() => {
                                setDocumentImages(prev => ({ ...prev, front: null }));
                                setDocumentFrontPreview("");
                              }}
                              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                            >
                              <Image
                                src="/icons/close-icon.svg"
                                alt="Remover"
                                width={20}
                                height={20}
                              />
                            </button>
                          </div>
                        )}
                      </label>

                      {/* Verso */}
                      <label className="block">
                        <span className="font-erstoria block text-base font-normal text-pb-500 mb-2">
                          Verso
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleDocumentUpload("back", file);
                          }}
                          className="hidden"
                          id="document-back"
                        />
                        {!documentBackPreview ? (
                          <label
                            htmlFor="document-back"
                            className="flex flex-col items-center justify-center gap-2 w-full h-[203px] rounded-xl cursor-pointer bg-[#F7F7F7]"
                          >
                            <Camera className="w-6 h-6 text-[#D5A60A]" />
                            <span className="text-sm text-gray-400 leading-[22px] text-center">
                              Fotografar verso do documento.
                            </span>
                          </label>
                        ) : (
                          <div className="relative w-full h-[203px] rounded-lg overflow-hidden">
                            <Image
                              src={documentBackPreview}
                              alt="Verso do documento"
                              fill
                              className="object-contain"
                            />
                            <button
                              onClick={() => {
                                setDocumentImages(prev => ({ ...prev, back: null }));
                                setDocumentBackPreview("");
                              }}
                              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                            >
                              <Image
                                src="/icons/close-icon.svg"
                                alt="Remover"
                                width={20}
                                height={20}
                              />
                            </button>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step Selfie Upload */}
                {currentStep === "selfie-upload" && (
                  <div className="w-[603px] space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center justify-center size-[64px] bg-[#f8f2dc] rounded-full">
                          <Icon
                            src="/icons/user-square.svg"
                            alt="User square"
                            size={32}
                            className="[filter:invert(69%)_sepia(68%)_saturate(394%)_hue-rotate(14deg)_brightness(91%)_contrast(93%)]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between h-4">
                        <h3 className="text-2xl">Envio da selfie para verificação</h3>
                        <span className="text-sm font-light">{getStepNumber()}</span>
                      </div>

                      <div className="w-full lg:max-w-[420px]">
                        <p className="text-sm font-light leading-relaxed">
                          Para validar sua identidade com segurança, pedimos que você
                          envie uma selfie recente e nítida do seu rosto.
                        </p>
                      </div>
                    </div>

                    {/* Selfie upload */}
                    <div>
                      <label className="block">
                        <span className="font-erstoria block text-base font-normal text-pb-500 mb-2">
                          Sua foto
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          capture="user"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleSelfieUpload(file);
                          }}
                          className="hidden"
                          id="selfie"
                          disabled={isSubmitting}
                        />
                        {!selfiePreview ? (
                          <label
                            htmlFor="selfie"
                            className="flex flex-col items-center justify-center w-full h-82 rounded-xl cursor-pointer bg-[#F7F7F7"
                          >
                            <div className="flex flex-col items-center gap-2.5">
                              <Icon
                                src="/icons/user-square.svg"
                                alt="User square"
                                size={32}
                                className="[filter:invert(69%)_sepia(68%)_saturate(394%)_hue-rotate(14deg)_brightness(91%)_contrast(93%)]"
                              />
                              <span className="text-sm text-gray-400 text-center px-4">
                                Uma selfie sua para a verificação do seu rosto.
                              </span>
                            </div>
                          </label>
                        ) : (
                          <div className="relative w-full h-82 rounded-lg overflow-hidden">
                            <Image
                              src={selfiePreview}
                              alt="Selfie"
                              fill
                              className="object-contain"
                            />
                            <button
                              onClick={() => {
                                setSelfieImage(null);
                                setSelfiePreview("");
                              }}
                              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                              disabled={isSubmitting}
                            >
                              <Image
                                src="/icons/close-icon.svg"
                                alt="Remover"
                                width={20}
                                height={20}
                              />
                            </button>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step Analysis */}
                {currentStep === "analysis" && (
                  <div className="w-[603px] space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center justify-center size-[64px] bg-[#f8f2dc] rounded-full">
                          <Icon
                            src="/icons/user-square.svg"
                            alt="User square"
                            size={32}
                            className="[filter:invert(69%)_sepia(68%)_saturate(394%)_hue-rotate(14deg)_brightness(91%)_contrast(93%)]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between h-4">
                        <h3 className="text-2xl">Documentos em análise</h3>
                      </div>
                      <div className="w-full lg:max-w-[450px]">
                        <p className="text-sm font-light leading-relaxed">
                          Recebemos seus documentos e eles estão sendo analisados pela
                          nossa equipe. Você receberá uma notificação assim que a
                          verificação for concluída.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões fixos na parte inferior em mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-200 lg:hidden">
              {currentStep === "intro" && (
                <Button
                  onClick={() => setCurrentStep("document-upload")}
                  variant="gold"
                  className="w-full h-14 text-base"
                >
                  Começar
                </Button>
              )}

              {currentStep === "document-upload" && (
                <Button
                  onClick={handleSubmitDocuments}
                  variant="gold"
                  disabled={!documentImages.front || !documentImages.back || isSubmitting}
                  className="w-full h-14 text-base"
                >
                  Continuar
                </Button>
              )}

              {currentStep === "selfie-upload" && (
                <Button
                  onClick={handleSubmitSelfie}
                  variant="gold"
                  disabled={!selfieImage || isSubmitting}
                  className="w-full h-14 text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Enviar documentos"
                  )}
                </Button>
              )}

              {currentStep === "analysis" && (
                <Button
                  onClick={handleFinish}
                  variant="gold"
                  className="w-full h-14 text-base"
                >
                  Finalizar
                </Button>
              )}
            </div>

            {/* Botões desktop (mantém o estilo original) */}
            <div className="hidden lg:block px-12 pb-12">
              {currentStep === "intro" && (
                <div className="flex lg:justify-end">
                  <Button
                    onClick={() => setCurrentStep("document-upload")}
                    variant="gold"
                    className="w-full lg:w-[212px] lg:ml-auto"
                  >
                    Começar
                  </Button>
                </div>
              )}

              {currentStep === "document-upload" && (
                <div className="flex lg:justify-end">
                  <Button
                    onClick={handleSubmitDocuments}
                    variant="gold"
                    disabled={
                      !documentImages.front || !documentImages.back || isSubmitting
                    }
                    className="w-full lg:w-[212px] lg:ml-auto"
                  >
                    Continuar
                  </Button>
                </div>
              )}

              {currentStep === "selfie-upload" && (
                <div className="flex lg:justify-end">
                  <Button
                    onClick={handleSubmitSelfie}
                    variant="gold"
                    disabled={!selfieImage || isSubmitting}
                    className="w-full lg:w-[212px] lg:ml-auto"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      "Enviar documentos"
                    )}
                  </Button>
                </div>
              )}

              {currentStep === "analysis" && (
                <div className="flex lg:justify-end">
                  <Button
                    onClick={handleFinish}
                    variant="gold"
                    className="w-full lg:w-[212px] lg:ml-auto"
                  >
                    Finalizar
                  </Button>
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
