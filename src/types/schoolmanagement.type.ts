import type { DashboardFacilitatorSchema, SchoolByMonitorSchema } from "@/schemas/schoolmanagement.schema";
import z from "zod";
import type { UserType } from "./auth.types";

export type SchoolByMonitorType = z.infer<typeof SchoolByMonitorSchema>

export type SchoolAnswers = Record<string, string | null | undefined>;
export type DistrictInfo = {
  id: number;
  district: string;
  municipality: string;
  department: string;
};

export type SchoolInfo = {
  code: string;
  name: string;
  address: string;
  directorName: string;
  directorPhone: string;
  districtId: number;
  schoolEnrollment: boolean;
  schoolSchedule: boolean;
  teachingAssignment: boolean;
  block: string;
  Districts: DistrictInfo;
  sections: SectionItem[];
};


export type SchoolInfoWithUsers = SchoolInfo & {
  userSchool: Array<{
    id: number;
    userId: number;
    schoolCode: string;
    createdAt: string;
    user: UserType;
  }>;
};


export type MonitorRow = {
  id: number;
  instrumentId: number;
  tutorId: number;
  schoolCode: string;
  payload: SchoolAnswers;
  submittedAt: string;
  utilitiesLink?: string | null;
  school?: SchoolInfo;
};

export type TableRow = {
  code: string;
  name: string;
  directorName: string;
  directorPhone: string;
  matricula: "Si" | "No" | "";
  cargaHoraria: "Si" | "No" | "";
  asignacionDocente: "Si" | "No" | "";
  district: string;
  municipality: string;
  department: string;
};

export type UpdateDirectorPayload = {
  schoolCode: number;
  roleId: number;
  email: string;
  name: string;
  dui: string;
  telephone: string;
};

export type UpdateSubdirectorPayload = {
  schoolCode: number;
  roleId: number;
  email: string;
  name: string;
  dui: string;
  telephone: string;
};

export type DirectorForm = {
  email: string;
  name: string;
  dui: string;
  telephone: string;
};

export type SubdirectorForm = {
  email: string;
  name: string;
  dui: string;
  telephone: string;
};

export type DeleteUserSchool = {
  userId: number;
  schoolCode: string;
};

export type Assignment = {
  id: number;
  subject: string;
  teacherId: number;
  sectionId: number;
  isDirector: boolean;
  access: string | null
};

export type SectionItem = {
  id: number;
  grade: string
  sectionClass: string;
  shift: string;
  subtrack: string;
  track: string;
  activityLabel: string;
  kind: "remediation" | "reinforcement";
  schoolCode: string;
  name: string;
  phone: string;
  dui: string;
  speciality: string;
  email: string;
};

export type DashboardFacilitatorType = z.infer<typeof DashboardFacilitatorSchema>

type DetailsPublicDashboard = {
  total: number;
  detalles: Record<string, number>,
  llamadas: {
    respondidas: number;
    no_respondidas: number;
  }
}

export type DashboardPublicGS = {
    id: number,
    dateReported: string,
    type: string,
    json: {
        docentes: DetailsPublicDashboard,
        directores: DetailsPublicDashboard
    },
    category: string
}