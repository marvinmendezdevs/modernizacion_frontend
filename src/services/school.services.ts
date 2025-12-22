import { api } from "@/config/axios.config"

export const getSchoolByCode = async (schoolCode: string) => {
    const { data } = await api.get(`/school/${schoolCode}/school`);

    return data;
}