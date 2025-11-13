"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Step1Identification } from "@/components/seller/Step1Identification";
import { WatchSearchStep } from "@/components/seller/WatchSearchStep";
import { Breadcrumbs, Button, FieldError, Input, Select } from "@/components/ui";

import { PreviewCard } from "@/components/seller/PreviewCard";
import { dialColorOptions, genderOptions } from "@/lib/constants";
import { CreateWatchFormValues, watchSchema } from "@/lib/validations/watch";

type NotificationType = "success" | "error" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

// Steps do fluxo (sem contar a busca inicial)
const steps = [
  { id: 1, title: "Identificação" },
  { id: 2, title: "Título & Destaque" },
  { id: 3, title: "Detalhes" },
  { id: 4, title: "Inclusos" },
  { id: 5, title: "Estado" },
  { id: 6, title: "Descrição" },
  { id: 7, title: "Preço & Envio" },
];

export default function VenderRelogioPage() {
  // step 0 = busca inicial (não faz parte dos 7 steps)
  // steps 1-7 = fluxo de criação do anúncio
  const [step, setStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
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

  const addNotification = (type: NotificationType, title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = { id, type, title, message };

    setNotifications(prev => [...prev, notification]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleImagesChange = (files?: FileList | null) => {
    if (!files || files.length === 0) {
      setImagePreviews([]);
      return;
    }
    const arr = Array.from(files).slice(0, 6);
    const readers = arr.map(
      file =>
        new Promise<string>(res => {
          const fr = new FileReader();
          fr.onload = () => res(String(fr.result));
          fr.readAsDataURL(file);
        })
    );
    Promise.all(readers).then(urls => setImagePreviews(urls));
  };

  const next = async () => {
    const v = getValues();

    // Validação por step
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
      addNotification(
        "error",
        "Campos inválidos",
        "Por favor, corrija os erros antes de continuar."
      );
      return;
    }

    // Validações específicas
    if (step === 1) {
      if (!v.brand || !v.model) {
        addNotification(
          "error",
          "Campos obrigatórios",
          "Por favor, preencha a marca e o modelo do relógio."
        );
        return;
      }
    }

    if (step === 7) {
      return; // No step 7, não avança mais
    }

    setStep(s => Math.min(s + 1, steps.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    // Se estiver no step 1, volta para a busca (step 0)
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: CreateWatchFormValues) => {
    console.log("data", data);
    if (step !== 7) {
      addNotification(
        "info",
        "Complete todos os passos",
        "Por favor, preencha todos os passos antes de criar o anúncio."
      );
      return;
    }

    const finalValidation = await trigger();
    if (!finalValidation) {
      addNotification(
        "error",
        "Formulário incompleto",
        "Por favor, corrija todos os erros antes de criar o anúncio."
      );
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("brand", String(data.brand));
      form.append("model", String(data.model));
      if (data.referenceNumber)
        form.append("referenceNumber", String(data.referenceNumber));

      if (data.movement) form.append("movement", String(data.movement));
      if (data.year) form.append("year", String(data.year));
      form.append("condition", String(data.condition || ""));
      if (data.price !== undefined) form.append("price", String(data.price));
      if (data.description) form.append("description", String(data.description));
      if (data.gender) form.append("gender", String(data.gender));
      if (data.dialColor) form.append("dialColor", String(data.dialColor));
      if (data.caseMaterial) form.append("caseMaterial", String(data.caseMaterial));
      if (data.caseDiameter) form.append("caseDiameter", String(data.caseDiameter));
      if (data.braceletMaterial)
        form.append("braceletMaterial", String(data.braceletMaterial));
      if (data.braceletColor) form.append("braceletColor", String(data.braceletColor));
      if (data.claspType) form.append("claspType", String(data.claspType));

      // não existe no backend
      if (data.customTitleSuffix)
        form.append("customTitleSuffix", String(data.customTitleSuffix));
      if (data.serialNumber) form.append("serialNumber", String(data.serialNumber));
      form.append("hasSignsOfWear", String(data.hasSignsOfWear || "no"));
      form.append("includedAccessories", String(data.includedAccessories || "none"));

      // só existe o campo "image" que aceita uma imagem
      const imgs = Array.from(data.images || []) as File[];
      for (const img of imgs) {
        form.append("image", img);
      }

      // Simulação de envio
      await new Promise(resolve => setTimeout(resolve, 2000));

      addNotification(
        "success",
        "Anúncio criado!",
        "Seu anúncio foi criado com sucesso e está em análise."
      );

      // Código real comentado:
      // const result = await nobileService.createWatch(form);
      // addNotification("success", "Anúncio criado com sucesso!", "...");
      // setTimeout(() => router.push("/meus-anuncios"), 2000);
    } catch (error: any) {
      addNotification("error", "Erro ao criar anúncio", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={clsx(
            "flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-slide-in",
            {
              "bg-green-50 border-green-200": notification.type === "success",
              "bg-red-50 border-red-200": notification.type === "error",
              "bg-blue-50 border-blue-200": notification.type === "info",
            }
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {notification.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            {notification.type === "error" && (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            {notification.type === "info" && (
              <AlertCircle className="w-5 h-5 text-blue-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4
              className={clsx("font-lato font-semibold text-sm mb-1", {
                "text-green-900": notification.type === "success",
                "text-red-900": notification.type === "error",
                "text-blue-900": notification.type === "info",
              })}
            >
              {notification.title}
            </h4>
            <p
              className={clsx("text-sm", {
                "text-green-700": notification.type === "success",
                "text-red-700": notification.type === "error",
                "text-blue-700": notification.type === "info",
              })}
            >
              {notification.message}
            </p>
          </div>

          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );

  const StepIndicator = () => {
    const progressPercentage = ((step - 1) / (steps.length - 1)) * 100;

    return (
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center gap-4 h-2">
          {/* Progress Bar */}
          <div className="flex-1 relative h-[2px] bg-[#EFEFEF] rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#D5A60A] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Step Counter */}
          <span className="text-xs font-light whitespace-nowrap">
            {String(step).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    // Step 0 = Busca inicial (não faz parte dos 7 steps)
    if (step === 0) {
      return <WatchSearchStep setValue={setValue} onContinue={() => setStep(1)} />;
    }

    // Steps 1-7 = Fluxo de criação do anúncio
    switch (step) {
      case 1:
        return <Step1Identification watch={watch} errors={errors} register={register} />;
      case 2:
        return (
          <div>
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-4">
              Complete o título do anúncio
            </h2>
            <p className="text-gray-400 text-sm font-light leading-[20px] mb-6">
              Indique características especiais do seu relógio para que este tenha mais
              visibilidade.
            </p>
            <label className="block max-w-full overflow-hidden">
              <div className="text-sm leading-[24px] mb-2.5">
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
              <FieldError error={errors.customTitleSuffix} />
            </label>

            <PreviewCard
              brand={watch("brand")}
              model={watch("model")}
              referenceNumber={
                watch("referenceNumber") || "Informações adicionais aparecem aqui..."
              }
              className="mt-6"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-5">
              Insira detalhes sobre o seu relógio
            </h2>
            <p className="font-light lg:font-normal text-gray-400 text-sm">
              Já preenchemos alguns detalhes com base no modelo. Verifique-os e, se
              necessário, corrija-os.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <Select
                {...register("dialColor")}
                id="dialColor"
                label="Cor do mostrador"
                placeholder="Selecione..."
                error={errors.dialColor?.message}
                options={dialColorOptions}
              />

              <Select
                {...register("movement")}
                id="movement"
                label="Movimento"
                placeholder="Selecione..."
                error={errors.movement?.message}
              >
                <option value="">Selecionar</option>
                <option value="Automático">Automático</option>
                <option value="Corda manual">Corda manual</option>
                <option value="Quartzo">Quartzo</option>
                <option value="Smartwatch">Smartwatch</option>
                <option value="Solar">Solar</option>
              </Select>

              <Input
                {...register("caseMaterial")}
                id="caseMaterial"
                label="Material da caixa"
                type="text"
                error={errors.caseMaterial?.message as string}
                placeholder="Ex: Aço inoxidável, ouro, titânio..."
              />

              <Input
                {...register("caseDiameter")}
                id="caseDiameter"
                label="Diâmetro da caixa (mm)"
                type="number"
                error={errors.caseDiameter?.message as string}
                placeholder="Ex: 42"
              />

              <Input
                {...register("braceletMaterial")}
                id="braceletMaterial"
                label="Material do bracelete"
                type="text"
                error={errors.braceletMaterial?.message as string}
                placeholder="Ex: Aço, couro, borracha..."
              />

              <Input
                {...register("braceletColor")}
                id="braceletColor"
                //      label='Cor da pulseira' -> seria o correto
                label="Cor do bracelete"
                type="text"
                error={errors.braceletColor?.message as string}
                placeholder="Castanho"
              />

              <Input
                {...register("claspType")}
                id="claspType"
                label="Tipo de fecho"
                type="text"
                error={errors.claspType?.message as string}
                placeholder="Ex: Fecho Dobrável"
              />

              {/* <Input
                {...register("waterResistance")}
                id="waterResistance"
                label="Resistência à água"
                type="text"
                error={errors.waterResistance?.message as string}
                placeholder="Ex: Fecho Dobrável"
              /> */}

              {/* <Input
                {...register("glassType")}
                id="waterResistance"
                label="Resistência à água"
                type="text"
                error={errors.waterResistance?.message as string}
                placeholder="Ex: Cristal de Safira"
              /> */}
            </div>

            {/* Upload de imagens */}
            <div>
              <div className="text-base mb-4">Imagens do relógio</div>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  {...register("images")}
                  onChange={e => handleImagesChange(e.target.files)}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#D5A60A] transition-colors">
                  <p className="text-gray-600 mb-2">Clique para adicionar imagens</p>
                  <p className="text-sm text-gray-500">Até 6 imagens</p>
                </div>
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((url, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-5">
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
            <FieldError error={errors.includedAccessories} />
          </div>
        );
      case 5:
        return (
          <div>
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-5">
              Indique o estado do seu relógio
            </h2>

            <p className="text-sm font-light lg:font-normal text-gray-400 mb-5">
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
                <FieldError error={errors.hasSignsOfWear} />
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
      case 6:
        return (
          <div>
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-4">
              Adicione uma descrição
            </h2>
            <p className="text-gray-400 text-sm leading-[20px] mb-6">
              Uma descrição detalhada reforça a confiança dos potenciais compradores.
              Utilize esta oportunidade para comunicar o valor do seu relógio e aumentar
              as suas oportunidades de venda.
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
              <FieldError error={errors.description} />
            </label>
          </div>
        );
      case 7:
        return (
          <div>
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-4">
              Defina o seu preço de venda
            </h2>
            <div className="space-y-6">
              <label className="block max-w-full overflow-hidden">
                <div className="text-sm mb-2">Preço de venda *</div>
                <div className="text-xs text-gray-500 mb-2">Sugestão: R$ 508.940,32</div>
                <input
                  type="number"
                  step="0.01"
                  {...register("price")}
                  className={clsx(
                    "w-full max-w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                    errors.price
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#EFEFEF] focus:border-[#D5A60A]"
                  )}
                  placeholder="508940.32"
                />
                <FieldError error={errors.price} />
              </label>

              {/* Cálculo de taxas */}
              <div className="p-4 bg-[#FFF9E6] rounded-lg border border-[#D5A60A]/20">
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
                        ? `- R$ ${(Number(watch("price")) * 0.095).toLocaleString(
                            "pt-BR",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}`
                        : "R$ 0,00"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#D5A60A]/20">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Pagamento estimado:</span>
                      <span className="text-[#D5A60A]">
                        {watch("price")
                          ? `R$ ${(Number(watch("price")) * 0.905).toLocaleString(
                              "pt-BR",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}`
                          : "R$ 0,00"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aviso de validação */}
              {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-lato font-semibold text-sm text-red-900 mb-1">
                        Existem erros no formulário
                      </h4>
                      <p className="text-sm text-red-700">
                        Por favor, corrija todos os erros antes de criar o anúncio.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <NotificationContainer />

      <MobileBackHeader title="Vender relógio" />

      <div className="hidden lg:block bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-10 py-6">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Vender relógio" }]}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 lg:px-0 py-6 lg:py-4">
        <div className="bg-white lg:p-0 overflow-x-hidden">
          {/* Indicador de progresso - só aparece após o step 0 (busca) */}
          {step > 0 && <StepIndicator />}

          {/* @ts-ignore */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8">{renderStep()}</div>

            {/* Botões de navegação */}
            {step > 0 && (
              <div className="flex flex-col-reverse lg:flex-row lg:items-center lg:justify-between gap-4 pt-6 border-t border-gray-200">
                <Button
                  variant="stroke"
                  type="button"
                  onClick={prev}
                  className="w-full lg:w-auto lg:min-w-[200px]"
                >
                  Voltar
                </Button>

                {step < steps.length ? (
                  <Button
                    variant="gold"
                    type="button"
                    onClick={next}
                    className="w-full lg:w-auto lg:min-w-[200px] lg:ml-auto"
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    variant="gold"
                    type="submit"
                    disabled={submitting || Object.keys(errors).length > 0}
                    className="w-full lg:w-auto lg:min-w-[200px] lg:ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Criando anúncio..." : "Criar anúncio"}
                  </Button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      <style jsx global>{`
        html,
        body {
          overflow-x: hidden;
          max-width: 100vw;
        }

        input:not([type="checkbox"]):not([type="radio"]),
        textarea,
        select {
          max-width: 100%;
          box-sizing: border-box;
        }

        p,
        span,
        div,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        * {
          box-sizing: border-box;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
