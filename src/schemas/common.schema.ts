import { z } from "zod";

// Esquemas compartidos que no dependen de otros módulos para evitar ciclos
export const DiagnosticResponseSchema = z.record(
    // Key: Será el string "pregunta-ID"
    z.string(),
    z.union([z.string(), z.number(), z.null()]).optional()
);

export type DiagnosticResponse = z.infer<typeof DiagnosticResponseSchema>;
