import { Calendar, Key, ShieldCheck, User } from "lucide-react";
import StatCard from "./StatCard";
import { getTeacherInfo } from "@/services/dashboard.services";
import type { DashboardRecord } from "@/types/dashboard.types";
import useDashboard from "@/hooks/useDashboard.hooks";
import { useQuery } from "@tanstack/react-query";
import GeneralInformation from "./GeneralInformation";
import { useMemo, useState } from "react";

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

function StudentDashboard() {
  const getTodayDate = () => new Date().toLocaleDateString("sv-SE");

  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());

  const { isLoading, isError, data } = useQuery<TeacherInfoResponse>({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () => getTeacherInfo(startDate, endDate),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const estudiantesData = useMemo<DashboardRecord[]>(() => {
    const source = data?.cumulative?.length
      ? data.cumulative
      : data?.last
      ? [data.last]
      : [];

    return source.flatMap((report) =>
      (report.json.estudiantes ?? []).map((row) => ({
        ...row,
        type: "Estudiantes",
        dateReported: report.dateReported,
      }))
    );
  }, [data]);

  const newData = estudiantesData.filter((item) => item.group !== 3);

  const { totalInfo, calculateTotals } = useDashboard(newData, "Estudiantes");

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
          Accesos de estudiantes
        </h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto bg-white p-4 rounded-2xl shadow-sm border border-slate-100 items-center justify-end gap-4">
          <p className="text-gray-600 text-sm w-full">Desde</p>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full">
            <Calendar size={16} className="text-slate-400" />
            <input
              className="bg-transparent text-sm text-slate-600 outline-none w-full"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              id="start"
            />
          </div>
          <p className="text-gray-600 text-sm w-full">Hasta</p>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full">
            <Calendar size={16} className="text-slate-400" />
            <input
              className="bg-transparent text-sm text-slate-600 outline-none w-full"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              id="end"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 mt-5 md:grid-cols-3 gap-6">
        <StatCard
          title="Total estudiantes"
          value={calculateTotals("total")}
          icon={User}
          color="blue"
        />
        <StatCard
          title="Estudiantes con Acceso"
          value={calculateTotals("access")}
          icon={Key}
          color="emerald"
        />
        <StatCard
          title="Estudiantes con Demo"
          value={calculateTotals("demo")}
          icon={ShieldCheck}
          color="rose"
        />
      </div>

      <GeneralInformation
        title="Información de estudiantes"
        teacherData={totalInfo}
      />
    </div>
  );
}

export default StudentDashboard;
