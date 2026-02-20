import z from "zod";
import { DiagnosticResponseSchema } from "./common.schema";
import { SchoolSchema } from "./school.schema";
import { TeacherSchema } from "./teacher.schemas";

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
    access: z.boolean(),
    section: SectionSchoolSchema,
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
    quizz: z.string(),
    subject: z.string(),
});


export const ObservationSchema = z.object({
  id: z.number(),
  instrumentId: z.number(),
  payload: z.object({
    score: z.number(),
    answers: z.string(),
    subject: z.string(),
  }),
  school: z.object({
    code: z.string(),
    name: z.string(),
    address: z.string(),
    block: z.string(),
    phase: z.string(),
  }),
  schoolCode: z.string(),
  sectionId: z.number(),
  submittedAt: z.string().datetime(),
  teacherId: z.number(),
  tutorId: z.number(),
  utilitiesLink: z.object({
    id: z.string(),
    video: z.string(),
    transcription: z.string(),
  }),
});


export const FeedbackSchema = z.object({
  id: z.number(),
  responseId: z.number(),
  commitments: z.string(),
  recommendations: z.string(),
  directorName: z.string(),
  directorObservation: z.boolean(),
  selectedCriteria: z.array(z.string()),
  tracking: z.string(),
  teacherId: z.number(),
  tutorId: z.number(),
  createdAt: z.date()
});

