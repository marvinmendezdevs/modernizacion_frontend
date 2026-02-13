import type { DashboardRecord } from "@/types/dashboard.types";

type UseDashboardTypeReturn = {
  totalInfo: DashboardRecord[];
  onTimeInfo: DashboardRecord[];
  calculateTotals: (category: "total" | "demo" | "access") => number;
  filterByDate: (date: string) => void;
};

const toISODate = (value: string): string | null => {
  const t = Date.parse(value);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString().split("T")[0];
};

const toTime = (value: string): number | null => {
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
};

export default function useDashboard(
  data: DashboardRecord[],
  type: string,
  startDate: string,
  endDate: string
): UseDashboardTypeReturn {
  const startISO = toISODate(startDate) ?? startDate;
  const endISO = toISODate(endDate) ?? endDate;

  const dataWithValidDate = data.filter((item) => toTime(item.dateReported) !== null);

  const inRange = dataWithValidDate.filter((item) => {
    const d = toISODate(item.dateReported);
    if (!d) return false;
    return d >= startISO && d <= endISO;
  });

  const onTimeInfo = inRange
    .filter((item) => item.type === type)
    .sort((a, b) => (toTime(a.dateReported) ?? 0) - (toTime(b.dateReported) ?? 0));

  let datosParaMostrar = inRange.filter((item) => toISODate(item.dateReported) === startISO);

  if (datosParaMostrar.length === 0 && inRange.length > 0) {
    const ultimoRegistro = [...inRange].sort(
      (a, b) => (toTime(b.dateReported) ?? 0) - (toTime(a.dateReported) ?? 0)
    )[0];

    const ultimaFechaDisponible = toISODate(ultimoRegistro.dateReported);

    datosParaMostrar = ultimaFechaDisponible
      ? inRange.filter((item) => toISODate(item.dateReported) === ultimaFechaDisponible)
      : [];
  }

  const totalInfo = datosParaMostrar.filter((item) => item.type === type);

  const calculateTotals = (category: "total" | "demo" | "access") =>
    totalInfo.reduce((acc, item) => acc + item[category], 0);

  const filterByDate = (date: string) => {
    console.log(date);
  };

  return {
    totalInfo,
    onTimeInfo,
    calculateTotals,
    filterByDate,
  };
}
