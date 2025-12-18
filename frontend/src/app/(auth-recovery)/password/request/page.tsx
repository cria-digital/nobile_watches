import { PasswordRequestForm } from "@/components/auth/PasswordRequestForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar Senha",
  description: "Solicite a recuperação de senha da sua conta na Nobile.",
};

export default function PasswordRequestPage() {
  return <PasswordRequestForm />;
}
