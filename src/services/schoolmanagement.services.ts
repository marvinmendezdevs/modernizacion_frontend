import { api } from "@/config/axios.config"

export const getPublicMetrics = async (today: string) => {
    const { data } = await api.get("/schoolmanagement/public-dashboard", {
        params: {
            today
        }
    });
    return data;
}

export const getSchoolByMonitor = async () => {
    const { data } = await api.get("/schoolmanagement/school-per-monitor");
    return data;
}

export const getMonitorDashboard = async () => {
    const { data } = await api.get('/schoolmanagement/dashboard');
    return data;
}

export const getFacilitatorDashboard = async () => {
    const { data } = await api.get('/schoolmanagement/facilitators');
    return data;
}