import type { DashboardRecord } from "@/types/dashboard.types";

type UseDashboardTypeReturn = {
  totalInfo: DashboardRecord[];
  onTimeInfo: DashboardRecord[];
  calculateTotals: (category: "total" | "demo" | "access") => number;
  filterByDate: (date: string) => void;
};

const toISODate = (value: string): string | null => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
};

const toTime = (value: string): number | null => {
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
};

export default function useDashboard(
  data: DashboardRecord[],
  type: string
): UseDashboardTypeReturn {
  const hoy = new Date().toISOString().split("T")[0];

  // 1) Solo registros con fecha válida
  const dataWithValidDate = data.filter((item) => toTime(item.dateReported) !== null);

  // 2) Intenta mostrar los de "hoy"
  let datosParaMostrar: DashboardRecord[] = dataWithValidDate.filter((item) => {
    const fechaItem = toISODate(item.dateReported);
    return fechaItem === hoy;
  });

  // 3) Si no hay de hoy, usa la última fecha disponible
  if (datosParaMostrar.length === 0 && dataWithValidDate.length > 0) {
    const ultimoRegistro = [...dataWithValidDate].sort((a, b) => {
      const tb = toTime(b.dateReported) ?? 0;
      const ta = toTime(a.dateReported) ?? 0;
      return tb - ta;
    })[0];

    const ultimaFechaDisponible = toISODate(ultimoRegistro.dateReported);

    if (ultimaFechaDisponible) {
      datosParaMostrar = dataWithValidDate.filter(
        (item) => toISODate(item.dateReported) === ultimaFechaDisponible
      );
    } else {
      datosParaMostrar = [];
    }
  }

  const totalInfo = datosParaMostrar.filter((item) => item.type === type);

  const onTimeInfo = dataWithValidDate
    .filter((item) => item.type === type)
    .sort((a, b) => {
      const ta = toTime(a.dateReported) ?? 0;
      const tb = toTime(b.dateReported) ?? 0;
      return ta - tb;
    });

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
