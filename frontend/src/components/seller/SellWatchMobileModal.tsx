"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { ArrowLeft, Camera, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Step1Identification } from "@/components/seller/Step1Identification";
import { WatchSearchStep } from "@/components/seller/WatchSearchStep";
import { Button, Input, Select, Toast } from "@/components/ui";
import { braceletMaterialOptions, genderOptions } from "@/lib/constants";
import nobileService from "@/lib/services/nobile.service";
import {
  createImagePreview,
  optimizeImage,
  validateImageFile,
} from "@/lib/utils/imageOptimizer";
import { CreateWatchFormValues, watchSchema } from "@/lib/validations/watch";
import Image from "next/image";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastState {
  message: string;
  type: ToastType;
}

const ALLOWED_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface SellWatchMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const steps = [
  { id: 1, title: "Identificação" },
  { id: 2, title: "Título & Destaque" },
  { id: 3, title: "Detalhes" },
  { id: 4, title: "Inclusos" },
  { id: 5, title: "Estado" },
  { id: 6, title: "Descrição" },
  { id: 7, title: "Preço & Envio" },
];

const accessoriesMap: Record<string, string> = {
  box_and_docs: "BOX_AND_PAPERS",
  box_only: "BOX_ONLY",
  docs_only: "PAPERS_ONLY",
  none: "WATCH_ONLY",
};

