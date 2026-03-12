import StatCard from "@/components/pages/dashboard/StatCard";
import GeneralInformation from "@/components/pages/dashboard/GeneralInformation";
import useDashboard from "@/hooks/useDashboard.hooks";
import { getTeacherInfo } from "@/services/dashboard.services";
import { useQuery } from "@tanstack/react-query";
import { Key, ShieldCheck, Users } from "lucide-react";
import { useMemo } from "react";
import type { DashboardRecord } from "@/types/dashboard.types";
import StudentsGrafics1 from "./accesos/StudentsGrafics";

type SubtypeBlock = {
  docentes: DashboardRecord[];
  secciones: DashboardRecord[];
  estudiantes: DashboardRecord[];
};

type DashboardJsonApi = {
  clases: SubtypeBlock;
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

function StudentDashboard({
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

  const studentsSeriesData = useMemo<DashboardRecord[]>(() => {
    const ordered = sourceReports
      .slice()
      .sort(
        (a, b) =>
          new Date(a.dateReported).getTime() -
          new Date(b.dateReported).getTime()
      );

    return ordered.flatMap((report) =>
      (report.json.clases.estudiantes ?? []).map((row) => ({
        ...row,
        type: "Estudiantes",
        dateReported: report.dateReported,
      }))
    );
  }, [sourceReports]);

  const studentsLastDayData = useMemo<DashboardRecord[]>(() => {
    if (!sourceReports.length) return [];

    const latest = sourceReports.reduce((acc, r) => {
      return new Date(r.dateReported).getTime() >
        new Date(acc.dateReported).getTime()
        ? r
        : acc;
    }, sourceReports[0]);

    return (latest.json.clases.estudiantes ?? []).map((row) => ({
      ...row,
      type: "Estudiantes",
      dateReported: latest.dateReported,
    }));
  }, [sourceReports]);

  const { totalInfo, calculateTotals } = useDashboard(
    studentsLastDayData,
    "Estudiantes",
    startDate,
    endDate
  );

  const { onTimeInfo } = useDashboard(
    studentsSeriesData,
    "Estudiantes",
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

  if (!sourceReports.length) {
    return
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 pt-5">
        <h1 className="text-indigo-700 text-3xl font-semibold">
          Accesos de estudiantes
        </h1>
      </div>

      <div className="grid grid-cols-1 mt-5 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Estudiantes"
          value={calculateTotals("total")}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Estudiantes con Acceso"
          value={calculateTotals("access")}
          icon={Key}
          color="emerald"
        />
        <StatCard
          title="Estudiantes Demo"
          value={calculateTotals("demo")}
          icon={ShieldCheck}
          color="rose"
        />
      </div>

      <GeneralInformation
        title="Información de Estudiantes"
        teacherData={totalInfo}
      />
      <StudentsGrafics1 onTimeInfo={onTimeInfo} activeGroup={activeGroup} />
    </div>
  );
}

export default StudentDashboard;