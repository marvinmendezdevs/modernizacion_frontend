import StatCard from "@/components/pages/dashboard/StatCard";
import Teacher from "@/components/pages/dashboard/GeneralInformation";
import useDashboard from "@/hooks/useDashboard.hooks";
import { getTeacherInfo } from "@/services/dashboard.services";
import { useQuery } from "@tanstack/react-query";
import { Key, ShieldCheck, Users } from "lucide-react";
import { useMemo } from "react";
import type { DashboardRecord } from "@/types/dashboard.types";
import TeachersGrafics from "../accesos/TeachersGrafics";

type SubtypeBlock = {
  docentes: DashboardRecord[];
  secciones: DashboardRecord[];
  estudiantes: DashboardRecord[];
};

type DashboardJsonApi = {
  clases?: SubtypeBlock;
  refuerzo?: SubtypeBlock;
  remediacion?: SubtypeBlock;
};

type DashboardReportApi = {
  id: number;
  category: string;
  dateReported: string;
  type: string;
  json: DashboardJsonApi;
};

type TeacherInfoResponse = {
  last: DashboardReportApi | null;
  cumulative: DashboardReportApi[];
};

type CategoryTab = "Diario" | "Acumulado";

function normalizeCategory(category?: string) {
  return (category ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function TeacherDashboard({
  startDate,
  endDate,
  activeGroup,
  activeCategory,
}: {
  startDate: string;
  endDate: string;
  activeGroup: 1 | 2;
  activeCategory: CategoryTab;
}) {
  const { isLoading, isError, data } = useQuery<TeacherInfoResponse>({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () => getTeacherInfo(startDate, endDate),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const sourceReports = useMemo<DashboardReportApi[]>(() => {
    if (!data) return [];

    const reports = [
      ...(data.last ? [data.last] : []),
      ...(data.cumulative ?? []),
    ];

    return reports.filter(
      (report) =>
        normalizeCategory(report.category) ===
        normalizeCategory(activeCategory)
    );
  }, [data, activeCategory]);

  const getBlock = (report: DashboardReportApi) => report.json?.remediacion;

  const docentesSeriesData = useMemo<DashboardRecord[]>(() => {
    const ordered = sourceReports
      .slice()
      .sort(
        (a, b) =>
          new Date(a.dateReported).getTime() - new Date(b.dateReported).getTime()
      );

    return ordered.flatMap((report) =>
      (getBlock(report)?.docentes ?? []).map((row) => ({
        ...row,
        type: "Docentes",
        dateReported: report.dateReported,
      }))
    );
  }, [sourceReports]);

  const docentesLastDayData = useMemo<DashboardRecord[]>(() => {
    if (!sourceReports.length) return [];

    const latest = sourceReports.reduce(
      (acc, r) =>
        new Date(r.dateReported).getTime() >
        new Date(acc.dateReported).getTime()
          ? r
          : acc,
      sourceReports[0]
    );

    return (getBlock(latest)?.docentes ?? []).map((row) => ({
      ...row,
      type: "Docentes",
      dateReported: latest.dateReported,
    }));
  }, [sourceReports]);

  const { totalInfo, calculateTotals } = useDashboard(
    docentesLastDayData,
    "Docentes",
    startDate,
    endDate
  );

  const { onTimeInfo } = useDashboard(
    docentesSeriesData,
    "Docentes",
    startDate,
    endDate
  );

  if (isLoading) {
    return (
      <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
        <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
        Cargando información...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-xs text-red-600 text-center p-3">
        ¡Error inesperado! contacte con soporte.
      </p>
    );
  }

  const hasRealData = docentesSeriesData.length > 0;

  if (!hasRealData) {
    return (
      <p className="text-xs text-slate-600 text-center p-3">
        No hay datos para la categoría seleccionada.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="text-indigo-700 text-3xl font-semibold">
          Accesos de docentes
        </h1>
      </div>

      <div className="grid grid-cols-1 mt-5 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Docentes"
          value={calculateTotals("total")}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Docentes con Acceso"
          value={calculateTotals("access")}
          icon={Key}
          color="emerald"
        />
        <StatCard
          title="Docentes Demo"
          value={calculateTotals("demo")}
          icon={ShieldCheck}
          color="rose"
        />
      </div>

      <Teacher title="Información de Docentes" teacherData={totalInfo} />
      <TeachersGrafics onTimeInfo={onTimeInfo} activeGroup={activeGroup} />
    </div>
  );
}

export default TeacherDashboard;