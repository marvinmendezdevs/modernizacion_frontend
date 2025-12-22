import type { SchoolByMonitorSchema } from "@/schemas/schoolmanagement.schema";
import type z from "zod";

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
    address?: string;
    directorName?: string;
    directorPhone?: string;
    districtId?: number;
    schoolEnrollment?: boolean;
    schoolSchedule?: boolean;
    teachingAssignment?: boolean;
    Districts?: DistrictInfo;
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