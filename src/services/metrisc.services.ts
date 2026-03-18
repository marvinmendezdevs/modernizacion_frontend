import { api } from "@/config/axios.config";
import type { MetricData } from "@/types/metrics";


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

export const metricsUpload = async (payload: MetricData) => {
        const { data } = await api.post("/metrics/update", payload);
    return data;
}

export async function deleteMetric(id: number) {
  const { data } = await api.delete(`/metrics/${id}`);
  return data;
}