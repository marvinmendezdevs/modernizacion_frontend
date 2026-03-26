export type DashboardRecord = {
    id: number,
    total: number,
    demo: number,
    access: number,
    type: string,
    dateReported: string,
    group: number
}
export type GetGestionEscolarParams = {
  category: "Diario" | "Acumulado";
  selectedDate?: string;
  startDate?: string;
  endDate?: string;
};