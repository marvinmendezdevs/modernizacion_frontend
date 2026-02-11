import { api } from "@/config/axios.config";


export const metrics = async (startDate: string, endDate: string) => {
    const { data } = await api.get("/metrics",{
        params: {
            startDate,
            endDate
        }
    });

    return data;
}