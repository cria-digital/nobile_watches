"use client";

import { Button, Icon } from "@/components/ui";
import { useDocumentVerification } from "@/lib/hooks/useDocumentVerification";
import { authService } from "@/lib/services/auth.service";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Camera, Clock3 } from "lucide-react";
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

export function VerificationModalMobile({
  isOpen,
  onClose,
  onVerificationSubmitted,
}: VerificationModalProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>("intro");
  const [documentImages, setDocumentImages] = useState<DocumentImages>({
    front: null,
    back: null,
  });
  const [documentFrontPreview, setDocumentFrontPreview] = useState("");
  const [documentBackPreview, setDocumentBackPreview] = useState("");
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Hook de validação e compressão
  const { processImage, isProcessing, processingProgress } = useDocumentVerification();

  const resetModal = () => {
    setCurrentStep("intro");
    setDocumentImages({ front: null, back: null });
    setDocumentFrontPreview("");
    setDocumentBackPreview("");
    setSelfieImage(null);
    setSelfiePreview("");
    setError("");
    setUploadProgress(0);
  };

  /**
   * Handler para upload da frente do documento
   */
  const handleDocumentFrontUpload = async (file: File) => {
    setError("");
    try {
      const processedFile = await processImage(file, "document");
      setDocumentImages(prev => ({ ...prev, front: processedFile }));
      setDocumentFrontPreview(URL.createObjectURL(processedFile));
    } catch (err: any) {
      setError(err.message || "Erro ao processar imagem da frente do documento.");
      console.error("Erro ao processar frente do documento:", err);
    }
  };

  /**
   * Handler para upload do verso do documento
   */
  const handleDocumentBackUpload = async (file: File) => {
    setError("");
    try {
      const processedFile = await processImage(file, "document");
      setDocumentImages(prev => ({ ...prev, back: processedFile }));
      setDocumentBackPreview(URL.createObjectURL(processedFile));
    } catch (err: any) {
      setError(err.message || "Erro ao processar imagem do verso do documento.");
      console.error("Erro ao processar verso do documento:", err);
    }
  };

  /**
   * Handler para upload da selfie
   */
  const handleSelfieUpload = async (file: File) => {
    setError("");
    try {
      const processedFile = await processImage(file, "selfie");
      setSelfieImage(processedFile);
      setSelfiePreview(URL.createObjectURL(processedFile));
    } catch (err: any) {
      setError(err.message || "Erro ao processar selfie.");
      console.error("Erro ao processar selfie:", err);
    }
  };

  const handleContinueToSelfie = () => {
    if (!documentImages.front || !documentImages.back) {
      setError(
        "Por favor, envie a frente e o verso do seu documento antes de continuar."
      );
      return;
    }
    setCurrentStep("selfie-upload");
    setError("");
  };

  const getErrorMessage = (error: any): string => {
    if (!error.response) {
      return "Erro de conexão. Verifique sua conexão com a internet e tente novamente.";
    }

    const status = error.response?.status;
    const errorData = error.response?.data;

    switch (status) {
      case 400:
        return (
          errorData?.error ||
          "Os arquivos enviados são inválidos. Certifique-se de enviar a frente e verso do documento e uma selfie."
        );
      case 401:
        return "Sua sessão expirou. Por favor, faça login novamente para continuar.";
      case 403:
        return "Sua sessão é inválida. Por favor, faça login novamente para continuar.";
      case 413:
        return "Uma ou mais imagens são muito grandes. Por favor, use imagens com no máximo 10MB cada.";
      case 415:
        return "Formato de arquivo não suportado. Por favor, use apenas imagens JPG, PNG ou WEBP.";
      case 500:
        const details = errorData?.details;
        return details
          ? `Erro no servidor: ${details}. Tente novamente em alguns instantes.`
          : "Ocorreu um erro ao processar seus documentos. Por favor, tente novamente em alguns instantes.";
      default:
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
    setUploadProgress(0);

    try {
      const shouldMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

      const response = shouldMock
        ? await Promise.resolve({ status: 200, message: "Mocked verification success" })
        : await authService.submitVerification(
            documentImages.front,
            documentImages.back,
            selfieImage,
            progress => setUploadProgress(progress) // Callback de progresso
          );

      console.log("✅ Verificação enviada com sucesso:", response);

      setCurrentStep("analysis");
    } catch (err) {
      console.error("Erro ao enviar verificação:", err);

      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      const status = (err as any).response?.status;
      if (status === 401 || status === 403) {
        console.warn(
          "⚠️ Erro de autenticação detectado. Usuário precisa fazer login novamente."
        );
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
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
    if (isSubmitting || isProcessing) return;

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

  // Indicador de progresso visual
  const renderProgressIndicator = () => {
    if (isProcessing && processingProgress > 0) {
      return (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">
              Processando imagem...
            </span>
            <span className="text-sm text-blue-600">{processingProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
        </div>
      );
    }

    if (isSubmitting && uploadProgress > 0) {
      return (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-medium">
              Enviando documentos...
            </span>
            <span className="text-sm text-green-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-150 focus:outline-none"
      onClose={isSubmitting || isProcessing ? () => {} : handleClose}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 z-150 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel
            transition
            className="relative w-full h-full rounded-xl bg-white backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 flex flex-col"
          >
            {/* Conteúdo com scroll */}
            <div className="flex-1 overflow-y-auto pb-24">
              <div className="px-5 pt-10">
                {currentStep !== "analysis" && (
                  <button
                    onClick={handleClose}
                    className="absolute right-5 top-5 w-auto bg-transparent"
                    aria-label="Fechar"
                    disabled={isSubmitting || isProcessing}
                  >
                    <Image src="/icons/close-icon.svg" alt="" width={32} height={32} />
                  </button>
                )}

                {/* Step Intro */}
                {currentStep === "intro" && (
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-42 h-28 overflow-hidden mb-3.5">
                      <Image
                        src="/images/seller/seller-verification-illustration.svg"
                        alt="Verificação de Vendedor"
                        fill
                        sizes="(max-width: 1024px) 168px, 168px"
                      />
                    </div>

                    <h3 className="text-2xl max-w-[306px] leading-[124%] mb-3">
                      Verificação rápida e segura para vendedores
                    </h3>

                    <div className="px-5">
                      <p className="text-sm font-light text-gray-400 leading-[20px] mb-1">
                        Para garantir um ambiente confiável e proteger todos os
                        envolvidos, solicitamos uma verificação simples e segura antes de
                        ativar sua conta como vendedor.
                      </p>
                      <p className="text-sm font-light text-gray-400 leading-[20px]">
                        Esse processo leva apenas alguns minutos e é essencial para manter
                        a transparência e autenticidade da nossa comunidade.
                      </p>
                    </div>

                    {/* Requirements */}
                    <div className="pt-6">
                      <h3 className="text-base leading-[20px] mb-4.5">
                        O que você precisa enviar:
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center gap-2 p-4 pb-6.5 min-h-[100px] bg-[#F7F7F7] rounded-xl">
                          <Icon
                            src="/icons/id-card.svg"
                            alt="Id card"
                            size={20}
                            className="[filter:invert(69%)_sepia(68%)_saturate(394%)_hue-rotate(14deg)_brightness(91%)_contrast(93%)]"
                          />
                          <span className="text-xs font-light leading-[17px] text-center">
                            Uma foto do seu documento oficial com foto (RG ou CNH).
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-4 pb-6.5 min-h-[100px] bg-[#F7F7F7] rounded-xl">
                          <Icon
                            src="/icons/user-square.svg"
                            alt="User square"
                            size={20}
                            className="[filter:invert(69%)_sepia(68%)_saturate(394%)_hue-rotate(14deg)_brightness(91%)_contrast(93%)]"
                          />
                          <span className="text-xs font-light leading-[17px] text-center">
                            Uma selfie sua para a verificação do seu rosto.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Document Upload */}
                {currentStep === "document-upload" && (
                  <div className="space-y-8 pb-8">
                    <div className="text-center px-5">
                      <h3 className="text-2xl max-w-[306px] leading-[124%] mb-3">
                        Tire uma foto do seu documento
                      </h3>

                      <p className="text-sm font-light text-gray-400 leading-[140%]">
                        Para garantir uma verificação rápida e segura, envie uma foto
                        nítida, legível e bem iluminada do seu documento.
                      </p>
                    </div>

                    {renderProgressIndicator()}

                    <div className="flex flex-col gap-6">
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
                            if (file) handleDocumentFrontUpload(file);
                          }}
                          className="hidden"
                          id="document-front"
                          disabled={isSubmitting || isProcessing}
                        />
                        {!documentFrontPreview ? (
                          <label
                            htmlFor="document-front"
                            className="flex flex-col items-center justify-center gap-2 w-full h-65 max-h-[270px] rounded-lg cursor-pointer bg-[#F7F7F7]"
                          >
                            <div className="flex items-center justify-center size-10 rounded-3xl bg-[#F8F2DC]">
                              <Camera className="w-5 h-5 text-[#D5A60A]" />
                            </div>
                            <span className="text-xs font-light leading-[140%] text-center">
                              Fotografar frente do documento.
                            </span>
                          </label>
                        ) : (
                          <div className="relative w-full h-65 max-h-[270px] rounded-lg cursor-pointer bg-[#F7F7F7] overflow-hidden">
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
                              disabled={isSubmitting || isProcessing}
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
                            if (file) handleDocumentBackUpload(file);
                          }}
                          className="hidden"
                          id="document-back"
                          disabled={isSubmitting || isProcessing}
                        />
                        {!documentBackPreview ? (
                          <label
                            htmlFor="document-back"
                            className="flex flex-col items-center justify-center gap-2 w-full h-65 max-h-[270px] rounded-lg cursor-pointer bg-[#F7F7F7]"
                          >
                            <div className="flex items-center justify-center size-10 rounded-3xl bg-[#F8F2DC]">
                              <Camera className="w-5 h-5 text-[#D5A60A]" />
                            </div>
                            <span className="text-xs font-light leading-[140%] text-center">
                              Fotografar verso do documento.
                            </span>
                          </label>
                        ) : (
                          <div className="relative w-full h-65 max-h-[270px] rounded-lg cursor-pointer bg-[#F7F7F7] overflow-hidden">
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
                              disabled={isSubmitting || isProcessing}
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
                  <div className="space-y-8 pb-8">
                    <div className="flex flex-col items-center text-center px-5">
                      <div className="flex items-center justify-center size-16 rounded-[64px] bg-[#F8F2DC] mb-3">
                        <Icon
                          src="/icons/user-square.svg"
                          alt="User square"
                          size={32}
                          className="[filter:invert(69%)_sepia(68%)_saturate(394%)_hue-rotate(14deg)_brightness(91%)_contrast(93%)]"
                        />
                      </div>
                      <h3 className="text-2xl max-w-[306px] leading-[124%] mb-3">
                        Envio da selfie para verificação
                      </h3>

                      <p className="text-sm font-light text-gray-400 leading-[140%]">
                        Para validar sua identidade com segurança, pedimos que você envie
                        uma selfie recente e nítida do seu rosto.
                      </p>
                    </div>

                    {/* Selfie upload */}
                    <div className="mt-7">
                      <label className="block">
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
                          disabled={isSubmitting || isProcessing}
                        />
                        {!selfiePreview ? (
                          <label
                            htmlFor="selfie"
                            className="flex flex-col items-center justify-center w-full h-68 rounded-lg cursor-pointer bg-[#F7F7F7]"
                          >
                            <div className="flex flex-col items-center gap-2.5">
                              <Icon
                                src="/icons/user-square.svg"
                                alt="User square"
                                size={20}
                                className="[filter:invert(69%)_sepia(68%)_saturate(394%)_hue-rotate(14deg)_brightness(91%)_contrast(93%)]"
                              />
                              <span className="text-xs font-light text-center max-w-[172px]">
                                Uma selfie sua para a verificação do seu rosto.
                              </span>
                            </div>
                          </label>
                        ) : (
                          <div className="relative w-full h-68 rounded-lg overflow-hidden">
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
                              disabled={isSubmitting || isProcessing}
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
                  <div className="space-y-8  px-4">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center justify-center size-16 bg-[#F8F2DC] rounded-full">
                        <Clock3 className="size-6.5 text-[#D5A60A]" />
                      </div>

                      <h3 className="text-2xl">Documentos em análise</h3>

                      <p className="text-sm font-light text-gray-400 text-center leading-relaxed">
                        Recebemos seus documentos e eles estão sendo analisados pela nossa
                        equipe. Você receberá uma notificação assim que a verificação for
                        concluída.
                      </p>
                    </div>

                    <Button
                      onClick={handleFinish}
                      variant="gold"
                      className="w-full h-14 text-base"
                    >
                      Concluir
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Botões fixos na parte inferior */}
            <div className="fixed bottom-0 left-0 right-0 p-5 pb-8 bg-white">
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
                  onClick={handleContinueToSelfie}
                  variant="gold"
                  disabled={
                    !documentImages.front ||
                    !documentImages.back ||
                    isSubmitting ||
                    isProcessing
                  }
                  className="w-full h-14 text-base"
                >
                  Continuar
                </Button>
              )}

              {currentStep === "selfie-upload" && (
                <Button
                  onClick={handleSubmitSelfie}
                  variant="gold"
                  disabled={!selfieImage || isSubmitting || isProcessing}
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
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
