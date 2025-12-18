"use client";

import { Button, Input, Toast } from "@/components/ui";
import { useAuth } from "@/lib/context/AuthContext";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface LoginFormProps {
  onSuccess?: () => void;
}

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, mockLogin, isLoading } = useAuth();

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const email = watch("email");
  const password = watch("password");
  const isButtonEnabled = Boolean(
    email && password && isValid && !isLoading && !showSuccessToast
  );

  const onSubmit = async (data: LoginFormData) => {
    try {
      if (useMockData) {
        setShowSuccessToast(true);
        mockLogin();

        setTimeout(() => {
          const redirect = searchParams.get("redirect") || "/";
          router.push(redirect);
          router.refresh();
          onSuccess?.();
        }, 1500);
        return;
      }

      await login(data.email, data.password);

      setShowSuccessToast(true);

      setTimeout(() => {
        const redirect = searchParams.get("redirect") || "/";
        router.push(redirect);
        router.refresh();
        onSuccess?.();
      }, 1500);
    } catch (error: any) {
      setError("root", {
        message:
          error.message || "E-mail ou senha incorretos. Tente novamente.",
      });
    }
  };

  return (
    <>
      {showSuccessToast && (
        <Toast
          message="Login realizado com sucesso!"
          type="success"
          onClose={() => setShowSuccessToast(false)}
          duration={1500}
        />
      )}

      <div>
        <div className="flex flex-col gap-3 mb-6">
          <h1 className="text-[28px]">Acesse sua conta</h1>
          <p className="text-gray-400 text-sm leading-[148%]">
            Descubra as marcas mais exclusivas, negocie com segurança e
            acompanhe a valorização das suas peças.
          </p>
        </div>

        {/* Botões de login social */}
        <div className="mb-8">
          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="flex-1 flex items-center justify-center w-[60px] h-[60px] max-w-[60px] bg-[#F7F7F7] border border-[#D9D9D9] rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-offset-2"
              aria-label="Entrar com Google"
            >
              <Image
                src="/icons/google.svg"
                alt="Google"
                width={40}
                height={40}
              />
            </button>

            <button
              type="button"
              className="flex-1 flex items-center justify-center w-[60px] h-[60px] max-w-[60px] bg-[#F7F7F7] border border-[#D9D9D9] rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-offset-2"
              aria-label="Entrar com Apple"
            >
              <Image
                src="/icons/apple.svg"
                alt="Apple"
                width={40}
                height={40}
              />
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          autoComplete="on"
        >
          {/* Email */}
          <Input
            {...register("email")}
            id="email"
            label="E-mail"
            type="email"
            placeholder="Digite seu e-mail..."
            icon="/icons/envelope-outline.svg"
            iconAlt="Envelope"
            autoComplete="email"
            inputMode="email"
            error={errors.email?.message}
          />

          {/* Senha */}
          <Input
            {...register("password")}
            id="password"
            label="Senha"
            type="password"
            placeholder="Digite sua senha..."
            icon="/icons/password-lock.svg"
            iconAlt="Password"
            autoComplete="current-password"
            enterKeyHint="done"
            showPasswordToggle
            error={errors.password?.message}
          />

          {/* Erro geral */}
          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* Botão de login */}
          <Button
            type="submit"
            variant="gold"
            className="w-full h-[54px]"
            isLoading={isLoading || showSuccessToast}
            disabled={!isButtonEnabled}
          >
            {showSuccessToast ? "Redirecionando..." : "Acessar"}
          </Button>

          <div className="flex items-center justify-between h-[28px]">
            <Link
              href="/password/request"
              className="font-lato text-base text-pb-500 font-bold hover:text-gray-900 transition-colors"
            >
              Esqueci minha senha
            </Link>

            <Link
              href="/sign-up"
              className="font-lato text-base text-pb-500 font-bold hover:text-gray-900 transition-colors"
            >
              Criar conta
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
