"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "../ui/Icon/Icon";

interface RegisterFormProps {
  onSuccess?: () => void;
}

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || true;

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { register: registerUser, mockLogin, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      country: "Brasil",
      phone: "+55 ",
    },
  });

  // Observa os valores dos campos para controlar o estado do botão
  const name = watch("name");
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const phone = watch("phone");
  const country = watch("country");
  const state = watch("state");
  const city = watch("city");

  // Determina se o botão deve estar habilitado
  const isButtonEnabled = Boolean(
    name &&
      email &&
      password &&
      confirmPassword &&
      phone &&
      country &&
      state &&
      city &&
      isValid &&
      !isLoading
  );

  const onSubmit = async (data: RegisterFormData) => {
    try {
      useMockData
        ? mockLogin()
        : await registerUser({
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            country: data.country,
            state: data.state,
            city: data.city,
            role: "BUYER", // Padrão: comprador
          });

      // Após registro bem-sucedido, redireciona para home
      router.push("/");
      onSuccess?.();
    } catch (error: any) {
      setError("root", {
        message: error.message || "Erro ao criar conta. Tente novamente.",
      });
    }
  };

  return (
    <div className="w-full max-w-[500px]">
      <div className="flex flex-col gap-3 mb-6">
        <h1 className="font-erstoria text-[28px] font-normal text-pb-500">
          Crie sua conta
        </h1>
        <p className="font-lato text-gray-400 text-sm leading-[148%]">
          Descubra as marcas mais exclusivas, negocie com segurança e acompanhe a
          valorização das suas peças.
        </p>
      </div>

      {/* Botões de login social */}
      <div className="mb-8">
        <div className="flex justify-center gap-3">
          {/* Google */}
          <button
            type="button"
            className="flex-1 flex items-center justify-center w-[60px] h-[60px] max-w-[60px] bg-[#F7F7F7] border border-[#D9D9D9] rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-offset-2"
            aria-label="Entrar com Google"
          >
            <Image src="/icons/google.svg" alt="Google" width={40} height={40} />
          </button>

          {/* Apple */}
          <button
            type="button"
            className="flex-1 flex items-center justify-center w-[60px] h-[60px] max-w-[60px] bg-[#F7F7F7] border border-[#D9D9D9] rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-offset-2"
            aria-label="Entrar com Apple"
          >
            <Image src="/icons/apple.svg" alt="Apple" width={40} height={40} />
          </button>
        </div>
      </div>

      {/* Divisor */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#EFEFEF]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="font-lato px-3 bg-white text-gray-400">Ou</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <div>
          <label htmlFor="name" className="block text-sm text-pb-500 mb-2.5">
            Nome
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon src="/icons/user-outline.svg" alt="User" />
            </div>
            <input
              {...register("name")}
              type="text"
              id="name"
              placeholder="Digite seu nome completo"
              className="w-full pl-12 pr-3 py-3 border border-[#EFEFEF] rounded-xl focus:outline-none transition-colors"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* E-mail */}
        <div>
          <label htmlFor="email" className="block text-sm text-[#141414] mb-[10px]">
            E-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon src="/icons/envelope-outline.svg" alt="Envelope" />
            </div>
            <input
              {...register("email")}
              type="email"
              id="email"
              placeholder="Digite seu e-mail..."
              autoComplete="email"
              inputMode="email"
              className="w-full pl-12 pr-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none transition-colors"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Senha */}
        <div>
          <label htmlFor="password" className="block text-sm text-[#141414] mb-[10px]">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon src="/icons/password-lock.svg" alt="Password" />
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Digite sua senha..."
              autoComplete="new-password"
              enterKeyHint="next"
              className="w-full pl-12 pr-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-pb-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-pb-500" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirmar senha */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm text-pb-500 mb-[10px]"
          >
            Confirme sua senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon src="/icons/password-lock.svg" alt="Password" />
            </div>
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Confirme sua senha..."
              autoComplete="new-password"
              enterKeyHint="done"
              className="w-full pl-12 pr-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-pb-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-pb-500" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label htmlFor="phone" className="block text-sm text-[#141414] mb-[10px]">
            Número
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon src="/icons/phone.svg" alt="Location" />
            </div>
            <input
              {...register("phone")}
              type="tel"
              id="phone"
              placeholder="Digite seu número..."
              autoComplete="tel"
              inputMode="tel"
              className="w-full pl-10 pr-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none transition-colors"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Localização - País ocupa 100% da largura */}
        <div>
          <label htmlFor="country" className="block text-sm text-[#141414] mb-[10px]">
            País
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon src="/icons/map-pin.svg" alt="Location" />
            </div>
            <select
              {...register("country")}
              id="country"
              autoComplete="country-name"
              className="w-full pl-10 pr-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none transition-colors appearance-none bg-[#F7F7F7]"
            >
              <option value="Brasil">Brasil</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="state" className="block text-sm text-[#141414] mb-[10px]">
            Estado
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon src="/icons/map-pin.svg" alt="Location" />
            </div>
            <input
              {...register("state")}
              type="text"
              id="state"
              placeholder="Digite seu estado..."
              className="w-full pl-10 pr-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none transition-colors"
            />
          </div>
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        {/* Cidade */}
        <div>
          <label htmlFor="city" className="block text-sm text-[#141414] mb-[10px]">
            Cidade
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon src="/icons/map-pin.svg" alt="Location" />
            </div>
            <input
              {...register("city")}
              type="text"
              id="city"
              placeholder="Digite sua cidade..."
              className="w-full pl-10 pr-3 py-3 border border-[#EFEFEF] rounded-[12px] focus:outline-none transition-colors"
            />
          </div>
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        {/* Erro geral */}
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* Botão de cadastro */}
        <Button
          type="submit"
          variant="gold"
          className="w-full h-[54px]"
          isLoading={isLoading}
          disabled={!isButtonEnabled}
        >
          Criar conta
        </Button>

        {/* Link para login */}
        <div className="text-center">
          <Link href="/login" className="font-bold text-pb-500 transition-colors">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
