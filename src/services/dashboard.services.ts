import { api } from "@/config/axios.config"
import type { GetGestionEscolarParams } from "@/types/dashboard.types";

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

export const getGestionEscolar = async ({
  category,
  selectedDate,
  startDate,
  endDate,
}: GetGestionEscolarParams) => {
  const searchParams = new URLSearchParams();

  searchParams.append("category", category);

  if (category === "Diario" && selectedDate) {
    searchParams.append("selectedDate", selectedDate);
  }

  if (category === "Acumulado") {
    if (startDate) searchParams.append("startDate", startDate);
    if (endDate) searchParams.append("endDate", endDate);
  }

  const response = await api.get(
    `/metrics/gestion-metrics?${searchParams.toString()}`
  );

  return response.data;
};