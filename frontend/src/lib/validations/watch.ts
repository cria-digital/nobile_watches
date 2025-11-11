import { z } from "zod";

export const watchSchema = z.object({
  // STEP 1 - Identificação (obrigatórios)
  brand: z
    .string()
    .min(2, "A marca deve ter pelo menos 2 caracteres")
    .max(100, "A marca não pode ter mais de 100 caracteres"),
  model: z
    .string()
    .min(2, "O modelo deve ter pelo menos 2 caracteres")
    .max(100, "O modelo não pode ter mais de 100 caracteres"),

  // STEP 2 - Título & Destaque (opcional)
  referenceNumber: z.string().max(100, "Número de referência muito longo").optional(),

  // STEP 3 - Detalhes
  year: z
    .union([
      z.string().regex(/^\d{4}$/, "Ano inválido (formato: AAAA)"),
      z
        .number()
        .int()
        .min(1900, "Ano deve ser maior que 1900")
        .max(new Date().getFullYear(), "Ano não pode ser futuro"),
    ])
    .optional()
    .transform(val => (val ? Number(val) : undefined)),
  gender: z.enum(["Homem", "Mulher", "Unissex", ""]).optional(),
  dialColor: z.string().max(50, "Cor muito longa").optional(),
  movement: z.string().max(100, "Movimento muito longo").optional(),
  caseMaterial: z.string().max(100, "Material muito longo").optional(),
  caseDiameter: z
    .union([
      z.string().regex(/^\d+(\.\d+)?$/, "Diâmetro inválido"),
      z.number().positive("Diâmetro deve ser positivo"),
    ])
    .optional()
    .transform(val => (val ? Number(val) : undefined)),
  braceletMaterial: z.string().max(100, "Material muito longo").optional(),
  braceletColor: z.string().max(50, "Cor muito longa").optional(),
  claspType: z.string().max(50, "Tipo de fecho muito longo").optional(),

  // STEP 3 - Imagens
  images: z.any().optional(),

  // STEP 4 - Inclusos
  includedBox: z.boolean().optional(),
  includedDocs: z.boolean().optional(),
  includedOthers: z.boolean().optional(),

  // STEP 5 - Estado (obrigatório)

  hasSignsOfWear: z.enum(["yes", "no"]).default("no"),
  condition: z.string().min(3, "Condição é obrigatória").max(50, "Condição muito longa"),

  // STEP 6 - Descrição (opcional)
  description: z
    .string()
    .max(2000, "Descrição não pode ter mais de 2000 caracteres")
    .optional(),

  // STEP 7 - Preço & Envio (obrigatório)
  price: z
    .union([
      z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido (use formato: 12345.67)"),
      z.number().positive("O preço deve ser maior que zero"),
    ])
    .refine(val => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return num >= 100;
    }, "O preço mínimo é R$ 100,00")
    .refine(val => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return num <= 10000000;
    }, "O preço máximo é R$ 10.000.000,00")
    .transform(val => (typeof val === "string" ? parseFloat(val) : val)),
});

export type CreateWatchFormValues = z.infer<typeof watchSchema>;
