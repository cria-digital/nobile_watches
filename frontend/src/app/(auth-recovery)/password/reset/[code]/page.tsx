import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Redefinir Senha",
  description: "Defina uma nova senha para sua conta na Nobile.",
};

interface PasswordResetPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function PasswordResetPage({
  params,
}: PasswordResetPageProps) {
  const { code } = await params;

  // Validação básica do código
  if (!code || code.length < 6) {
    notFound();
  }

  return <PasswordResetForm code={code} />;
}
