import useDashboard from "@/hooks/useDashboard.hooks";
import { getTeacherInfo } from "@/services/dashboard.services";
import type { DashboardRecord } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";
import StatCard from "./StatCard";
import { Key, ShieldCheck, User } from "lucide-react";
import GeneralInformation from "./GeneralInformation";
import { useMemo } from "react";
import SectionsGrafics from "./accesos/SectionsGrafics";

type DashboardJsonApi = {
  docentes: DashboardRecord[];
  secciones: DashboardRecord[];
  estudiantes: DashboardRecord[];
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

function SectionDashboard({
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
        normalizeCategory(activeCategory),
    );
  }, [data, activeCategory]);

  const seccionesSeriesData = useMemo<DashboardRecord[]>(() => {
    const ordered = sourceReports
      .slice()
      .sort(
        (a, b) =>
          new Date(a.dateReported).getTime() -
          new Date(b.dateReported).getTime(),
      );

    return source.flatMap((report) =>
      (report.json.secciones ?? []).map((row) => ({
        ...row,
        type: "Secciones",
        dateReported: report.dateReported,
      })),
    );
  }, [sourceReports]);

  const seccionesLastDayData = useMemo<DashboardRecord[]>(() => {
    if (!sourceReports.length) return [];

    const latest = sourceReports.reduce((acc, r) => {
      return new Date(r.dateReported).getTime() >
        new Date(acc.dateReported).getTime()
        ? r
        : acc;
    }, sourceReports[0]);

    return (report.json.secciones ?? []).map((row) => ({
      ...row,
      type: "Secciones",
      dateReported: latest.dateReported,
    }));
  }, [sourceReports]);

  const { totalInfo, calculateTotals } = useDashboard(
    seccionesLastDayData,
    "Secciones",
    startDate,
    endDate,
  );

  const { onTimeInfo } = useDashboard(
    seccionesSeriesData,
    "Secciones",
    startDate,
    endDate,
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

  if (!sourceReports.length) {
    return;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 pt-5">
        <h1 className="text-indigo-700 text-3xl font-semibold">
          Accesos de clases
        </h1>
      </div>

      <div className="grid grid-cols-1 mt-5 md:grid-cols-3 gap-6">
        <StatCard
          title="Total secciones"
          value={calculateTotals("total")}
          icon={User}
          color="blue"
        />
        <StatCard
          title="Secciones con Acceso"
          value={calculateTotals("access")}
          icon={Key}
          color="emerald"
        />
        <StatCard
          title="Secciones con Demo"
          value={calculateTotals("demo")}
          icon={ShieldCheck}
          color="rose"
        />
      </div>

      <GeneralInformation
        title="Información de secciones"
        teacherData={totalInfo}
      />
      <SectionsGrafics onTimeInfo={onTimeInfo} activeGroup={activeGroup} />
    </div>
  );
}

export default SectionDashboard;
