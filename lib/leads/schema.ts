import { z } from "zod";

/** Valor do select de responsável que representa "sem responsável". */
export const NO_OWNER = "none";

const optionalText = (max: number) => z.string().trim().max(max, `Use no máximo ${max} caracteres.`);

/**
 * Validação compartilhada entre o formulário (client) e as Server Actions.
 * Só o nome é obrigatório, como no banco; e-mail é validado quando preenchido.
 */
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do lead.").max(120, "Use no máximo 120 caracteres."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Informe um e-mail válido.",
    }),
  phone: optionalText(30).refine((value) => value === "" || value.replace(/\D/g, "").length >= 8, {
    message: "Informe um telefone válido.",
  }),
  company: optionalText(120),
  jobTitle: optionalText(120),
  status: z.enum(["novo", "contatado", "qualificado", "desqualificado"]),
  ownerId: z.union([z.literal(NO_OWNER), z.string().uuid()]),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
