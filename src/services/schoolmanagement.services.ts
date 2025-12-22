import { api } from "@/config/axios.config"

export const getSchoolByMonitor = async () => {
    const { data } = await api.get("/schoolmanagement/school-per-monitor");
    return data;
}
export const getMonitorDashboard = async () => {
    const { data } = await api.get('/schoolmanagement/dashboard');
    return data;
}