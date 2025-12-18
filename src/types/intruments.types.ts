import z from "zod";
import type { InstrumentContentSchema, SeccionSchema, IndicadorSchema, PreguntaSchema, OpcionSchema, InstrumentTableSchema, ResponseSectionSchema, MultimediaSchema, CoachingSessionSchema } from "@/schemas/instruments.schema";
import type { DiagnosticResponseSchema } from "@/schemas/common.schema";

export type PayloadType = {
    answers: Record<string, string | number | null | undefined>;
    score: number;
    subject: string;
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

export type ResponseSectionSchema = z.infer<typeof ResponseSectionSchema>

export type MultimediaType = z.infer<typeof MultimediaSchema>

export type CoachingSessionType = z.infer<typeof CoachingSessionSchema>

// Payload used to create a coaching session (DB will set `id` and `createdAt`)
export type CoachingSessionCreateType = Omit<CoachingSessionType, 'id' | 'createdAt'>