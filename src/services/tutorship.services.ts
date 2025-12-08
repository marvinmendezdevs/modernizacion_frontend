import { api } from "@/config/axios.config"
import type { SectionType, TeacherType } from "@/types/index.types";
import type { DiagnosticMutationBody } from "@/types/intruments.types";

export const getMetricsTutorship = async () => {
    const { data } = await api.get('/tutorship');
    return data;
}

export const getTeachersByTutors = async (search: string) => {
    const { data } = await api.get(`/tutorship/tutor/teachers?search=${search}`);
    return data;
}

export const getTeacherBySection = async (teacherId: TeacherType['id'], sectionId: SectionType['id']) => {
    const { data } = await api.get(`/tutorship/teacher/${teacherId}/${sectionId}`);

    return data;
}

export const getDiagnostic = async () => {
    const { data } = await api.get('/tutorship/diagnostic');    
    return data;
}

export const setDiagnostic = async (formData: DiagnosticMutationBody) => {
    const { data } = await api.post('/tutorship/diagnostic', formData);
    console.log(data); 
    return data;
}