export function SellWatchMobileModal({
  isOpen,
  onClose,
  onSuccess,
}: SellWatchMobileModalProps) {
  const [step, setStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [priceFieldTouched, setPriceFieldTouched] = useState(false);
  const [imageError, setImageError] = useState<string>("");
  const [imageProcessing, setImageProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CreateWatchFormValues>({
    //@ts-ignore
    resolver: zodResolver(watchSchema),
    mode: "onChange",
    defaultValues: {
      brand: "",
      model: "",
      condition: "Muito bom",
      price: "" as any,
      includedAccessories: "box_and_docs",
      hasSignsOfWear: "no",
    },
  });

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
  };

  const handleImagesChange = async (files: FileList | null) => {
    setImageError("");

    if (!files || files.length === 0) {
      setImagePreview("");
      setValue("image", null);
      return;
    }

    const file = files[0];

    if (!file) {
      setImagePreview("");
      setValue("image", null);
      return;
    }

    // Validação usando helper
    const validation = await validateImageFile(file, {
      maxSize: MAX_FILE_SIZE,
      allowedFormats: ALLOWED_FORMATS,
    });

    if (!validation.valid) {
      setImageError(validation.error || "Arquivo inválido");
      setImagePreview("");
      setValue("image", null);
      return;
    }

    // Inicia processamento
    setImageProcessing(true);

    try {
      // Otimiza a imagem
      const result = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        outputFormat: "image/webp",
      });

      // Cria FileList com arquivo otimizado
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(result.file);
      const optimizedFileList = dataTransfer.files;

      // Salva no formulário
      setValue("image", optimizedFileList, {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Cria preview
      const preview = await createImagePreview(result.file);
      setImagePreview(preview);

      showToast("success", `Imagem processada com sucesso`);
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      setImageError("Erro ao processar imagem. Tente novamente.");
      setImagePreview("");
      setValue("image", null);
    } finally {
      setImageProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageError("");
    setValue("image", null);
  };

  const next = async () => {
    const v = getValues();

    let fieldsToValidate: (keyof CreateWatchFormValues)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ["brand", "model"];
        break;
      case 2:
        fieldsToValidate = ["titleSuffix"];
        break;
      case 3:
        fieldsToValidate = [
          "year",
          "gender",
          "serialNumber",
          "dialColor",
          "caseDiameter",
          "movement",
          "caseMaterial",
          "braceletMaterial",
          "braceletColor",
        ];
        break;
      case 4:
        fieldsToValidate = ["includedAccessories"];
        break;
      case 5:
        fieldsToValidate = ["hasSignsOfWear"];
        break;
      case 6:
        fieldsToValidate = ["description"];
        break;
      case 7:
        fieldsToValidate = ["price"];
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);

    if (!isStepValid) {
      showToast("error", "Por favor, corrija os erros antes de continuar.");
      return;
    }

    if (step === 1) {
      if (!v.brand || !v.model) {
        showToast(
          "error",
          "Por favor, preencha a marca e o modelo do relógio."
        );
        return;
      }
    }

    if (step === 7) {
      return;
    }

    setStep((s) => Math.min(s + 1, steps.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClose = () => {
    if (submitting || imageProcessing) {
      return;
    }

    setStep(0);
    reset();
    setImagePreview("");
    setToast(null);
    onClose();
  };

  const onSubmit = async (data: CreateWatchFormValues) => {
    if (step !== 7) {
      showToast(
        "info",
        "Por favor, complete todos os passos antes de criar o anúncio."
      );
      return;
    }

    const finalValidation = await trigger();
    if (!finalValidation) {
      showToast(
        "error",
        "Por favor, corrija todos os erros antes de criar o anúncio."
      );
      return;
    }

    setSubmitting(true);

    try {
      const clean = <T extends Record<string, any>>(obj: T): T =>
        Object.fromEntries(
          Object.entries(obj).map(([key, value]) => {
            const shouldTrim =
              typeof value === "string" &&
              key !== "year" &&
              key !== "caseDiameter";

            return [key, shouldTrim ? value.trim() : value];
          })
        ) as T;

      const cleaned = clean(data);
      const form = new FormData();

      form.append("brand", cleaned.brand);
      form.append("model", cleaned.model);
      if (cleaned.referenceNumber)
        form.append("referenceNumber", cleaned.referenceNumber);
      if (cleaned.movement) form.append("movement", cleaned.movement);

      // numeric (raw)
      if (cleaned.year) form.append("year", String(cleaned.year));
      if (cleaned.caseDiameter)
        form.append("caseDiameter", String(cleaned.caseDiameter));

      form.append(
        "condition",
        cleaned.hasSignsOfWear === "yes" ? "Usado" : "Novo"
      );
      if (cleaned.price !== undefined)
        form.append("price", String(cleaned.price));
      if (cleaned.description) form.append("description", cleaned.description);
      if (cleaned.gender) form.append("gender", cleaned.gender);
      if (cleaned.dialColor) form.append("dialColor", cleaned.dialColor);
      if (cleaned.caseMaterial)
        form.append("caseMaterial", cleaned.caseMaterial);
      if (cleaned.braceletMaterial)
        form.append("braceletMaterial", cleaned.braceletMaterial);
      if (cleaned.braceletColor)
        form.append("braceletColor", cleaned.braceletColor);
      if (cleaned.claspType) form.append("claspType", cleaned.claspType);

      if (cleaned.includedAccessories) {
        const accessoriesValue = accessoriesMap[cleaned.includedAccessories];
        if (accessoriesValue) {
          form.append("accessories", accessoriesValue);
        }
      }

      // Envia apenas 1 imagem
      if (cleaned.image && cleaned.image.length > 0) {
        const file = cleaned.image[0];
        form.append("image", file);
      }

      const watchResult = await nobileService.createWatchWithFormData(form);
      const watchId = watchResult.relogio.id;

      await nobileService.createAndPublishListing(watchId, {
        shippingInfo: "",
        returnPolicy: "",
        deliveryTime: "",
        negotiable: true,
        ...(cleaned.titleSuffix && {
          titleSuffix: cleaned.titleSuffix,
        }),
      });

      showToast("success", "Anúncio criado com sucesso!");

      handleClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro ao criar anúncio:", error);
      showToast(
        "error",
        error?.message || "Não foi possível criar o anúncio. Tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const StepIndicator = () => {
    const progressPercentage = ((step - 1) / (steps.length - 1)) * 100;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-4 h-2">
          <div className="flex-1 relative h-[2px] bg-[#EFEFEF] rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#D5A60A] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <span className="text-xs font-light whitespace-nowrap">
            {String(step).padStart(2, "0")}/
            {String(steps.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <WatchSearchStep setValue={setValue} onContinue={() => setStep(1)} />
      );
    }

    switch (step) {
      case 1:
        return (
          <Step1Identification
            watch={watch}
            errors={errors}
            register={register}
          />
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl leading-[30px] tracking-[-0.01em] mb-4">
              Personalize o título do anúncio
            </h2>
            <p className="text-gray-400 text-sm font-light leading-[20px] mb-6">
              Indique características especiais do seu relógio para que este
              tenha mais visibilidade.
            </p>

            <Input
              {...register("titleSuffix")}
              id="titleSuffix"
              label="Informações adicionais sobre o título (opcional)"
              type="text"
              error={errors.titleSuffix?.message as string}
              placeholder="Ex: Edição Limitada, Com Garantia, Pouquíssimo Uso"
            />

            <div className="mt-6">
              <div className="text-sm leading-[168%] mb-2.5">
                Carregue uma imagem do seu relógio
              </div>

              {imageError && (
                <div className="mb-4 flex items-start gap-2">
                  <div className="text-[13px] text-[#E81F33] leading-[133%]">
                    A imagem não pode ser enviada
                  </div>
                  <div className="text-[13px] text-[#E81F33] leading-[133%]">
                    {imageError}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                {/* Card de upload */}
                {!imagePreview && (
                  <label className="cursor-pointer w-[50%]">
                    <input
                      type="file"
                      accept={ALLOWED_FORMATS.join(",")}
                      onChange={(e) => handleImagesChange(e.target.files)}
                      className="hidden"
                      disabled={imageProcessing}
                    />
                    <div
                      className={clsx(
                        "flex flex-col items-center justify-center gap-1.5 w-full border-2 border-dashed rounded-lg p-2.5 text-center transition-colors aspect-square",
                        imageProcessing
                          ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                          : imageError
                            ? "border-red-300 bg-red-50 cursor-pointer hover:border-red-400"
                            : "border-[#cccccc] cursor-pointer hover:border-[#D5A60A]"
                      )}
                    >
                      {imageProcessing ? (
                        <>
                          <Loader2 className="w-6 h-6 text-[#D5A60A] animate-spin" />
                          <span className="text-sm text-gray-400">
                            Processando...
                          </span>
                        </>
                      ) : (
                        <>
                          <Camera
                            className={clsx(
                              "w-6 h-6",
                              imageError ? "text-red-400" : "text-[#D5A60A]"
                            )}
                          />
                          <span
                            className={clsx(
                              "text-sm",
                              imageError ? "text-red-600" : "text-gray-400"
                            )}
                          >
                            Carregar{" "}
                            <span className="hidden sm:inline">imagem</span>
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                )}

                {/* Preview da imagem */}
                {imagePreview && (
                  <div className="w-[50%] relative">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Badge de erro (se houver) */}
                      {imageError && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Erro
                        </div>
                      )}
                      {/* Botão remover */}
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                        aria-label="Remover imagem"
                      >
                        <X className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl mb-4">
              Insira detalhes sobre o seu relógio
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Forneça informações detalhadas sobre o relógio
            </p>
            <div className="space-y-4">
              <Input
                {...register("year")}
                id="year"
                label="Ano de fabricação"
                type="number"
                error={errors.year?.message as string}
                placeholder="Ex: 2012"
              />

              <Select
                {...register("gender")}
                id="gender"
                label="Gênero"
                placeholder="Selecione..."
                options={genderOptions}
                error={errors.gender?.message}
              />

              <Input
                {...register("serialNumber")}
                id="serialNumber"
                label="Número de série (não será publicado)"
                type="text"
                error={errors.serialNumber?.message as string}
                placeholder="Digite..."
                maxLength={100}
              />

              <Input
                {...register("dialColor")}
                id="dialColor"
                label="Cor do mostrador"
                type="text"
                error={errors.dialColor?.message as string}
                placeholder="Ex: Preto, Branco, Azul"
              />

              <Input
                {...register("caseDiameter")}
                id="caseDiameter"
                label="Diâmetro da caixa (mm)"
                type="number"
                error={errors.caseDiameter?.message as string}
                placeholder="Ex: 40"
              />

              <Input
                {...register("movement")}
                id="movement"
                label="Movimento"
                type="text"
                error={errors.movement?.message as string}
                placeholder="Ex: Automático, Quartzo, Manual"
              />

              <Input
                {...register("caseMaterial")}
                id="caseMaterial"
                label="Material da caixa"
                type="text"
                error={errors.caseMaterial?.message as string}
                placeholder="Ex: Aço inoxidável, Ouro, Titânio"
              />

              <Select
                {...register("braceletMaterial")}
                id="braceletMaterial"
                label="Material do bracelete"
                placeholder="Selecione..."
                error={errors.braceletMaterial?.message}
                options={braceletMaterialOptions}
              />

              <Input
                {...register("braceletColor")}
                id="braceletColor"
                label="Cor do bracelete"
                type="text"
                error={errors.braceletColor?.message as string}
                placeholder="Ex: Preto, Marrom, Prata"
              />

              <Input
                {...register("claspType")}
                id="claspType"
                label="Tipo de fecho"
                type="text"
                error={errors.claspType?.message as string}
                placeholder="Ex: Fecho Dobrável"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl leading-[30px] tracking-[-0.01em] mb-4">
              O que está incluído com seu relógio?
            </h2>

            <div className="space-y-4">
              <label
                className={`flex items-center justify-between py-1.5 pl-3.5 pr-1.5 bg-[#F7F7F7] rounded-lg cursor-pointer transition-all ${
                  watch("includedAccessories") === "box_and_docs"
                    ? "font-normal"
                    : "font-light"
                }`}
              >
                <span className="text-sm">
                  Caixa original e documentos originais
                </span>
                <input
                  type="radio"
                  value="box_and_docs"
                  {...register("includedAccessories")}
                  className="appearance-none w-[30px] h-[30px] rounded-[6px] bg-transparent border-0 checked:bg-[#E7F6EB] checked:flex checked:items-center checked:justify-center relative
                      after:content-[''] after:hidden checked:after:block after:absolute after:left-[9px] after:top-[5px] after:w-[10px] after:h-[16px] after:border-[#4CAF50] after:border-r-[3px] after:border-b-[3px] after:rotate-45"
                />
              </label>

              <label
                className={`flex items-center justify-between py-1.5 pl-3.5 pr-1.5 bg-[#F7F7F7] rounded-lg cursor-pointer transition-all ${
                  watch("includedAccessories") === "box_only"
                    ? "font-normal"
                    : "font-light"
                }`}
              >
                <span className="text-sm">Caixa original</span>
                <input
                  type="radio"
                  value="box_only"
                  {...register("includedAccessories")}
                  className="appearance-none w-[30px] h-[30px] rounded-[6px] bg-transparent border-0 checked:bg-[#E7F6EB] checked:flex checked:items-center checked:justify-center relative
                      after:content-[''] after:hidden checked:after:block after:absolute after:left-[9px] after:top-[5px] after:w-[10px] after:h-[16px] after:border-[#4CAF50] after:border-r-[3px] after:border-b-[3px] after:rotate-45"
                />
              </label>

              <label
                className={`flex items-center justify-between py-1.5 pl-3.5 pr-1.5 bg-[#F7F7F7] rounded-lg cursor-pointer transition-all ${
                  watch("includedAccessories") === "docs_only"
                    ? "font-normal"
                    : "font-light"
                }`}
              >
                <span className="text-sm">Documentos originais</span>
                <input
                  type="radio"
                  value="docs_only"
                  {...register("includedAccessories")}
                  className="appearance-none w-[30px] h-[30px] rounded-[6px] bg-transparent border-0 checked:bg-[#E7F6EB] checked:flex checked:items-center checked:justify-center relative
                      after:content-[''] after:hidden checked:after:block after:absolute after:left-[9px] after:top-[5px] after:w-[10px] after:h-[16px] after:border-[#4CAF50] after:border-r-[3px] after:border-b-[3px] after:rotate-45"
                />
              </label>

              <label
                className={`flex items-center justify-between py-1.5 pl-3.5 pr-1.5 bg-[#F7F7F7] rounded-lg cursor-pointer transition-all ${
                  watch("includedAccessories") === "none"
                    ? "font-normal"
                    : "font-light"
                }`}
              >
                <span className="text-sm">Sem mais acessórios</span>
                <input
                  type="radio"
                  value="none"
                  {...register("includedAccessories")}
                  className="appearance-none w-[30px] h-[30px] rounded-[6px] bg-transparent border-0 checked:bg-[#E7F6EB] checked:flex checked:items-center checked:justify-center relative
                      after:content-[''] after:hidden checked:after:block after:absolute after:left-[9px] after:top-[5px] after:w-[10px] after:h-[16px] after:border-[#4CAF50] after:border-r-[3px] after:border-b-[3px] after:rotate-45"
                />
              </label>
            </div>
          </div>
        );

      case 5:
        const hasSignsOfWear = watch("hasSignsOfWear");

        return (
          <div>
            <h2 className="text-2xl mb-4">Indique o estado do seu relógio</h2>
            <p className="text-sm font-light text-gray-400 mb-5">
              Sinais de utilização, tais como riscos ou amolgadelas.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-3">
                  Seu relógio apresenta sinais de desgaste?
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex items-center justify-between h-[42px] pl-4 pr-1.5 bg-[#F7F7F7] rounded-lg cursor-pointer transition-all ${
                      watch("hasSignsOfWear") === "yes"
                        ? "font-normal"
                        : "font-light"
                    }`}
                  >
                    <span className="text-sm">Sim</span>
                    <input
                      type="radio"
                      value="yes"
                      {...register("hasSignsOfWear")}
                      className="appearance-none w-[30px] h-full bg-transparent border-0 checked:flex checked:items-center checked:justify-center relative
                                after:content-[''] after:hidden checked:after:block after:absolute after:left-[12px] after:top-[10px] after:w-[8px] after:h-[14px] after:border-[#4CAF50] after:border-r-[3px] after:border-b-[3px] after:rotate-45"
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between h-[42px] pl-4 pr-1.5 bg-[#F7F7F7] rounded-lg cursor-pointer transition-all ${
                      watch("hasSignsOfWear") === "no"
                        ? "font-normal"
                        : "font-light"
                    }`}
                  >
                    <span className="text-sm">Não</span>
                    <input
                      type="radio"
                      value="no"
                      {...register("hasSignsOfWear")}
                      className="appearance-none w-[30px] h-full bg-transparent border-0 checked:flex checked:items-center checked:justify-center relative
                                after:content-[''] after:hidden checked:after:block after:absolute after:left-[12px] after:top-[10px] after:w-[8px] after:h-[14px] after:border-[#4CAF50] after:border-r-[3px] after:border-b-[3px] after:rotate-45"
                    />
                  </label>
                </div>
              </div>

              {hasSignsOfWear === "no" && (
                <div className="p-4 bg-[#F7F7F7] rounded-lg border border-[#EFEFEF]">
                  <h3 className="font-lato text-sm font-medium mb-2">
                    Sem marcas e em estado impecável
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    O item está em condição perfeita, sem riscos, amassados ou
                    qualquer sinal de uso. Também não passou por qualquer tipo
                    de polimento.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-4">
              Diga-nos mais sobre o seu relógio
            </h2>
            <p className="text-gray-400 text-sm leading-[20px] mb-6">
              Uma descrição detalhada reforça a confiança dos potenciais
              compradores. Utilize esta oportunidade para comunicar o valor do
              seu relógio e aumentar as suas oportunidades de venda.
            </p>
            <label className="block max-w-full overflow-hidden">
              <div className="text-sm mb-2">Descrição (Opcional)</div>
              <textarea
                {...register("description")}
                rows={6}
                className={clsx(
                  "w-full max-w-full px-3 py-3 border bg-[#F7F7F7] rounded-[12px] focus:outline-none transition-colors resize-none",
                  errors.description
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#EFEFEF] focus:border-[#D5A60A]"
                )}
                placeholder="Ex: informações sobre a última manutenção, peças de substituição, sinais de uso e acessórios especiais."
              />
            </label>
          </div>
        );

      case 7:
        return (
          <div>
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-4">
              Defina o seu preço de venda
            </h2>
            <p className="text-gray-400 text-sm">
              Defina o preço de venda do seu relógio
            </p>
            <Input
              {...register("price", {
                onChange: () => setPriceFieldTouched(true),
              })}
              id="price"
              label="Preço (R$) *"
              type="number"
              error={errors.price?.message as string}
              placeholder="Ex: 25000"
            />

            {priceFieldTouched && watch("price") && (
              <div className="p-3.5 bg-[#F7F7F7] rounded-lg border border-[#F7F7F7]">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Preço de venda:</span>
                    <span className="font-medium">
                      {watch("price")
                        ? `R$ ${Number(watch("price")).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}`
                        : "R$ 0,00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      Taxa da Plataforma e Autenticidade (9,5%):
                    </span>
                    <span className="text-red-600">
                      {watch("price")
                        ? `- R$ ${(
                            Number(watch("price")) * 0.095
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}`
                        : "R$ 0,00"}
                    </span>
                  </div>
                  <div className="border-t border-[#D5A60A]/20 pt-2 mt-2">
                    <div className="flex justify-between font-medium text-base">
                      <span className="text-gray-900">Pagamento estimado:</span>
                      <span className="text-[#D5A60A]">
                        {watch("price")
                          ? `R$ ${(
                              Number(watch("price")) * 0.905
                            ).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`
                          : "R$ 0,00"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          duration={toast.type === "success" ? 5000 : 3000}
        />
      )}

      {/* Fullscreen Mobile Modal */}
      <div className="lg:hidden fixed inset-0 z-150 bg-white overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-5 h-14.5">
            <div className="flex items-center gap-3 h-full">
              <button
                onClick={step > 0 ? prev : handleClose}
                disabled={submitting || imageProcessing}
                className="p-1 -ml-1"
              >
                <ArrowLeft
                  className="w-[26px] h-[26px] text-pb-500"
                  strokeWidth={1.5}
                />
              </button>
              <h1 className="text-[20px]">Vender relógio</h1>
            </div>
            <button
              onClick={handleClose}
              disabled={submitting || imageProcessing}
              className="w-auto h-auto flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Fechar"
            >
              <Image
                src="/icons/close-icon.svg"
                alt="Fechar"
                width={30}
                height={30}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        {/* @ts-ignore */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-9">
          {step > 0 && <StepIndicator />}
          {renderStep()}

          {/* Footer Actions */}
          {step > 0 && (
            <div className="mt-8 flex flex-col gap-3">
              {step < 7 ? (
                <Button
                  type="button"
                  onClick={next}
                  disabled={submitting || imageProcessing}
                  variant="gold"
                  className="w-full h-[52px]"
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    imageProcessing ||
                    Object.keys(errors).length > 0
                  }
                  variant="gold"
                  className="w-full h-[52px]"
                >
                  {submitting ? "Criando anúncio..." : "Criar anúncio"}
                </Button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Prevent body scroll when modal is open */}
      <style jsx global>{`
        html,
        body {
          overflow: ${isOpen ? "hidden" : "auto"};
        }
      `}</style>
    </>
  );
}
