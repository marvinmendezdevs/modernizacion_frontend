import { api } from "@/config/axios.config"

export const getTeacherInfo = async (startDate: string, endDate: string) => {
    const { data } = await api.get("/dashboard",{
        params: {
            startDate,
            endDate
        }
    });

    return data;
}
export const getSeccionClasses = async (startDate: string) => {
    const { data } = await api.get("/dashboard/secciones-dashboard",{
        params: {
            startDate,
        }
    });

    return data;
}