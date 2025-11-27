"use client";

import { Dialog, DialogBackdrop, DialogPanel, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";

import { Step1Identification } from "@/components/seller/Step1Identification";
import { WatchSearchStep } from "@/components/seller/WatchSearchStep";
import { Button, Input, Select, Toast } from "@/components/ui";
import { genderOptions } from "@/lib/constants";
import nobileService from "@/lib/services/nobile.service";
import { CreateWatchFormValues, watchSchema } from "@/lib/validations/watch";
import { Camera } from "lucide-react";
import Image from "next/image";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastState {
  message: string;
  type: ToastType;
}

const ALLOWED_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface SellWatchModalProps {
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

export function SellWatchModal({ isOpen, onClose, onSuccess }: SellWatchModalProps) {
  const [step, setStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [priceFieldTouched, setPriceFieldTouched] = useState(false);

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

  const handleImagesChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setImagePreview("");
      setValue("image", null);
      return;
    }

    // Pega apenas o primeiro arquivo
    const file = files[0];

    // Verifica se o arquivo existe (TypeScript guard)
    if (!file) {
      setImagePreview("");
      setValue("image", null);
      return;
    }

    // Valida formato
    if (!ALLOWED_FORMATS.includes(file.type)) {
      showToast("error", `${file.name}: formato não permitido. Use JPEG, PNG ou WebP.`);
      return;
    }

    // Valida tamanho
    if (file.size > MAX_FILE_SIZE) {
      showToast("error", `${file.name}: arquivo muito grande. Máximo 5MB.`);
      return;
    }

    // Cria um novo FileList com apenas 1 arquivo
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const singleFileList = dataTransfer.files;

    // Salva o arquivo no formulário
    setValue("image", singleFileList, { shouldValidate: true, shouldDirty: true });

    // Cria preview visual
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const next = async () => {
    const v = getValues();

    let fieldsToValidate: (keyof CreateWatchFormValues)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ["brand", "model"];
        break;
      case 2:
        fieldsToValidate = ["customTitleSuffix"];
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
        fieldsToValidate = ["hasSignsOfWear", "condition"];
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
        showToast("error", "Por favor, preencha a marca e o modelo do relógio.");
        return;
      }
    }

    if (step === 7) {
      return;
    }

    setStep(s => Math.min(s + 1, steps.length));
  };

  const prev = () => {
    setStep(s => Math.max(s - 1, 0));
  };

  const handleClose = () => {
    // Impede fechamento durante submissão
    if (submitting) {
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
      showToast("info", "Por favor, complete todos os passos antes de criar o anúncio.");
      return;
    }

    const finalValidation = await trigger();
    if (!finalValidation) {
      showToast("error", "Por favor, corrija todos os erros antes de criar o anúncio.");
      return;
    }

    setSubmitting(true);

    try {
      const clean = <T extends Record<string, any>>(obj: T): T =>
        Object.fromEntries(
          Object.entries(obj).map(([key, value]) => {
            const shouldTrim =
              typeof value === "string" && key !== "year" && key !== "caseDiameter";

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
      if (cleaned.caseDiameter) form.append("caseDiameter", String(cleaned.caseDiameter));

      form.append("condition", cleaned.condition || "");

      if (cleaned.price !== undefined) form.append("price", String(cleaned.price));

      if (cleaned.description) form.append("description", cleaned.description);
      if (cleaned.gender) form.append("gender", cleaned.gender);
      if (cleaned.dialColor) form.append("dialColor", cleaned.dialColor);
      if (cleaned.caseMaterial) form.append("caseMaterial", cleaned.caseMaterial);
      if (cleaned.braceletMaterial)
        form.append("braceletMaterial", cleaned.braceletMaterial);
      if (cleaned.braceletColor) form.append("braceletColor", cleaned.braceletColor);
      if (cleaned.claspType) form.append("claspType", cleaned.claspType);

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
      });

      showToast("success", "Anúncio criado com sucesso!");

      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
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

  const progressPercentage = step === 0 ? 0 : ((step - 1) / (steps.length - 1)) * 100;

  const renderStep = () => {
    if (step === 0) {
      return <WatchSearchStep setValue={setValue} onContinue={() => setStep(1)} />;
    }

    if (step === 1) {
      return <Step1Identification watch={watch} errors={errors} register={register} />;
    }

    if (step === 2) {
      return (
        <div className="w-[572px]">
          <h2 className="text-2xl tracking-[-0.01em] mb-4">
            Personalize o título do anúncio
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Indique características especiais do seu relógio para que este tenha mais
            visibilidade.
          </p>

          <label className="block">
            <div className="text-sm leading-[168%] mb-2.5">
              Informações adicionais sobre o título (opcional)
            </div>
            <input
              type="text"
              {...register("customTitleSuffix")}
              className={clsx(
                "w-full max-w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                errors.customTitleSuffix
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#EFEFEF] focus:border-[#D5A60A]"
              )}
              placeholder="Digite..."
            />
          </label>

          {/* <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Prévia do título:</p>
            <p className="font-medium">
              {watch("brand")} {watch("model")}{" "}
              {watch("customTitleSuffix") && `- ${watch("customTitleSuffix")}`}
            </p>
          </div> */}

          <div className="mt-6">
            <label className="block cursor-pointer">
              <div className="text-sm leading-[168%] mb-2.5">
                Carregue uma imagem do seu relógio
              </div>
              <input
                type="file"
                accept={ALLOWED_FORMATS.join(",")}
                onChange={e => handleImagesChange(e.target.files)}
                className="hidden"
              />
              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center gap-1.5 w-[50%] border-2 border-dashed border-[#cccccc] rounded-lg p-4.5 text-center cursor-pointer">
                  <Camera className="w-6 h-6 text-[#D5A60A]" />
                  <span className="text-sm text-gray-400 text-center">
                    Carregar imagem
                  </span>
                </div>
                {imagePreview && (
                  <div className="w-[50%]">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="w-[701px]">
          <h2 className="text-2xl mb-4">Insira detalhes sobre o seu relógio</h2>
          <p className="text-gray-400 text-sm mb-6">
            Forneça informações detalhadas sobre o relógio
          </p>
          <div className="grid grid-cols-2 gap-4">
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

            <Input
              {...register("braceletMaterial")}
              id="braceletMaterial"
              label="Material da pulseira"
              type="text"
              error={errors.braceletMaterial?.message as string}
              placeholder="Ex: Aço, Couro, Borracha"
            />

            <Input
              {...register("braceletColor")}
              id="braceletColor"
              label="Cor da pulseira"
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
    }

    if (step === 4) {
      return (
        <div className="w-[701px]">
          <h2 className="text-2xl mb-4">O que está incluído com seu relógio?</h2>

          <div className="space-y-4">
            <label
              className={`flex items-center justify-between py-1.5 pl-3.5 pr-1.5 bg-[#F7F7F7] rounded-lg cursor-pointer transition-all ${
                watch("includedAccessories") === "box_and_docs"
                  ? "font-normal"
                  : "font-light"
              }`}
            >
              <span className="text-sm">Caixa original e documentos originais</span>
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
                watch("includedAccessories") === "box_only" ? "font-normal" : "font-light"
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
                watch("includedAccessories") === "none" ? "font-normal" : "font-light"
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
    }

    if (step === 5) {
      return (
        <div className="w-[701px]">
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
                    watch("hasSignsOfWear") === "yes" ? "font-normal" : "font-light"
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
                    watch("hasSignsOfWear") === "no" ? "font-normal" : "font-light"
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

            <Select
              {...register("condition")}
              id="condition"
              label="Estado de conservação *"
              placeholder="Selecione..."
              error={errors.condition?.message}
            >
              <option value="Novo">Novo</option>
              <option value="Muito bom">Muito bom</option>
              <option value="Bom">Bom</option>
              <option value="Aceitável">Aceitável</option>
            </Select>
          </div>
        </div>
      );
    }

    if (step === 6) {
      return (
        <div className="w-[701px]">
          <h2 className="text-2xl mb-5">Diga-nos mais sobre o seu relógio</h2>
          <p className="text-gray-400 text-sm font-light leading-[20px] mb-5">
            Uma descrição detalhada reforça a confiança dos potenciais compradores.
            Utilize esta oportunidade para comunicar o valor do seu relógio e aumentar as
            suas oportunidades de venda.
          </p>

          <label className="block max-w-full overflow-hidden">
            <div className="text-sm mb-2">Descrição (Opcional)</div>
            <textarea
              {...register("description")}
              rows={8}
              className={clsx(
                "w-full px-3 py-3 border bg-[#F7F7F7] rounded-[12px] focus:outline-none transition-colors resize-none",
                errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#EFEFEF] focus:border-[#D5A60A]"
              )}
              placeholder="Ex: informações sobre a última manutenção, peças de substituição, sinais de uso e acessórios especiais."
            />
          </label>
        </div>
      );
    }

    if (step === 7) {
      return (
        <div className="space-y-5 lg:w-[572px] lg:max-w-[572px]">
          <h2 className="text-2xl leading-[30px] tracking-[-0.01em]">Preço</h2>
          <p className="text-gray-400 text-sm">Defina o preço de venda do seu relógio</p>

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
                      ? `- R$ ${(Number(watch("price")) * 0.095).toLocaleString("pt-BR", {
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
                        ? `R$ ${(Number(watch("price")) * 0.905).toLocaleString("pt-BR", {
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
    }

    return null;
  };

  const renderProgressBar = () => {
    if (step === 0) return null;

    return (
      <div className="flex items-center gap-4 mb-3 px-6 pt-4">
        <div className="flex-1 relative h-[2px] bg-[#EFEFEF] rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-[#D5A60A] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-xs font-light whitespace-nowrap">
          {String(step).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}
        </span>
      </div>
    );
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === "error" ? 5000 : 3000}
        />
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-150"
          onClose={submitting ? () => {} : handleClose}
        >
          <DialogBackdrop className="fixed inset-0 bg-black/30 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <DialogPanel className="w-full max-w-fit transform overflow-hidden rounded-4xl bg-white text-left align-middle shadow-xl transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white px-6 py-2 h-[48px]">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="absolute right-12 top-8 w-auto bg-transparent"
                    >
                      <Image src="/icons/close-icon.svg" alt="" width={32} height={32} />
                    </button>
                  </div>
                </div>

                {/* Content - com scrollbar sempre visível para evitar mudança de largura */}
                <div
                  className="px-12 pb-4 overflow-y-auto"
                  style={{ scrollbarGutter: "stable" }}
                >
                  {renderStep()}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 px-12 pt-2 pb-6">
                  {renderProgressBar()}

                  <div className="flex justify-between gap-4">
                    {step > 0 && (
                      <Button
                        type="button"
                        variant="stroke"
                        onClick={prev}
                        disabled={submitting}
                        className="w-[220px] h-[56px]"
                      >
                        Voltar
                      </Button>
                    )}

                    {step === 0 ? null : step < 7 ? (
                      <Button
                        type="button"
                        variant="gold"
                        onClick={next}
                        disabled={submitting}
                        className="w-[220px] h-[56px]"
                      >
                        Continuar
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="gold" //@ts-ignore
                        onClick={handleSubmit(onSubmit)}
                        disabled={submitting || Object.keys(errors).length > 0}
                        className="w-[220px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? "Criando..." : "Criar Anúncio"}
                      </Button>
                    )}
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
