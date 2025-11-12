import { FieldError as RHFFieldError } from "react-hook-form";

interface FieldErrorProps {
  error?: RHFFieldError | undefined;
}

export function FieldError({ error }: FieldErrorProps) {
  if (!error?.message) return null;
  return <span className="text-red-500 text-xs mt-1 block">{error.message}</span>;
}
