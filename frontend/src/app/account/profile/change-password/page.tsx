"use client";

import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      // Implementar chamada à API para alterar senha
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert("Senha alterada com sucesso!");
      router.push("/account/profile");
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert("Erro ao alterar senha. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Mobile */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-5 h-14">
          <button onClick={() => router.back()} className="-ml-1">
            <ArrowLeft className="w-[26px] h-[26px] text-pb-500" strokeWidth={1.5} />
          </button>
          <h1 className="font-erstoria text-[20px] text-pb-500 font-medium">
            Alterar senha
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
              Alterar senha
            </h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md mx-auto px-5 lg:px-6 py-6 lg:py-12"
      >
        <p className="text-sm text-gray-600 mb-8">
          Para sua segurança, digite sua senha atual e escolha uma nova senha forte.
        </p>

        {/* Senha atual */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-pb-500 mb-2">
            Senha atual
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              {...register("currentPassword", {
                required: "Senha atual é obrigatória",
              })}
              className={`w-full h-[56px] px-4 pr-12 rounded-xl border ${
                errors.currentPassword ? "border-red-500" : "border-gray-200"
              } bg-[#F7F7F7] text-pb-500 focus:outline-none focus:border-gold-500 transition-colors`}
              placeholder="Digite sua senha atual"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("current")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPasswords.current ? (
                <Eye className="w-5 h-5 text-gray-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-red-600 mt-1">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* Nova senha */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-pb-500 mb-2">Nova senha</label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              {...register("newPassword", {
                required: "Nova senha é obrigatória",
                minLength: {
                  value: 8,
                  message: "A senha deve ter no mínimo 8 caracteres",
                },
              })}
              className={`w-full h-[56px] px-4 pr-12 rounded-xl border ${
                errors.newPassword ? "border-red-500" : "border-gray-200"
              } bg-[#F7F7F7] text-pb-500 focus:outline-none focus:border-gold-500 transition-colors`}
              placeholder="Digite sua nova senha"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPasswords.new ? (
                <Eye className="w-5 h-5 text-gray-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-600 mt-1">{errors.newPassword.message}</p>
          )}
          {!errors.newPassword && (
            <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres</p>
          )}
        </div>

        {/* Confirmar senha */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-pb-500 mb-2">
            Confirmar nova senha
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Confirmação de senha é obrigatória",
                validate: value => value === newPassword || "As senhas não coincidem",
              })}
              className={`w-full h-[56px] px-4 pr-12 rounded-xl border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-200"
              } bg-[#F7F7F7] text-pb-500 focus:outline-none focus:border-gold-500 transition-colors`}
              placeholder="Confirme sua nova senha"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPasswords.confirm ? (
                <Eye className="w-5 h-5 text-gray-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Botões */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-[56px] rounded-full bg-gold-500 text-white font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isSubmitting ? "Alterando..." : "Alterar senha"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="w-full h-[56px] rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
