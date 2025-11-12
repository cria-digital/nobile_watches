import { SELL_WATCH_STEPS } from "@/lib/constants/sellWatch";
import { CreateWatchFormValues } from "@/lib/validations/watch";
import { useState } from "react";
import { UseFormGetValues, UseFormTrigger } from "react-hook-form";

interface UseFormNavigationProps {
  trigger: UseFormTrigger<CreateWatchFormValues>;
  getValues: UseFormGetValues<CreateWatchFormValues>;
  onNotification: (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => void;
}

export function useFormNavigation({
  trigger,
  getValues,
  onNotification,
}: UseFormNavigationProps) {
  const [step, setStep] = useState<number>(1);

  const getFieldsToValidate = (currentStep: number): (keyof CreateWatchFormValues)[] => {
    switch (currentStep) {
      case 1:
        return ["brand", "model"];
      case 2:
        return ["customTitleSuffix"];
      case 3:
        return [
          "year",
          "gender",
          "serialNumber",
          "dialColor",
          "caseWidth",
          "caseHeight",
          "movement",
          "caseMaterial",
          "braceletMaterial",
          "braceletColor",
        ];
      case 4:
        return ["includedAccessories"];
      case 5:
        return ["hasSignsOfWear", "condition"];
      case 6:
        return ["description"];
      case 7:
        return ["price"];
      default:
        return [];
    }
  };

  const next = async () => {
    const values = getValues();
    const fieldsToValidate = getFieldsToValidate(step);

    // Trigger validação dos campos do step atual
    const isStepValid = await trigger(fieldsToValidate);

    if (!isStepValid) {
      onNotification(
        "error",
        "Campos inválidos",
        "Por favor, corrija os erros antes de continuar."
      );
      return;
    }

    // Validações específicas por step
    if (step === 1) {
      if (!values.brand || !values.model) {
        onNotification(
          "error",
          "Campos obrigatórios",
          "Por favor, preencha a marca e o modelo do relógio."
        );
        return;
      }
    }

    if (step === 7) {
      return; // No step 7, não avança mais
    }

    setStep(s => Math.min(s + 1, SELL_WATCH_STEPS.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    step,
    next,
    prev,
  };
}
