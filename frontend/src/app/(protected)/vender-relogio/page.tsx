"use client";

import clsx from "clsx";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import nobileService from "@/lib/services/nobile.service";
import { useRouter } from "next/navigation";

type FormValues = {
  brand: string;
  model: string;
  referenceNumber?: string;
  movement?: string;
  year?: number | string;
  condition: string;
  price: number | string;
  description?: string;
  gender?: string;
  dialColor?: string;
  caseMaterial?: string;
  caseDiameter?: number | string;
  braceletMaterial?: string;
  braceletColor?: string;
  claspType?: string;
  images?: FileList | null;
  includedBox?: boolean;
  includedDocs?: boolean;
  includedOthers?: boolean;
  hasSignsOfWear?: "yes" | "no";
};

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
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      brand: "",
      model: "",
      condition: "Muito bom",
      price: "",
      includedBox: false,
      includedDocs: false,
      includedOthers: false,
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
    const arr = Array.from(files).slice(0, 6); // limit to 6 images
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
    if (step === 1) {
      if (!v.brand || !v.model) {
        addNotification(
          "error",
          "Campos obrigatórios",
          "Por favor, preencha a marca e o modelo do relógio antes de continuar."
        );
        return;
      }
    }
    if (step === 7) {
      return;
    }
    setStep(s => Math.min(s + 1, steps.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: FormValues) => {
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
      // inclusos
      form.append("includedBox", String(Boolean(data.includedBox)));
      form.append("includedDocs", String(Boolean(data.includedDocs)));
      form.append("includedOthers", String(Boolean(data.includedOthers)));
      form.append("hasSignsOfWear", String(data.hasSignsOfWear || "no"));

      // images
      // @ts-ignore
      const files: FileList | null = data.images ?? null;
      if (files && files.length > 0) {
        Array.from(files)
          .slice(0, 6)
          .forEach(file => {
            form.append("image", file);
          });
      }

      // chama o serviço (nobile.service.ts)
      const result = await nobileService.createWatch(form);

      // sucesso
      addNotification(
        "success",
        "Anúncio criado com sucesso!",
        "Seu relógio foi cadastrado e em breve estará disponível para venda."
      );

      // Redireciona após 2 segundos
      setTimeout(() => {
        try {
          router.push("/meus-anuncios");
        } catch {
          // if router not available, do nothing
        }
      }, 2000);

      return result;
    } catch (err: any) {
      console.error("Erro ao criar anúncio:", err);

      // Tratamento de erros mais específico
      let errorTitle = "Erro ao criar anúncio";
      let errorMessage = "Ocorreu um erro inesperado. Por favor, tente novamente.";

      if (err?.response?.status === 400) {
        errorTitle = "Dados inválidos";
        errorMessage =
          err?.response?.data?.message ||
          "Por favor, verifique os dados informados e tente novamente.";
      } else if (err?.response?.status === 401) {
        errorTitle = "Sessão expirada";
        errorMessage = "Sua sessão expirou. Por favor, faça login novamente.";
      } else if (err?.response?.status === 403) {
        errorTitle = "Acesso negado";
        errorMessage = "Você não tem permissão para realizar esta ação.";
      } else if (err?.response?.status === 500) {
        errorTitle = "Erro no servidor";
        errorMessage =
          "Nosso servidor está enfrentando problemas. Tente novamente em alguns minutos.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      addNotification("error", errorTitle, errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const StepIndicator: React.FC = () => {
    const progressPercentage = ((step - 1) / (steps.length - 1)) * 100;

    return (
      <div className="mb-8">
        {/* Progress Bar */}
        <div className="relative h-1 bg-[#EFEFEF] rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-[#D5A60A] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Counter */}
        <div className="flex items-center justify-end mt-3">
          <span className="text-sm text-gray-500 font-medium">
            {String(step).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    );
  };

  const NotificationContainer: React.FC = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={clsx(
              "flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-slide-in",
              {
                "bg-white border-red-200": notification.type === "error",
                "bg-white border-green-200": notification.type === "success",
                "bg-white border-blue-200": notification.type === "info",
              }
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {notification.type === "error" && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              {notification.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              {notification.type === "info" && (
                <AlertCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4
                className={clsx("font-semibold text-sm mb-1", {
                  "text-red-900": notification.type === "error",
                  "text-green-900": notification.type === "success",
                  "text-blue-900": notification.type === "info",
                })}
              >
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 break-words">{notification.message}</p>
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-xl lg:text-3xl mb-4">
              Qual relógio você deseja anunciar?
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Digite a marca, modelo ou referência do seu relógio para facilitar o
              preenchimento automático das informações.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Marca *</div>
                <input
                  {...register("brand", { required: true })}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
                  placeholder="Ex: Patek Philippe"
                />
                {errors.brand && (
                  <span className="text-red-500 text-xs mt-1">Campo obrigatório</span>
                )}
              </label>
              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Modelo *</div>
                <input
                  {...register("model", { required: true })}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
                  placeholder="Ex: Aquanaut Chronograph"
                />
                {errors.model && (
                  <span className="text-red-500 text-xs mt-1">Campo obrigatório</span>
                )}
              </label>
              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Número de referência</div>
                <input
                  {...register("referenceNumber")}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
                  placeholder="Ex: 5968R-001"
                />
              </label>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-xl lg:text-3xl mb-4">Complete o título do anúncio</h2>
            <p className="text-gray-600 text-sm mb-6">
              Indique características especiais do seu relógio para que este tenha mais
              visibilidade.
            </p>
            <label className="block max-w-full overflow-hidden">
              <div className="text-sm text-gray-700 mb-2">
                Informações adicionais sobre o título (opcional)
              </div>
              <input
                {...register("description")}
                className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
                placeholder="Digite..."
              />
            </label>

            {/* Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="text-xs text-gray-500 mb-2">Pré-visualização</div>
              <h3 className="font-semibold text-lg break-words">
                {watch("brand") || "Marca"}
              </h3>
              <p className="text-gray-600 break-words">{watch("model") || "Modelo"}</p>
              {watch("description") && (
                <p className="text-sm text-gray-500 mt-1 break-words overflow-wrap-anywhere">
                  {watch("description")}
                </p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-xl lg:text-3xl mb-4">
              Insira detalhes sobre o seu relógio
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Já preenchemos alguns detalhes com base no modelo. Verifique-os e, se
              necessário, corrija-os.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Ano de fabricação</div>
                <input
                  type="number"
                  {...register("year")}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
                  placeholder="Ex: 2012"
                />
              </label>

              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Gênero</div>
                <select
                  {...register("gender")}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors bg-white"
                >
                  <option value="">Selecione...</option>
                  <option value="Homem">Homem</option>
                  <option value="Mulher">Mulher</option>
                  <option value="Unissex">Unissex</option>
                </select>
              </label>

              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Cor do mostrador</div>
                <input
                  {...register("dialColor")}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
                  placeholder="Castanho"
                />
              </label>

              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Diâmetro (mm)</div>
                <input
                  type="number"
                  step="0.1"
                  {...register("caseDiameter")}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
                  placeholder="40"
                />
              </label>

              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Movimento</div>
                <select
                  {...register("movement")}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors bg-white"
                >
                  <option value="">Selecione...</option>
                  <option value="Automático">Automático</option>
                  <option value="Manual">Manual</option>
                  <option value="Quartzo">Quartzo</option>
                </select>
              </label>

              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Material da caixa</div>
                <input
                  {...register("caseMaterial")}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
                  placeholder="Ouro rosa"
                />
              </label>

              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Material do bracelete</div>
                <input
                  {...register("braceletMaterial")}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
                  placeholder="Borracha"
                />
              </label>

              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Cor do bracelete</div>
                <input
                  {...register("braceletColor")}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
                  placeholder="Castanho"
                />
              </label>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-xl lg:text-3xl mb-4">
              O que está incluído com seu relógio?
            </h2>
            <div className="space-y-3 mt-6">
              <label className="flex items-center gap-3 p-4 border border-[#EFEFEF] rounded-lg cursor-pointer hover:border-[#D5A60A] transition-colors">
                <input
                  type="checkbox"
                  {...register("includedBox")}
                  className="w-5 h-5 accent-[#D5A60A]"
                />
                <span className="text-gray-700">Caixa original</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-[#EFEFEF] rounded-lg cursor-pointer hover:border-[#D5A60A] transition-colors">
                <input
                  type="checkbox"
                  {...register("includedDocs")}
                  className="w-5 h-5 accent-[#D5A60A]"
                />
                <span className="text-gray-700">Documentos originais</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-[#EFEFEF] rounded-lg cursor-pointer hover:border-[#D5A60A] transition-colors">
                <input
                  type="checkbox"
                  {...register("includedOthers")}
                  className="w-5 h-5 accent-[#D5A60A]"
                />
                <span className="text-gray-700">Sem mais acessórios</span>
              </label>
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h2 className="text-xl lg:text-3xl mb-4">Indique o estado do seu relógio</h2>
            <p className="text-gray-600 text-sm mb-6">
              Sinais de utilização, tais como riscos ou amolgadelas.
            </p>
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Seu relógio apresenta sinais de desgaste?
              </div>
              <label className="flex items-center gap-3 p-4 border border-[#EFEFEF] rounded-lg cursor-pointer hover:border-[#D5A60A] transition-colors">
                <input
                  type="radio"
                  value="no"
                  {...register("hasSignsOfWear")}
                  className="w-5 h-5 accent-[#D5A60A]"
                  defaultChecked
                />
                <span className="text-gray-700">Não</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-[#EFEFEF] rounded-lg cursor-pointer hover:border-[#D5A60A] transition-colors">
                <input
                  type="radio"
                  value="yes"
                  {...register("hasSignsOfWear")}
                  className="w-5 h-5 accent-[#D5A60A]"
                />
                <span className="text-gray-700">Sim</span>
              </label>
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <h2 className="text-xl lg:text-3xl mb-4">
              Diga-nos mais sobre o seu relógio
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Uma descrição detalhada reforça a confiança dos potenciais compradores.
              Utilize esta oportunidade para comunicar o valor do seu relógio e aumentar
              as suas oportunidades de venda.
            </p>
            <label className="block max-w-full overflow-hidden">
              <div className="text-sm text-gray-700 mb-2">Descrição (Opcional)</div>
              <textarea
                {...register("description")}
                rows={6}
                className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] bg-[#F7F7F7] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors resize-none"
                placeholder="Ex: informações sobre a última manutenção, peças de substituição, sinais de uso e acessórios especiais."
              />
            </label>
          </div>
        );
      case 7:
        return (
          <div>
            <h2 className="text-xl lg:text-3xl mb-4">Defina o seu preço de venda</h2>
            <div className="space-y-6">
              <label className="block max-w-full overflow-hidden">
                <div className="text-sm text-gray-700 mb-2">Preço de venda *</div>
                <div className="text-xs text-gray-500 mb-2">Sugestão: R$ 508.940,32</div>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { required: true })}
                  className="w-full max-w-full px-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
                  placeholder="508940.32"
                />
                {errors.price && (
                  <span className="text-red-500 text-sm mt-1">Campo obrigatório</span>
                )}
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
                            { minimumFractionDigits: 2 }
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
                              { minimumFractionDigits: 2 }
                            )}`
                          : "R$ 0,00"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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

      <div className="hidden lg:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Vender relógio" }]}
          />
          <h1 className="text-3xl lg:text-[32px] leading-[100%] mt-2">Vender relógio</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-6 lg:py-12">
        <div className="bg-white lg:shadow-sm lg:rounded-2xl lg:border border-gray-200 p-6 lg:p-8 overflow-x-hidden">
          <StepIndicator />

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
                  className="w-full lg:w-auto lg:min-w-[200px] lg:ml-auto"
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  variant="gold"
                  type="submit"
                  disabled={submitting}
                  className="w-full lg:w-auto lg:min-w-[200px] lg:ml-auto"
                >
                  {submitting ? "Enviando..." : "Continuar"}
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
