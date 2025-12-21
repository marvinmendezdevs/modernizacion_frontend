import { z } from "zod";
import { ResponseSchema, ResponseTableSchema, TeacherSchema } from "./tutorship.schema";
import { SchoolSchema, SectionSchema as SectionSchoolSchema } from "./school.schema";
import { DistrictShema, InfoTutor, UserSchema } from "./auth.schema";

// 1. Esquema para las Opciones (ej: Bajo, Medio, Alto)
// Coincide con: { "valor": 1, "etiqueta": "Bajo" }
export const OpcionSchema = z.object({
    valor: z.number().nullable(), // Puede ser null para "N/A"
    etiqueta: z.string(),
});

// 2. Esquema para las Preguntas individuales
export const PreguntaSchema = z.object({
    id_pregunta: z.number(),
    texto: z.string(),
    tipo_respuesta: z.string(), // Ej: "escala"
    requerida: z.boolean(),
    opciones: z.array(OpcionSchema),
});

// 3. Esquema para los Indicadores (Agrupan preguntas, ej: "AMBIENTE DE APRENDIZAJE")
export const IndicadorSchema = z.object({
    id_indicador: z.number(),
    nombre_indicador: z.string(),
    mostrar_titulo: z.boolean(),
    preguntas: z.array(PreguntaSchema),
});

// 4. Esquema para las Secciones (Nivel superior, ej: "CULTURA DEL AULA")
export const SeccionSchema = z.object({
    id_seccion: z.string(), // En tu JSON viene como string "1", "2"
    nombre_seccion: z.string(),
    mostrar_titulo: z.boolean(),
    indicadores: z.array(IndicadorSchema),
});

// 5. Esquema del contenido JSON (lo que guardas en la columna 'schema' de la BD)
export const InstrumentContentSchema = z.array(SeccionSchema);

// 6. Esquema completo de la tabla 'instrument' (opcional, por si manejas el objeto completo)
export const InstrumentTableSchema = z.object({
    id: z.number().optional(),
    title: z.string(),
    slug: z.string(),
    type: z.string(),
    schema: InstrumentContentSchema, // Aquí validamos el JSON interno
});

// DiagnosticResponseSchema moved to common.schema to avoid circular imports

export const MultimediaSchema = z.object({
    id: z.number(),
    video: z.string(),
    transcription: z.string(),
});

export const LinksSchema = z.object({
    id: z.number(),
    recording: z.string(),
    transcription: z.string(),
    attendance: z.string(),
    quizz: z.string(),
});

export type LinksSchema = z.infer<typeof LinksSchema>;

export const CoachingSessionSchema = z.object({
    id: z.number(),
    responseId: z.number(),
    tutorId: z.number(),
    teacherId: z.number(),
    directorName: z.string().nullable(),
    selectedCriteria: z.array(z.string()),
    recommendations: z.string().nullable(),
    commitments: z.string().nullable(),
    directorObservation: z.boolean(),
    tracking: z.string().nullable(),
    createdAt: z.string(),
});


// Schemas de las respuestas
export const ResponseSectionSchema = ResponseSchema.extend({
    section: SectionSchoolSchema,
    utilitiesLink: MultimediaSchema.nullable(),
    tutor: UserSchema,
    teacher: TeacherSchema.extend({
        coachingSessions: z.array(CoachingSessionSchema),
    }),
    school: SchoolSchema,
    coachingSession: CoachingSessionSchema,
});

export const TutorInfoViewSchema = UserSchema.extend({

    coachingSessions: z.array(CoachingSessionSchema),
    infoTutores: InfoTutor.extend({
        districts: DistrictShema
    }),
    responses: ResponseTableSchema,
});