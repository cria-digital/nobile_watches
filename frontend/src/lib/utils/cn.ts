import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Une classes condicionais e mescla corretamente classes Tailwind
export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs));
}
