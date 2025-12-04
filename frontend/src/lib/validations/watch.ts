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
    .max(200, "O modelo não pode ter mais de 200 caracteres"),
  referenceNumber: z
    .string()
    .max(250, "Número de referência muito longo")
    .optional(),

  // STEP 2 - Título & Destaque (opcional)
  titleSuffix: z
    .string()
    .trim() // Remove espaços nas pontas
    .max(60, "Informações adicionais não podem ter mais de 60 caracteres")
    .optional()
    .or(z.literal("")),

  // STEP 3 - Detalhes
  year: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "") return undefined;
      return val;
    })
    .pipe(
      z
        .string()
        .optional()
        .superRefine((val, ctx) => {
          if (!val) return;

          const num = Number(val);

          if (isNaN(num) || !Number.isInteger(num)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Ano inválido",
            });
            return;
          }

          if (num < 1500) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Informe um ano a partir de 1500",
            });
            return;
          }

          if (num > new Date().getFullYear()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Ano não pode ser futuro",
            });
            return;
          }
        })
        .transform((val) => {
          if (!val) return undefined;
          return Number(val);
        })
    ),
  gender: z.enum(["Homem", "Mulher", "Unissex", ""]).optional(),
  serialNumber: z.string().max(100, "Número de série muito longo").optional(),
  dialColor: z.string().optional(),
  movement: z.string().max(50, "Tipo de movimento muito longo").optional(),
  caseMaterial: z.string().max(100, "Material muito longo").optional(),
  caseDiameter: z
    .union([
      z.literal(""),
      z.string().regex(/^\d+(\.\d+)?$/, "Diâmetro inválido"),
      z.number().positive("Diâmetro deve ser positivo"),
    ])
    .optional()
    .transform((val) => {
      if (!val || val === "") return undefined;
      return Number(val);
    }),
  braceletMaterial: z.string().max(100, "Material muito longo").optional(),
  braceletColor: z.string().optional(),
  claspType: z.string().max(50, "Tipo de fecho muito longo").optional(),

  // STEP 3 - Imagens
  image: z.any().optional(),

  // Step 4 - Acessórios inclusos (ATUALIZADO)
  includedAccessories: z
    .enum(["box_and_docs", "box_only", "docs_only", "none"])
    .optional(),

  // STEP 5 - Estado (obrigatório)
  hasSignsOfWear: z.enum(["yes", "no"]).default("no"),
  condition: z
    .string()
    .min(1, "Essa informação é obrigatória")
    .refine(
      (val) => ["Novo", "Muito bom", "Bom", "Aceitável"].includes(val),
      "Selecione uma condição válida"
    ),

  // STEP 6 - Descrição (opcional)
  description: z
    .string()
    .max(2000, "Descrição não pode ter mais de 2000 caracteres")
    .optional(),

  // STEP 7 - Preço & Envio (obrigatório)
  price: z
    .union([
      z.literal(""), // Permite string vazia
      z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, "Preço inválido (use formato: 12345.67)"),
      z.number().positive("O preço deve ser maior que zero"),
    ])
    .refine(
      (val) => {
        // Se for string vazia, passa (campo ainda não preenchido)
        if (val === "") return true;

        const num = typeof val === "string" ? parseFloat(val) : val;
        return !isNaN(num) && num > 0;
      },
      { message: "O preço deve ser maior que zero" }
    )
    // Validação final: quando for submeter, não pode estar vazio
    .refine((val) => val !== "", { message: "O preço é obrigatório" }),
});

export type CreateWatchFormValues = z.infer<typeof watchSchema>;
