"use client";

import { PreviewCard } from "@/components/seller/PreviewCard";
import { Input } from "@/components/ui";
import { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";

interface Step1IdentificationProps {
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
  register: UseFormRegister<any>;
}

export function Step1Identification({
  watch,
  errors,
  register,
}: Step1IdentificationProps) {
  const formBrand = watch("brand");
  const formModel = watch("model");
  const formReference = watch("referenceNumber");

  return (
    <div className="space-y-5 lg:space-y-6">
      <h2 className="text-2xl lg:text-3xl leading-[30px] tracking-[-0.01em]">
        Identificação do relógio
      </h2>
      <p className="text-gray-600 text-sm mb-8">
        Confirme ou edite as informações básicas do relógio que você deseja anunciar
      </p>

      <div className="space-y-4 lg:space-y-6">
        <Input
          {...register("brand")}
          id="brand"
          label="Marca *"
          type="text"
          error={errors.brand?.message as string}
          placeholder="Ex: Rolex, Omega, Patek Philippe"
        />

        <Input
          {...register("model")}
          id="model"
          label="Modelo *"
          type="text"
          error={errors.model?.message as string}
          placeholder="Ex: Submariner, Speedmaster, Nautilus"
        />

        <Input
          {...register("referenceNumber")}
          id="referenceNumber"
          label="Número de referência (Opcional)"
          type="text"
          error={errors.referenceNumber?.message as string}
          placeholder="Ex: 126610LN, 310.30.42.50.01.001"
        />
      </div>

      {/* Preview Card - Mostra apenas quando houver marca e modelo */}
      {formBrand && formModel && (
        <PreviewCard
          brand={formBrand}
          model={formModel}
          referenceNumber={formReference}
          className="mt-6"
        />
      )}
    </div>
  );
}
