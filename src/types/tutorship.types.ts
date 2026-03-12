import type z from "zod";
import type { AssignamentSchema, FeedbackSchema, ObservationSchema, SectionSchoolSchema, TeacherWithResponses, VirtualSessionShema, UniqueTeacher } from "@/schemas/tutorship.schema";
import type { TeacherType } from "./index.types";
import type { TutorInfoViewSchema } from "@/schemas/instruments.schema";

export type AssignmentType = z.infer<typeof AssignamentSchema>
export type SectionSchoolType = z.infer<typeof SectionSchoolSchema>

export type TeacherTutorType = z.infer<typeof TeacherWithResponses>
export type UniqueTeacher = z.infer<typeof UniqueTeacher>
export type TeacherSection = Omit<AssignmentType, 'section'>
export type TeacherSectionUser = TeacherSection & {
    teacher: TeacherType
    section: SectionSchoolType
};

export type TutorCountType = {
    presenciales: number;
    virtuales: number;
}

export type VirtualSessionType = z.infer<typeof VirtualSessionShema>

export type TutorInfoViewType = z.infer<typeof TutorInfoViewSchema>

export type ObservationSchema = z.infer<typeof ObservationSchema>

export type FeedbackSchema = z.infer<typeof FeedbackSchema>


