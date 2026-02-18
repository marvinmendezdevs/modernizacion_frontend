import StatCard from "@/components/pages/dashboard/StatCard";
import Teacher from "@/components/pages/dashboard/GeneralInformation";
import useDashboard from "@/hooks/useDashboard.hooks";
import { getTeacherInfo } from "@/services/dashboard.services";
import { useQuery } from "@tanstack/react-query";
import { Key, ShieldCheck, Users } from "lucide-react";
import { useMemo } from "react";
import type { DashboardRecord } from "@/types/dashboard.types";
import TeachersGrafics1 from "./accesos/TeachersGrafics";

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

function TeacherDashboard({
  startDate,
  endDate,
  activeGroup,
}: {
  startDate: string;
  endDate: string;
  activeGroup: 1 | 2;
}) {
  const { isLoading, isError, data } = useQuery<TeacherInfoResponse>({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () => getTeacherInfo(startDate, endDate),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const docentesSeriesData = useMemo<DashboardRecord[]>(() => {
    const source =
      data?.cumulative?.length ? data.cumulative : data?.last ? [data.last] : [];

    return source.flatMap((report) =>
      (report.json.docentes ?? []).map((row) => ({
        ...row,
        type: "Docentes",
        dateReported: report.dateReported,
      }))
    );
  }, [data]);

  const docentesLastDayData = useMemo<DashboardRecord[]>(() => {
    const report =
      data?.cumulative?.length
        ? data.cumulative.at(-1) ?? null
        : data?.last ?? null;

    if (!report) return [];

    return (report.json.docentes ?? []).map((row) => ({
      ...row,
      type: "Docentes",
      dateReported: report.dateReported,
    }));
  }, [data]);

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

  if (isError || !data?.last) {
    return (
      <p className="text-xs text-red-600 text-center p-3">
        ¡Error inesperado! contacte con soporte.
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
      <TeachersGrafics1 onTimeInfo={onTimeInfo} activeGroup={activeGroup} />
    </div>
  );
}

export default TeacherDashboard;
