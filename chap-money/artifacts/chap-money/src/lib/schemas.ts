import { z } from "zod";

export const checkoutSchema = z.object({
  amount: z.coerce.number().int().min(100, "Montant minimum : 100 XOF"),
  description: z.string().optional().default("Paiement Chap Money"),
  paymentMethod: z.enum(["mobile", "card"]),

  // Mobile specific
  country: z.string().optional(),
  operator: z.string().optional(),
  phoneNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod !== "mobile") return;

  if (!data.country) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sélectionnez un pays", path: ["country"] });
    return;
  }
  if (!data.operator) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sélectionnez un opérateur", path: ["operator"] });
  }

  const digits = (data.phoneNumber ?? "").replace(/\D/g, "");
  if (!digits) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Le numéro de téléphone est requis", path: ["phoneNumber"] });
  }
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
