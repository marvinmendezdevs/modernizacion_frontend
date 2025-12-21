import z from "zod";
import { DiagnosticResponseSchema } from "./common.schema";
import { SchoolSchema } from "./school.schema";

export const SectionSchema = z.object({
    id: z.number(),
    schoolCode: z.string(),
    grade: z.string(),
    track: z.string(),
    subtrack: z.string(),
    sectionClass: z.string(),
    shift: z.string()
});

export const SectionSchoolSchema = SectionSchema.extend({
    school: SchoolSchema
});

export const AssignamentSchema = z.object({
    id: z.number(),
    teacherId: z.number(),
    sectionId: z.number(),
    subject: z.string(),
    section: SectionSchoolSchema,
});

export const TeacherSchema = z.object({
    id: z.number(),
    dui: z.string(),
    name: z.string(),
    email: z.string(),
    telephone: z.string(),
    status: z.boolean(),
});

export const TeacherTutorSchema = TeacherSchema.extend({
    assignments: z.array(AssignamentSchema)
});

export const ResponseSchema = z.object({
    id: z.number(),
    // responseId property removed
    instrumentId: z.number(),
    schoolCode: z.number(),
    sectionId: z.number(),
    teacherId: z.number(),
    tutorId: z.number(),
    payload: z.object({
        score: z.number(),
        subject: z.string(),
        answers: DiagnosticResponseSchema,
    }),
    submittedAt: z.string(),
});

export const ResponseTableSchema = z.array(ResponseSchema);

export const TeacherWithResponses = TeacherTutorSchema.extend({
    responses: ResponseTableSchema
});

export const VirtualSessionShema = z.object({
    id: z.number(),
    tutorId: z.number(),
    date: z.string(),
    hour: z.string(),
    meet: z.string(),
    recording: z.string(),
    transcription: z.string(),
    attendance: z.string(),
    quizz: z.string()
});