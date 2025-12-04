"use client";

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui";
import { Button } from "../ui/Button";

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  // Observa os valores dos campos
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implementar chamada para API de redefinição de senha
      console.log("Reset password data:", data);

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSuccess(true);
    } catch (error) {
      setError("root", {
        message: "Erro ao redefinir senha. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div>
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-[46px] h-[46px] mb-8">
            <Image
              src="/icons/check_square.svg"
              alt="Check"
              width={46}
              height={46}
            />
          </div>
          <h1 className="font-erstoria text-[32px] text-[#141414] mb-3 leading-[100%]">
            Senha atualizada com sucesso!
          </h1>
          <p className="font-lato text-sm text-gray-400 leading-[148%]">
            Você pode acessar sua conta normalmente com sua nova senha.
          </p>
        </div>

        <Button
          onClick={() => router.push("/login")}
          variant="gold"
          className="w-full h-[56px]"
        >
          Ir para o login
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] mb-3 leading-[100%] tracking-normal">
          Crie uma nova senha
        </h1>
        <p className="text-sm text-gray-400 leading-[148%]">
          Escolha uma senha forte para manter sua conta protegida.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Código (oculto - talvez seja passado via URL params na implementação real) */}
        <input {...register("code")} type="hidden" value="123456" />

        {/* Nova senha */}
        <Input
          {...register("password")}
          id="password"
          label="Nova senha"
          type="password"
          placeholder="Digite sua nova senha..."
          icon="/icons/password-lock.svg"
          iconAlt="Password"
          autoComplete="current-password"
          enterKeyHint="done"
          showPasswordToggle
          error={errors.password?.message}
        />

        {/* Confirmar nova senha */}
        <Input
          {...register("confirmPassword")}
          id="confirmPassword"
          label="Confirme sua nova senha"
          type="password"
          placeholder="Confirme sua nova senha..."
          icon="/icons/password-lock.svg"
          iconAlt="Password"
          showPasswordToggle
          error={errors.confirmPassword?.message}
        />

        {/* Erro geral */}
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* Botão de redefinir */}
        <Button
          type="submit"
          variant="gold"
          className="w-full h-[56px] mt-2"
          isLoading={isLoading}
          disabled={!password || !confirmPassword || !isValid || isLoading}
        >
          Redefinir senha
        </Button>

        {/* Voltar */}
        <div className="flex items-center justify-center">
          <Link
            href="/recuperar-senha"
            className="flex items-center text-sm text-[#141414] hover:text-gray-900 transition-colors"
          >
            Voltar
          </Link>
        </div>
      </form>
    </div>
  );
}
