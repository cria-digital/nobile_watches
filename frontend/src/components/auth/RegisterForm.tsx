"use client";

import { Button, Input, Select, Toast } from "@/components/ui";
import { BRAZIL_STATES, CITIES_BY_STATE } from "@/lib/constants/brazilLocations";
import { useAuth } from "@/lib/context/AuthContext";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface RegisterFormProps {
  onSuccess?: () => void;
}

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const { register: registerUser, mockLogin, isLoading } = useAuth();

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      country: "Brasil",
      phone: "",
    },
  });

  // Observa os valores dos campos
  const selectedState = watch("state");
  const availableCities = selectedState ? CITIES_BY_STATE[selectedState] || [] : [];

  const isButtonEnabled = Boolean(isValid && !isLoading);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning") => {
    setToast({ message, type });
  };

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
            role: "BUYER",
          });

      showToast("Conta criada com sucesso! Redirecionando...", "success");

      setTimeout(() => {
        router.push("/");
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      // Detecta o tipo de erro e mostra mensagem apropriada
      const errorMessage = err.message || "Erro ao criar conta. Tente novamente.";

      if (
        errorMessage.includes("já cadastrado") ||
        errorMessage.includes("already exists")
      ) {
        showToast(
          "Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.",
          "error"
        );
      } else if (errorMessage.includes("senha")) {
        showToast("A senha não atende aos requisitos mínimos de segurança.", "error");
      } else {
        showToast(errorMessage, "error");
      }
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === "error" ? 6000 : 3000}
        />
      )}

      <div className="w-full max-w-[500px]">
        <div className="flex flex-col gap-3 mb-6">
          <h1 className="text-[28px] leading-[28px]">Crie sua conta</h1>
          <p className="text-gray-400 text-sm leading-[21px]">
            Descubra as marcas mais exclusivas, negocie com segurança e acompanhe a
            valorização das suas peças.
          </p>
        </div>

        {/* Botões de login social */}
        <div className="mb-8">
          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="flex-1 flex items-center justify-center w-[60px] h-[60px] max-w-[60px] bg-[#F7F7F7] border border-[#D9D9D9] rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Entrar com Google"
            >
              <Image src="/icons/google.svg" alt="Google" width={40} height={40} />
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center w-[60px] h-[60px] max-w-[60px] bg-[#F7F7F7] border border-[#D9D9D9] rounded-full hover:bg-gray-100 transition-colors"
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
            <span className="px-3 bg-white text-gray-400">Ou</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nome */}
          <Input
            {...register("name")}
            id="name"
            label="Nome"
            type="text"
            placeholder="Digite seu nome completo"
            icon="/icons/user.svg"
            iconAlt="User"
            error={errors.name?.message}
          />

          {/* E-mail */}
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
            autoComplete="new-password"
            showPasswordToggle
            error={errors.password?.message}
          />

          {/* Confirmar senha */}
          <Input
            {...register("confirmPassword")}
            id="confirmPassword"
            label="Confirme sua senha"
            type="password"
            placeholder="Confirme sua senha..."
            icon="/icons/password-lock.svg"
            iconAlt="Password"
            autoComplete="new-password"
            showPasswordToggle
            error={errors.confirmPassword?.message}
          />

          {/* Telefone com bandeira */}
          <Input
            {...register("phone")}
            id="phone"
            label="Número"
            type="tel"
            placeholder="21 986567654"
            autoComplete="tel"
            inputMode="tel"
            leftElement={
              <div className="flex items-center gap-1">
                <Image
                  src="/icons/flag-br-input.svg"
                  alt="Brasil flag"
                  width={24}
                  height={24}
                />
                <span className="text-sm text-[#0E121B] tracking-[-0.006em]">+55</span>
              </div>
            }
            className="pl-[90px]"
            error={errors.phone?.message}
          />

          {/* País - Select com opções hardcoded */}
          <Select
            {...register("country")}
            id="country"
            label="País"
            placeholder="Selecione o país"
            error={errors.country?.message}
          >
            <option value="Brasil">Brasil</option>
          </Select>

          {/* Estado - Select com array de options */}
          <Select
            {...register("state")}
            id="state"
            label="Estado"
            placeholder="Selecione o estado"
            options={BRAZIL_STATES}
            error={errors.state?.message}
          />

          {/* Cidade - Select dinâmico */}
          <Select
            {...register("city")}
            id="city"
            label="Cidade"
            placeholder={
              selectedState ? "Selecione a cidade" : "Selecione um estado primeiro"
            }
            options={availableCities}
            disabled={!selectedState || availableCities.length === 0}
            error={errors.city?.message}
          />

          {/* Checkbox - Aceitar termos */}
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <input
                {...register("terms")}
                type="checkbox"
                id="terms"
                className="w-5 h-5 max-h-5 rounded-full border-[1.5px] border-[#777777]
                   appearance-none cursor-pointer
                   checked:bg-[#D5A60A] checked:border-[#777777]
                   focus:ring-2 focus:ring-[#D5A60A] focus:ring-offset-2
                   relative
                   after:content-['']
                   after:absolute after:inset-0
                   after:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgNEw0LjUgNy41TDExIDEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')]
                   after:bg-center after:bg-no-repeat
                   after:hidden
                   checked:after:block"
              />
              <label htmlFor="terms" className="text-sm text-pb-500 cursor-pointer">
                Aceitar termos de uso
              </label>
            </div>
            <Link
              href="#"
              className="text-sm text-[#D5A60A] font-normal underline leading-[140%]"
            >
              Termos de uso
            </Link>
          </div> */}

          {/* Botão de cadastro */}
          <Button
            type="submit"
            variant="gold"
            className="w-full h-[54px] mt-3"
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
    </>
  );
}
