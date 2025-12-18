"use client";

import { authService } from "@/lib/services/auth.service";
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

interface PasswordResetFormProps {
  code: string;
}

export function PasswordResetForm({ code }: PasswordResetFormProps) {
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
    defaultValues: {
      code, // Define o código vindo da URL
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(data.code, data.password);

      console.log("Senha redefinida com sucesso");
      setIsSuccess(true);
    } catch (error: any) {
      setError("root", {
        message: error.message || "Erro ao redefinir senha. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col justify-center h-full min-h-[450px] pb-8 lg:pb-0">
        <div className="max-w-2xs h-full flex-1 mx-auto text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-[46px] h-[46px] mb-8">
            <Image
              src="/icons/check_square.svg"
              alt="Check"
              width={46}
              height={46}
            />
          </div>
          <h1 className="text-[28px] lg:text-[32px] mb-3 leading-[100%]">
            Senha atualizada com sucesso!
          </h1>
          <p className="text-sm text-gray-400 leading-[148%]">
            Você pode acessar sua conta normalmente com sua nova senha.
          </p>
        </div>

        <div className="mt-auto">
          <Button
            onClick={() => router.push("/login")}
            variant="gold"
            className="w-full h-[56px]"
          >
            Ir para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[450px] pb-8 lg:pb-0">
      <div className="mb-8">
        <h1 className="text-[28px] mb-3 leading-[100%]">Crie uma nova senha</h1>
        <p className="text-sm text-gray-400 leading-[148%]">
          Escolha uma senha forte para manter sua conta protegida.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
        {/* Código (oculto - vem da URL) */}
        <input {...register("code")} type="hidden" />

        <div className="space-y-6">
          {/* Nova senha */}
          <Input
            {...register("password")}
            id="password"
            label="Nova senha"
            type="password"
            placeholder="Digite sua nova senha..."
            icon="/icons/password-lock.svg"
            iconAlt="Password"
            autoComplete="new-password"
            enterKeyHint="next"
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
            autoComplete="new-password"
            enterKeyHint="done"
            showPasswordToggle
            error={errors.confirmPassword?.message}
          />

          {/* Erro geral */}
          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-2 pt-8">
          {/* Botão de redefinir */}
          <Button
            type="submit"
            variant="gold"
            className="w-full h-[52px]"
            isLoading={isLoading}
            disabled={!password || !confirmPassword || !isValid || isLoading}
          >
            Redefinir senha
          </Button>

          {/* Voltar */}
          <div className="flex items-center justify-center">
            <Link
              href="/recovery/request"
              className="flex items-center h-[52px] text-base font-semibold text-pb-500 transition-colors"
            >
              Voltar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
