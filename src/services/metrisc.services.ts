import { api } from "@/config/axios.config";
import type { metricData } from "@/types/metrics";


export const metrics = async (startDate: string, endDate: string) => {
    const { data } = await api.get("/metrics",{
        params: {
            startDate,
            endDate
        }
    });

    return data;
}

export const updateMetrics = async() => {
        const { data } = await api.get("/metrics");
    return data;
}

export const metricsUpload = async (payload: metricData) => {
        const { data } = await api.post("/metrics/data", payload);
    return data;
}