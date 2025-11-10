// components/PaymentButton.tsx
"use client";

import clsx from "clsx";
import Image from "next/image";
import { ButtonHTMLAttributes } from "react";

type PaymentVariant = "pix" | "credit-card" | "bank_slip";

interface PaymentButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant: PaymentVariant;
  selected?: boolean;
}

export function PaymentButton({
  label,
  variant,
  selected = false,
  ...props
}: PaymentButtonProps) {
  const iconPath = `/icons/${variant}.svg`;

  return (
    <button
      {...props}
      className={clsx(
        "flex flex-col flex-1 items-center justify-center gap-1.5 rounded-md px-6 py-4 max-h-[74px] lg:max-h-none font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
        selected ? "bg-[#F7F7F7] opacity-100" : "opacity-60 hover:opacity-100"
      )}
      aria-pressed={selected}
      aria-label={label}
    >
      <Image
        src={iconPath}
        alt=""
        width={24}
        height={24}
        style={{
          filter: selected
            ? "invert(69%) sepia(68%) saturate(394%) hue-rotate(14deg) brightness(91%) contrast(93%)"
            : "invert(48%) sepia(0%) saturate(0%) hue-rotate(186deg) brightness(90%) contrast(83%)",
        }}
        aria-hidden="true"
        priority
      />
      <span
        className={clsx(
          "text-sm font-bold",
          selected ? "text-[#141414]" : "text-[#777777]"
        )}
        style={{
          letterSpacing: "0.02em",
          lineHeight: "150%",
        }}
      >
        {label}
      </span>
    </button>
  );
}

PaymentButton.displayName = "PaymentButton";
