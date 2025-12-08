import type z from "zod";
import type { AssignamentSchema, SectionSchoolSchema, TeacherWithResponses } from "@/schemas/tutorship.schema";
import type { TeacherType } from "./index.types";

export type AssignmentType = z.infer<typeof AssignamentSchema>
export type SectionSchoolType = z.infer<typeof SectionSchoolSchema>

export type TeacherTutorType = z.infer<typeof TeacherWithResponses>

export type TeacherSection = Omit<AssignmentType, 'section'>
export type TeacherSectionUser = TeacherSection & {
    teacher: TeacherType
    section: SectionSchoolType
};
