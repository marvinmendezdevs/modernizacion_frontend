import z from "zod";
import type { InstrumentContentSchema, SeccionSchema, IndicadorSchema, PreguntaSchema, OpcionSchema, InstrumentTableSchema, DiagnosticResponseSchema } from "@/schemas/instruments.schema";

export type PayloadType = {
    answers: Record<string, string | number | null | undefined>;
    score: number;
};

export type DiagnosticMutationBody = {
    teacherId: number;
    sectionId: number;
    schoolCode: number;
    payload: PayloadType
}

export type InstrumentTable = z.infer<typeof InstrumentTableSchema>;
export type InstrumentContent = z.infer<typeof InstrumentContentSchema>;
export type Seccion = z.infer<typeof SeccionSchema>;
export type Indicador = z.infer<typeof IndicadorSchema>;
export type Pregunta = z.infer<typeof PreguntaSchema>;
export type Opcion = z.infer<typeof OpcionSchema>;

export type DiagnosticResponseValues = z.infer<typeof DiagnosticResponseSchema>;