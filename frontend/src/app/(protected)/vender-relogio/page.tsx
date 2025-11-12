"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Step1WatchIdentification } from "@/components/seller/Step1WatchIdentification";
import { Breadcrumbs, Button, FieldError } from "@/components/ui";

import { CreateWatchFormValues, watchSchema } from "@/lib/validations/watch";

type NotificationType = "success" | "error" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
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

export default function VenderRelogioPage() {
  const [step, setStep] = useState<number>(1);
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

    // Remove automaticamente após 5 segundos
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
          "caseWidth",
          "caseHeight",
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

    // Trigger validação dos campos do step atual
    const isStepValid = await trigger(fieldsToValidate);

    if (!isStepValid) {
      addNotification(
        "error",
        "Campos inválidos",
        "Por favor, corrija os erros antes de continuar."
      );
      return;
    }

    // Validações específicas por step
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
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: CreateWatchFormValues) => {
    console.log("data", data);
    // Validação final: garantir que estamos no step 7
    if (step !== 7) {
      addNotification(
        "info",
        "Complete todos os passos",
        "Por favor, preencha todos os passos antes de criar o anúncio."
      );
      return;
    }

    // Validar campos obrigatórios finais
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
      if (data.customTitleSuffix)
        form.append("customTitleSuffix", String(data.customTitleSuffix));
      if (data.serialNumber) form.append("serialNumber", String(data.serialNumber));
      if (data.movement) form.append("movement", String(data.movement));
      if (data.year) form.append("year", String(data.year));
      form.append("condition", String(data.condition || ""));
      if (data.price !== undefined) form.append("price", String(data.price));
      if (data.description) form.append("description", String(data.description));
      if (data.gender) form.append("gender", String(data.gender));
      if (data.dialColor) form.append("dialColor", String(data.dialColor));
      if (data.caseMaterial) form.append("caseMaterial", String(data.caseMaterial));
      if (data.caseDiameter) form.append("caseDiameter", String(data.caseDiameter));
      if (data.caseWidth) form.append("caseWidth", String(data.caseWidth));
      if (data.caseHeight) form.append("caseHeight", String(data.caseHeight));
      if (data.braceletMaterial)
        form.append("braceletMaterial", String(data.braceletMaterial));
      if (data.braceletColor) form.append("braceletColor", String(data.braceletColor));
      if (data.claspType) form.append("claspType", String(data.claspType));
      // inclusos
      form.append("includedAccessories", String(data.includedAccessories || "none"));
      form.append("hasSignsOfWear", String(data.hasSignsOfWear || "no"));
      console.log("form", form);

      // images
      // @ts-ignore
      // const files: FileList | null = data.images ?? null;
      // if (files && files.length > 0) {
      //   Array.from(files)
      //     .slice(0, 6)
      //     .forEach(file => {
      //       form.append("image", file);
      //     });
      // }
      const imgs = Array.from(data.images || []) as File[];
      for (const img of imgs) {
        form.append("images", img);
      }

      //essa parte pode ser removida depois
      await new Promise(resolve => setTimeout(resolve, 2000));

      addNotification(
        "success",
        "Anúncio criado!",
        "Seu anúncio foi criado com sucesso e está em análise."
      );
      //essa parte pode ser removida depois

      // p/ baixo é oque precisa manter
      // chama o serviço (nobile.service.ts)
      // const result = await nobileService.createWatch(form);

      // // sucesso
      // addNotification(
      //   "success",
      //   "Anúncio criado com sucesso!",
      //   "Seu relógio foi cadastrado e em breve estará disponível para venda."
      // );

      // // Redireciona após 2 segundos
      // setTimeout(() => {
      //   router.push("/meus-anuncios");
      // }, 2000);

      // return result;
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
              className={clsx("font-semibold text-sm mb-1", {
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
    switch (step) {
      case 1:
        return (
          <Step1WatchIdentification
            setValue={setValue}
            watch={watch}
            errors={errors}
            register={register}
          />
        );
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

            {/* Preview Card */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Pré-visualização</p>
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm mb-2">{watch("brand") || "Marca"}</p>
                  <h3 className="truncate">{watch("model") || "Modelo"}</h3>
                  <p className="text-xs text-gray-600 truncate mt-1">
                    {watch("referenceNumber") ||
                      "Informações adicionais aparecem aqui..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-4">
              Insira detalhes sobre o seu relógio
            </h2>
            <p className="font-light lg:font-normal text-gray-400 text-sm">
              Já preenchemos alguns detalhes com base no modelo. Verifique-os e, se
              necessário, corrija-os.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <label className="block">
                <div className="text-sm mb-2.5">Ano de fabricação</div>
                <input
                  type="number"
                  {...register("year")}
                  className={clsx(
                    "w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                    errors.year
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#EFEFEF] focus:border-[#D5A60A]"
                  )}
                  placeholder="Ex: 2012"
                />
                <FieldError error={errors.year} />
              </label>

              <label className="block">
                <div className="text-sm mb-2.5">Gênero</div>
                <select
                  {...register("gender")}
                  className={clsx(
                    "w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                    errors.gender
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#EFEFEF] focus:border-[#D5A60A]"
                  )}
                >
                  <option value="">Selecione...</option>
                  <option value="Homem">Homem</option>
                  <option value="Mulher">Mulher</option>
                  <option value="Unissex">Unissex</option>
                </select>
                <FieldError error={errors.gender} />
              </label>

              <label className="block">
                <div className="text-sm mb-2.5">Número de série (não será publicado)</div>
                <input
                  type="text"
                  {...register("serialNumber")}
                  className={clsx(
                    "w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                    errors.serialNumber
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#EFEFEF] focus:border-[#D5A60A]"
                  )}
                  placeholder="Digite..."
                  maxLength={100}
                />
                <FieldError error={errors.serialNumber} />
              </label>

              <label className="block">
                <div className="text-sm mb-2.5">Cor do mostrador</div>
                <select
                  {...register("dialColor")}
                  className={clsx(
                    "w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                    errors.dialColor
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#EFEFEF] focus:border-[#D5A60A]"
                  )}
                >
                  <option value="">Selecionar</option>
                  <option value="Yellow">Amarelo</option>
                  <option value="Blue">Azul</option>
                  <option value="Bordeaux">Bordeaux</option>
                  <option value="White">Branco</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Brown">Castanho</option>
                  <option value="Beige">Champanhe</option>
                  <option value="Gray">Cinzento</option>
                  <option value="Pink">Cor-de-rosa</option>
                  <option value="Skeletonized">Esqueletizado</option>
                  <option value="Orange">Laranja</option>
                  <option value="MotherOfPearl">Madrepérola</option>
                  <option value="Meteorite">Meteorito</option>
                  <option value="Gold">Ouro</option>
                  <option value="SolidGold">Ouro (maciço)</option>
                  <option value="Silver">Prata</option>
                  <option value="SolidSilver">Prata (maciça)</option>
                  <option value="Black">Preto</option>
                  <option value="Turquoise">Turquesa</option>
                  <option value="Green">Verde</option>
                  <option value="Red">Vermelho</option>
                  <option value="Purple">Violeta</option>
                </select>
                <FieldError error={errors.dialColor} />
              </label>

              <label className="block">
                <div className="text-sm mb-2.5">Diâmetro (mm)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    {...register("caseWidth")}
                    className={clsx(
                      "w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                      errors.caseWidth
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#EFEFEF] focus:border-[#D5A60A]"
                    )}
                    placeholder="40"
                  />
                  <span className="text-gray-500 text-sm">x</span>
                  <input
                    type="number"
                    step="0.1"
                    {...register("caseHeight")}
                    className={clsx(
                      "w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                      errors.caseHeight
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#EFEFEF] focus:border-[#D5A60A]"
                    )}
                    placeholder="40"
                  />
                </div>
                {(errors.caseWidth || errors.caseHeight) && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.caseWidth?.message || errors.caseHeight?.message}
                  </span>
                )}
              </label>

              <label className="block">
                <div className="text-sm mb-2.5">Movimento</div>
                <select
                  {...register("movement")}
                  className={clsx(
                    "w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                    errors.movement
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#EFEFEF] focus:border-[#D5A60A]"
                  )}
                >
                  <option value="">Selecione...</option>
                  <option value="Automático">Automático</option>
                  <option value="Corda manual">Corda manual</option>
                  <option value="Quartzo">Quartzo</option>
                  <option value="Smartwatch">Smartwatch</option>
                  <option value="Solar">Solar</option>
                </select>
                <FieldError error={errors.movement} />
              </label>

              <label className="block">
                <div className="text-sm mb-2.5">Material da caixa</div>
                <input
                  type="text"
                  {...register("caseMaterial")}
                  className={clsx(
                    "w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                    errors.caseMaterial
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#EFEFEF] focus:border-[#D5A60A]"
                  )}
                  placeholder="Ex: Ouro rosa"
                />
                <FieldError error={errors.caseMaterial} />
              </label>

              <label className="block">
                <div className="text-sm mb-2.5">Material do bracelete</div>
                <input
                  type="text"
                  {...register("braceletMaterial")}
                  className={clsx(
                    "w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                    errors.braceletMaterial
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#EFEFEF] focus:border-[#D5A60A]"
                  )}
                  placeholder="Ex: Couro"
                />
                <FieldError error={errors.braceletMaterial} />
              </label>

              <label className="block">
                <div className="text-sm mb-2.5">Cor do bracelete</div>
                <select
                  {...register("braceletColor")}
                  className={clsx(
                    "w-full px-3 py-3 border rounded-[12px] focus:outline-none transition-colors",
                    errors.braceletColor
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#EFEFEF] focus:border-[#D5A60A]"
                  )}
                >
                  <option value="">Selecionar</option>
                  <option value="Steel">Aço</option>
                  <option value="Yellow">Amarelo</option>
                  <option value="Blue">Azul</option>
                  <option value="Beige">Bege</option>
                  <option value="Bordeaux">Bordeaux</option>
                  <option value="White">Branco</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Brown">Castanho</option>
                  <option value="Gray">Cinzento</option>
                  <option value="Pink">Cor-de-rosa</option>
                  <option value="Gold">Dourado</option>
                  <option value="GoldSteel">Ouro/aço</option>
                  <option value="Orange">Laranja</option>
                  <option value="Silver">Prateado</option>
                  <option value="Black">Preto</option>
                  <option value="Green">Verde</option>
                  <option value="Red">Vermelho</option>
                  <option value="Purple">Violeta</option>
                </select>
                <FieldError error={errors.braceletColor} />
              </label>
            </div>

            {/* Upload de imagens */}
            <div>
              <div className="text-sm mb-2.5">Imagens do relógio</div>
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
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-6">
              O que está incluído com seu relógio?
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between gap-3 h-[42px] pl-[14px] pr-1.5 bg-[#F7F7F7] rounded-lg cursor-pointer hover:bg-linear-50 transition-colors">
                <span className="text-sm font-light">
                  Caixa original e documentos originais
                </span>
                <input
                  type="radio"
                  value="box_and_docs"
                  {...register("includedAccessories")}
                  className="w-6 h-6 accent-white"
                />
              </label>

              <label className="flex items-center justify-between gap-3 h-[42px] pl-[14px] pr-1.5 bg-[#F7F7F7] rounded-lg cursor-pointer hover:bg-linear-50 transition-colors">
                <span className="text-sm font-light">Caixa original</span>
                <input
                  type="radio"
                  value="box_only"
                  {...register("includedAccessories")}
                  className="w-6 h-6 accent-white"
                />
              </label>

              <label className="flex items-center justify-between gap-3 h-[42px] pl-[14px] pr-1.5 bg-[#F7F7F7] rounded-lg cursor-pointer hover:bg-linear-50 transition-colors">
                <span className="text-sm font-light">Documentos originais</span>
                <input
                  type="radio"
                  value="docs_only"
                  {...register("includedAccessories")}
                  className="w-6 h-6 accent-white"
                />
              </label>

              <label className="flex items-center justify-between gap-3 h-[42px] pl-[14px] pr-1.5 bg-[#F7F7F7] rounded-lg cursor-pointer hover:bg-linear-50 transition-colors">
                <span className="text-sm font-light">Sem mais acessórios</span>
                <input
                  type="radio"
                  value="none"
                  {...register("includedAccessories")}
                  className="w-6 h-6 accent-white"
                />
              </label>
            </div>

            <FieldError error={errors.includedAccessories} />
          </div>
        );
      case 5:
        return (
          <div>
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-4">
              Indique o estado do seu relógio
            </h2>
            <p className="text-gray-400 text-sm font-light lg:font-normal mb-6">
              Sinais de utilização, tais como riscos ou amolgadelas.
            </p>
            <div className="space-y-4">
              <div className="text-sm">Seu relógio apresenta sinais de desgaste? *</div>
              <div className="flex gap-6">
                <label className="flex items-center w-[64px] h-[42px] gap-2 bg-[#F7F7F7] rounded-lg cursor-pointer hover:border-[#D5A60A] transition-colors">
                  <input
                    type="radio"
                    value="no"
                    {...register("hasSignsOfWear")}
                    className="accent-[#e7f6eb]"
                    defaultChecked
                  />
                  <span className="text-sm font-light">Não</span>
                </label>
                <label className="flex items-center w-[64px] h-[42px] gap-2 bg-[#F7F7F7] rounded-lg cursor-pointer hover:border-[#D5A60A] transition-colors">
                  <input
                    type="radio"
                    value="yes"
                    {...register("hasSignsOfWear")}
                    className="accent-[#e7f6eb]"
                  />
                  <span className="text-sm font-light">Sim</span>
                </label>
              </div>
              <FieldError error={errors.hasSignsOfWear} />
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em] mb-4">
              Diga-nos mais sobre o seu relógio
            </h2>
            <p className="font-light lg:font-normal text-gray-400 text-sm leading-[20px] mb-6">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Vender relógio" }]}
          />
          <h1 className="text-3xl lg:text-[32px] leading-[100%] mt-2">Vender relógio</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-6">
        <div className="bg-white lg:p-8 overflow-x-hidden">
          {step > 1 && <StepIndicator />}
          {/* @ts-ignore */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8">{renderStep()}</div>

            <div className="flex flex-col-reverse lg:flex-row lg:items-center lg:justify-between gap-4 pt-6 border-t border-gray-200">
              {step > 1 && (
                <Button
                  variant="stroke"
                  type="button"
                  onClick={prev}
                  className="w-full lg:w-auto lg:min-w-[200px]"
                >
                  Voltar
                </Button>
              )}

              {step < steps.length ? (
                <Button
                  variant="gold"
                  type="button"
                  onClick={next}
                  className={`w-full lg:w-auto lg:min-w-[200px] ${step > 1 ? "lg:ml-auto" : "lg:mx-auto"}`}
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
          </form>
        </div>
      </div>

      <style jsx global>{`
        /* Previne scroll horizontal global */
        html,
        body {
          overflow-x: hidden;
          max-width: 100vw;
        }

        /* Garante que inputs não ultrapassem o container */
        input:not([type="checkbox"]):not([type="radio"]),
        textarea,
        select {
          max-width: 100%;
          box-sizing: border-box;
        }

        /* Quebra de linha em elementos de texto */
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

        /* Previne overflow em containers */
        * {
          box-sizing: border-box;
        }

        /* Animações para notificações */
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
