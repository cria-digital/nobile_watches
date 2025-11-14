"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

interface AddressFormData {
  country: string;
  zipCode: string;
  state: string;
  street: string;
  complement: string;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  addresses: AddressFormData[];
}

export default function EditProfilePage() {
  const router = useRouter();
  const { data, updateUserData, isLoading: isLoadingProfile } = useUserProfile();
  const [showPhone, setShowPhone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      addresses: [
        {
          country: "Brasil",
          zipCode: "",
          state: "",
          street: "",
          complement: "",
        },
        {
          country: "Brasil",
          zipCode: "",
          state: "",
          street: "",
          complement: "",
        },
      ],
    },
  });

  const { fields: addressFields } = useFieldArray({
    control,
    name: "addresses",
  });

  // Preencher valores quando os dados estiverem disponíveis
  useEffect(() => {
    if (data) {
      reset({
        name: data.user?.name || "",
        email: data.user?.email || "",
        phone: data.user?.phone || "",
        addresses: [
          {
            country: data.user?.country || "Brasil",
            zipCode: data.billingAddresses?.[0]?.zipCode || "",
            state: data.user?.state || data.billingAddresses?.[0]?.state || "",
            street: data.billingAddresses?.[0]?.street
              ? `${data.billingAddresses[0].street}${
                  data.billingAddresses[0].number
                    ? ` ${data.billingAddresses[0].number}`
                    : ""
                }`
              : "",
            complement: data.billingAddresses?.[0]?.complement || "",
          },
          {
            country: data.billingAddresses?.[1]?.country || "Brasil",
            zipCode: data.billingAddresses?.[1]?.zipCode || "",
            state: data.billingAddresses?.[1]?.state || "",
            street: data.billingAddresses?.[1]?.street
              ? `${data.billingAddresses[1].street}${
                  data.billingAddresses[1].number
                    ? ` ${data.billingAddresses[1].number}`
                    : ""
                }`
              : "",
            complement: data.billingAddresses?.[1]?.complement || "",
          },
        ],
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: ProfileFormData) => {
    try {
      await updateUserData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      router.push("/account/profile");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar alterações. Tente novamente.");
    }
  };

  const handleDeleteAccount = () => {
    // Implementar lógica de exclusão de conta
    console.log("Excluir conta");
    setShowDeleteConfirm(false);
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500" />
      </div>
    );
  }

  const brazilianStates = [
    "Acre",
    "Alagoas",
    "Amapá",
    "Amazonas",
    "Bahia",
    "Ceará",
    "Distrito Federal",
    "Espírito Santo",
    "Goiás",
    "Maranhão",
    "Mato Grosso",
    "Mato Grosso do Sul",
    "Minas Gerais",
    "Pará",
    "Paraíba",
    "Paraná",
    "Pernambuco",
    "Piauí",
    "Rio de Janeiro",
    "Rio Grande do Norte",
    "Rio Grande do Sul",
    "Rondônia",
    "Roraima",
    "Santa Catarina",
    "São Paulo",
    "Sergipe",
    "Tocantins",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Mobile */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-5 h-14">
          <button onClick={() => router.back()} className="-ml-1">
            <ArrowLeft className="w-[26px] h-[26px] text-pb-500" strokeWidth={1.5} />
          </button>
          <h1 className="font-erstoria text-[20px] text-pb-500 font-medium">
            Editar perfil
          </h1>
        </div>
      </div>

      {/* Header Desktop */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()}>
              <ArrowLeft className="w-6 h-6 text-pb-500" strokeWidth={1.5} />
            </button>
            <h1 className="font-erstoria text-2xl text-pb-500 font-medium">
              Editar perfil
            </h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl mx-auto px-5 lg:px-6 py-6 lg:py-12"
      >
        {/* Nome */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-pb-500 mb-2">Nome</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Image
                src="/icons/user-outline.svg"
                alt="User"
                width={20}
                height={20}
                className="text-gray-400"
              />
            </div>
            <input
              type="text"
              {...register("name", {
                required: "Nome é obrigatório",
                minLength: {
                  value: 3,
                  message: "Nome deve ter no mínimo 3 caracteres",
                },
              })}
              className={`w-full h-[56px] pl-12 pr-4 rounded-xl border ${
                errors.name ? "border-red-500" : "border-gray-200"
              } bg-[#F7F7F7] text-pb-500 focus:outline-none focus:border-gold-500 transition-colors`}
              placeholder="Nome completo"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* E-mail */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-pb-500 mb-2">E-mail</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Image
                src="/icons/envelope-outline.svg"
                alt="Email"
                width={20}
                height={20}
                className="text-gray-400"
              />
            </div>
            <input
              type="email"
              {...register("email", {
                required: "E-mail é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "E-mail inválido",
                },
              })}
              className={`w-full h-[56px] pl-12 pr-4 rounded-xl border ${
                errors.email ? "border-red-500" : "border-gray-200"
              } bg-[#F7F7F7] text-pb-500 focus:outline-none focus:border-gold-500 transition-colors`}
              placeholder="seu@email.com"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Número */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-pb-500 mb-2">Número</label>
          <div className="relative flex gap-2">
            {/* Country Code Selector */}
            <div className="flex items-center gap-2 h-[56px] px-4 rounded-xl border border-gray-200 bg-[#F7F7F7]">
              <Image
                src="/icons/flag-br.svg"
                alt="Brasil"
                width={24}
                height={24}
                className="rounded"
              />
              <span className="text-sm font-medium text-pb-500">+55</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="text-gray-400"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Phone Input */}
            <div className="relative flex-1">
              <input
                type={showPhone ? "text" : "password"}
                {...register("phone", {
                  required: "Telefone é obrigatório",
                  pattern: {
                    value: /^[0-9\s()-]+$/,
                    message: "Telefone inválido",
                  },
                })}
                className={`w-full h-[56px] px-4 pr-12 rounded-xl border ${
                  errors.phone ? "border-red-500" : "border-gray-200"
                } bg-[#F7F7F7] text-pb-500 focus:outline-none focus:border-gold-500 transition-colors`}
                placeholder="21 986567654"
              />
              <button
                type="button"
                onClick={() => setShowPhone(!showPhone)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPhone ? (
                  <Eye className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Endereços */}
        <div className="mb-6">
          <h2 className="text-base font-medium text-pb-500 mb-4">Endereços</h2>

          {addressFields.map((field, index) => (
            <div
              key={field.id}
              className="bg-[#F7F7F7] rounded-xl p-6 mb-4 border border-gray-200"
            >
              {/* País */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-pb-500 mb-2">País</label>
                <div className="relative">
                  <select
                    {...register(`addresses.${index}.country` as const)}
                    className="w-full h-[48px] px-4 pr-10 rounded-xl border border-gray-200 bg-white text-pb-500 focus:outline-none focus:border-gold-500 transition-colors appearance-none"
                  >
                    <option value="Brasil">Brasil</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Portugal">Portugal</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="text-gray-400"
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Código postal */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-pb-500 mb-2">
                  Código postal
                </label>
                <input
                  type="text"
                  {...register(`addresses.${index}.zipCode` as const)}
                  className="w-full h-[48px] px-4 rounded-xl border border-gray-200 bg-white text-pb-500 focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="00000-000"
                />
              </div>

              {/* Estado */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-pb-500 mb-2">
                  Estado
                </label>
                <div className="relative">
                  <select
                    {...register(`addresses.${index}.state` as const)}
                    className="w-full h-[48px] px-4 pr-10 rounded-xl border border-gray-200 bg-white text-pb-500 focus:outline-none focus:border-gold-500 transition-colors appearance-none"
                  >
                    <option value="">Selecione o estado</option>
                    {brazilianStates.map(state => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="text-gray-400"
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Rua */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-pb-500 mb-2">Rua</label>
                <input
                  type="text"
                  {...register(`addresses.${index}.street` as const)}
                  className="w-full h-[48px] px-4 rounded-xl border border-gray-200 bg-white text-pb-500 focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="Rua e número"
                />
              </div>

              {/* Complemento */}
              <div>
                <label className="block text-sm font-medium text-pb-500 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  {...register(`addresses.${index}.complement` as const)}
                  className="w-full h-[48px] px-4 rounded-xl border border-gray-200 bg-white text-pb-500 focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="Apto, sala, etc."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Alterar senha */}
        <button
          type="button"
          onClick={() => router.push("/account/profile/change-password")}
          className="w-full h-[56px] rounded-full border-2 border-pb-500 text-pb-500 font-medium mb-4 hover:bg-pb-500 hover:text-white transition-colors"
        >
          Alterar minha senha
        </button>

        {/* Excluir conta */}
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full text-center text-red-600 font-medium mb-8 hover:underline"
        >
          Excluir minha conta
        </button>

        {/* Salvar alterações */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-[56px] rounded-full bg-gold-500 text-white font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-medium text-pb-500 mb-4">Excluir conta</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-12 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 h-12 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
