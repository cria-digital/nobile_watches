"use client";

import { useEffect, useState } from "react";
import { VerificationModalDesktop } from "./VerificationModalDesktop";
import { VerificationModalMobile } from "./VerificationModalMobile";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSubmitted?: () => void;
}

export function VerificationModal({
  isOpen,
  onClose,
  onVerificationSubmitted,
}: VerificationModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Evita flash de conteúdo incorreto durante SSR
  if (!isClient) {
    return null;
  }

  if (isMobile) {
    return (
      //@ts-ignore
      <VerificationModalMobile
        isOpen={isOpen}
        onClose={onClose}
        onVerificationSubmitted={onVerificationSubmitted}
      />
    );
  }

  return (
    //@ts-ignore
    <VerificationModalDesktop
      isOpen={isOpen}
      onClose={onClose}
      onVerificationSubmitted={onVerificationSubmitted}
    />
  );
}
