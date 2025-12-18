"use client";

import { authService } from "@/lib/services/auth.service";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui";
import { Button } from "../ui/Button";

export function PasswordRequestForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [codeError, setCodeError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    getValues,
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const email = watch("email");

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Envia requisição para o backend
      // O authService já trata rate limit (429) e outros erros
      const response = await authService.forgotPassword(data.email);

      console.log("Código de recuperação enviado:", response);
      setIsSubmitted(true);
    } catch (error: any) {
      setError("root", {
        message: error.message || "Erro ao enviar código. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Limpa erro ao começar a digitar
    if (codeError) setCodeError("");

    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Foca no próximo input se digitou algo
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");

    if (code.length !== 6) {
      setCodeError("Digite o código completo de 6 dígitos.");
      return;
    }

    setIsLoading(true);
    setCodeError("");

    try {
      // Valida o código no backend
      const response = await authService.validateResetToken(code);

      if (response.valid) {
        console.log("Código válido, redirecionando...");
        router.push(`/password/reset/${code}`);
      } else {
        setCodeError(response.error || "Código inválido.");
      }
    } catch (error: any) {
      setCodeError(
        error.message || "Código inválido ou expirado. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de verificação de código
  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-8 h-full min-h-[450px] pb-8 lg:pb-0">
        <div>
          <h1 className="text-[28px] mb-3 leading-[100%]">
            Verifique seu e-mail
          </h1>
          <p className="text-sm text-gray-400 leading-[148%]">
            Enviamos um código de 6 dígitos para o e-mail{" "}
            <span className="font-medium text-pb-500">
              {getValues("email")}
            </span>
            . Insira-o abaixo para continuar.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={verificationCode[index]}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                className="w-full h-12 text-center text-lg font-medium border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D5A60A] focus:border-[#D5A60A] transition-colors bg-[#F7F7F7]"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Mensagem de erro do código */}
          {codeError && (
            <div className="text-center">
              <p className="text-sm text-red-600">{codeError}</p>
            </div>
          )}
        </div>

        <div className="lg:mt-auto space-y-2">
          <Button
            onClick={handleVerifyCode}
            variant="gold"
            className="w-full h-[52px]"
            isLoading={isLoading}
            disabled={verificationCode.join("").length !== 6 || isLoading}
          >
            Verificar código
          </Button>
          <div className="flex items-center justify-center">
            <Link
              href="/login"
              className="flex items-center h-[52px] text-base font-semibold text-pb-500 transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full min-h-[450px] pb-8 lg:pb-0">
      <div>
        <h1 className="text-[28px] mb-3 leading-[100%]">Esqueceu sua senha?</h1>
        <p className="text-sm text-gray-400 leading-[148%]">
          Informe o e-mail associado à sua conta. Enviaremos um link para que
          você possa redefinir sua senha.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col gap-8"
      >
        <div className="space-y-6">
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

          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}
        </div>

        <div className="lg:mt-auto space-y-2">
          <Button
            type="submit"
            variant="gold"
            className="w-full h-[52px]"
            isLoading={isLoading}
            disabled={!email || !isValid || isLoading}
          >
            Enviar código de verificação
          </Button>

          <div className="flex items-center justify-center">
            <Link
              href="/login"
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
