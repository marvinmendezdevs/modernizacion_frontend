import { api } from "@/config/axios.config"
import type { SectionType, TeacherType } from "@/types/index.types";
import type { DiagnosticMutationBody, MultimediaType } from "@/types/intruments.types";

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
    return data;
}

export const getObservations = async (teacherDui: TeacherType['dui']) => {
    const { data } = await api.get(`/tutorship/observations/${teacherDui}`);
    return data;
}

export const getObservation = async () => {
    const { data } = await api.get('/tutorship/observation');
    return data;
}

export const getObservationById = async (observationId: number) => {
    const { data } = await api.get(`/tutorship/observation/${observationId}`);
    return data;
}

export const setObservation = async (formData: DiagnosticMutationBody) => {
    const { data } = await api.post('/tutorship/observation', formData);
    return data;
}

export const updateMultimediaJson = async (formData: MultimediaType) => {
    const { data } = await api.patch('/tutorship/observation', formData);
    return data;
}