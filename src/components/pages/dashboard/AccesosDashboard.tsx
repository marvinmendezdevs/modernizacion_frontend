import { useState } from "react";
import {
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock,
  Clock1,
  Layers,
  Zap,
} from "lucide-react";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
import SectionDashboard from "./SectionDashboard";
import { useQuery } from "@tanstack/react-query";
import { getTeacherInfo } from "@/services/dashboard.services";
import type { DashboardRecord } from "@/types/dashboard.types";
import { formatFullDate } from "@/utils/index.utils";
import RemediacionAccess from "./RemediacionAccess";
import RefuerzoAccess from "./RefuerzoAccess";

type GroupTab = 1 | 2;
type CategoryTab = "Diario" | "Acumulado";
type NavAcces = "clases" | "remediacion" | "refuerzo";

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

function normalizeCategory(category?: string) {
  return (category ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function AccesosDashboard() {
  const formatDate = (date: Date) => date.toLocaleDateString("sv-SE");

  const getTodayDate = () => formatDate(new Date());

  const getDaysAgoDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return formatDate(d);
  };

  const isValidDate = (value?: string | null) => {
    if (!value) return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  };

  const safeDateToLocale = (
    value?: string | null,
    locale = "sv-SE",
    options?: Intl.DateTimeFormatOptions
  ) => {
    if (!isValidDate(value)) return "";
    return new Date(value as string).toLocaleDateString(locale, options);
  };

  const safeTimeToLocale = (
    value?: string | null,
    locale = "es-SV",
    options?: Intl.DateTimeFormatOptions
  ) => {
    if (!isValidDate(value)) return "";
    return new Date(value as string).toLocaleTimeString(locale, options);
  };

  const safeFormatFullDate = (value?: string | null) => {
    if (!isValidDate(value)) return "Pendiente";
    return formatFullDate(value as string);
  };

  const [startDate, setStartDate] = useState(() => getDaysAgoDate(3));
  const [endDate, setEndDate] = useState(() => getTodayDate());
  const [activeGroup, setActiveGroup] = useState<GroupTab>(1);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("Acumulado");
  const [activeView, setActiveView] = useState<NavAcces>("clases");

  const { data } = useQuery<TeacherInfoResponse>({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () => getTeacherInfo(startDate, endDate),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const reports = [
    ...(data?.last ? [data.last] : []),
    ...(data?.cumulative ?? []),
  ];

  const selectedReport =
    reports
      .filter(
        (item) =>
          normalizeCategory(item.category) ===
          normalizeCategory(activeCategory)
      )
      .sort(
        (a, b) =>
          new Date(b.dateReported).getTime() -
          new Date(a.dateReported).getTime()
      )[0] ?? null;

  const tz = "America/El_Salvador";

  const horaSV = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));

  const hora4pm = horaSV.getHours() >= 16;

  const actualyDate = new Date(horaSV);
  if (!hora4pm) actualyDate.setDate(actualyDate.getDate() - 1);

  const actualyDateSV = actualyDate.toLocaleDateString("sv-SE", {
    timeZone: tz,
  });

  const hoySV = horaSV.toLocaleDateString("sv-SE", { timeZone: tz });

  const report = selectedReport?.dateReported;

  let fechaSV = "";
  let esMismaFecha = false;

  if (isValidDate(report)) {
    fechaSV = safeDateToLocale(report, "sv-SE", { timeZone: tz });
    esMismaFecha = fechaSV === actualyDateSV;
  }

  const hourBd = selectedReport?.dateReported;
  const fechaLastReport = selectedReport?.dateReported ?? null;

  const hourReport = safeTimeToLocale(hourBd, "es-SV", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const mostrarPendiente = hora4pm && !esMismaFecha;

  return (
    <div className="flex flex-col p-2">
      <div className="mb-5">
        {!mostrarPendiente ? (
          <div className="flex flex-col md:flex-row justify-center md:justify-between bg-emerald-50 border border-emerald-100 p-5 rounded-xl shadow-sm gap-3 items-center">
            <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
              <div className="rounded-xl bg-emerald-100 p-2 shadow-inner">
                <Check className="size-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-black text-emerald-900 leading-none tracking-tight">
                  Datos actualizados
                </p>
                <p className="text-[11px] font-bold text-emerald-700/70 uppercase tracking-widest mt-1.5">
                  Carga diaria realizada con éxito.
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="w-full rounded-xl bg-emerald-100 p-2 shadow-inner">
                <p className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 text-emerald-700 font-semibold text-xs w-full">
                  <span className="flex gap-1 text-xs font-semibold">
                    <Calendar className="size-4 text-emerald-800" />
                    {safeFormatFullDate(fechaLastReport)}
                  </span>

                  {hourReport && (
                    <span className="flex gap-1 text-xs font-normal">
                      <Clock1 className="size-4 text-emerald-700" />
                      {hourReport}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-center md:justify-between bg-amber-50 border border-amber-100 p-5 rounded-xl shadow-sm gap-3 items-center">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2 shadow-inner">
                <Clock className="size-8 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-900 leading-none tracking-tight">
                  Datos pendientes de actualización
                </p>
                <p className="text-[11px] font-bold text-amber-700/70 uppercase tracking-widest mt-1.5">
                  • Mostrando registros del cierre anterior :{" "}
                  {fechaSV ? formatFullDate(fechaSV) : "Pendiente"}
                </p>
                <p className="text-[11px] font-bold text-amber-700/70 uppercase tracking-widest mt-1.5">
                  • Próxima carga: {formatFullDate(hoySV)}, 4:30 PM - 5:00 PM
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sticky top-0 z-10 backdrop-blur bg-white/90 border-b border-slate-200 rounded-md mb-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-md shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="w-full md:w-auto">
              <p className="text-gray-600 text-sm mb-1">Desde</p>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full md:w-[180px]">
                <Calendar size={16} className="text-slate-400" />
                <input
                  className="bg-transparent text-sm text-slate-600 outline-none w-full"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-auto">
              <p className="text-gray-600 text-sm mb-1">Hasta</p>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full md:w-[180px]">
                <Calendar size={16} className="text-slate-400" />
                <input
                  className="bg-transparent text-sm text-slate-600 outline-none w-full"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row mx-auto md:mx-0 gap-2">
            <div className="inline-flex w-auto mx-auto md:mx-0 gap-3 justify-end bg-slate-100 p-1 rounded-xl border border-slate-200 md:w-auto">
              <button
                type="button"
                onClick={() => setActiveGroup(1)}
                className={[
                  "px-3 py-1.5 text-sm rounded-lg transition cursor-pointer",
                  activeGroup === 1
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-800",
                ].join(" ")}
              >
                Grupo 1
              </button>
              <button
                type="button"
                onClick={() => setActiveGroup(2)}
                className={[
                  "px-3 py-1.5 text-sm rounded-lg transition cursor-pointer",
                  activeGroup === 2
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-800",
                ].join(" ")}
              >
                Grupo 2
              </button>
            </div>
            <div className="hidden w-auto mx-auto md:mx-0 gap-3 justify-end bg-slate-100 p-1 rounded-xl border border-slate-200 md:w-auto">
              <button
                type="button"
                onClick={() => setActiveCategory("Diario")}
                className={[
                  "flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition cursor-pointer",
                  activeCategory === "Diario"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-800",
                ].join(" ")}
              >
                <CalendarDays />
                Diario
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("Acumulado")}
                className={[
                  "flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition cursor-pointer",
                  activeCategory === "Acumulado"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-800",
                ].join(" ")}
              >
                <Layers />
                Acumulado
              </button>
            </div>
          </div>
        </div>
        <div className="relative flex items-center py-4">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink-0 mx-4 text-sm text-gray-500 flex items-center gap-2 px-2">
            {activeCategory === "Diario" ? (
              <CalendarDays />
            ):(
              <Layers />
            )}
            Visualizando accesos: <span className="font-semibold text-gray-900 text-[16px]">{activeCategory}</span>
          </span>
          <div className="grow border-t border-gray-200"></div>
        </div>
      </div>

      <div className="flex justify-evenly my-5 w-full">
        <button
          type="button"
          onClick={() => setActiveView("clases")}
          className={`flex justify-center items-center gap-1 w-full font-semibold p-2 transition-all transform rounded-t-xl border-b-2 ${
            activeView === "clases"
              ? "border-blue-800 text-blue-800"
              : "border-gray-200 hover:text-gray-800 text-gray-400 cursor-pointer"
          }`}
        >
          <BookOpen className="size-5" />
          Clases
        </button>
        <button
          type="button"
          onClick={() => setActiveView("remediacion")}
          className={`flex justify-center items-center gap-1 w-full font-semibold p-2 transition-all transform rounded-t-xl border-b-2 ${
            activeView === "remediacion"
              ? "border-blue-800 text-blue-800"
              : "border-gray-200 hover:text-gray-800 text-gray-400 cursor-pointer"
          }`}
        >
          <ClipboardCheck className="size-5" />
          Remediación
        </button>
        <button
          type="button"
          onClick={() => setActiveView("refuerzo")}
          className={`flex justify-center items-center gap-1 w-full font-semibold p-2 transition-all transform rounded-t-xl border-b-2 ${
            activeView === "refuerzo"
              ? "border-blue-800 text-blue-800"
              : "border-gray-200 hover:text-gray-800 text-gray-400 cursor-pointer"
          }`}
        >
          <Zap className="size-5" />
          Refuerzo
        </button>
      </div>

      {activeView === "clases" && (
        <div>
          <TeacherDashboard
            startDate={startDate}
            endDate={endDate}
            activeGroup={activeGroup}
            activeCategory={activeCategory}
          />
          <StudentDashboard
            startDate={startDate}
            endDate={endDate}
            activeGroup={activeGroup}
            activeCategory={activeCategory}
          />
          <SectionDashboard
            startDate={startDate}
            endDate={endDate}
            activeGroup={activeGroup}
            activeCategory={activeCategory}
          />
        </div>
      )}

      {activeView === "remediacion" && (
        <RemediacionAccess
          startDate={startDate}
          endDate={endDate}
          activeGroup={activeGroup}
          activeCategory={activeCategory}
        />
      )}

      {activeView === "refuerzo" && (
        <RefuerzoAccess
          startDate={startDate}
          endDate={endDate}
          activeGroup={activeGroup}
          activeCategory={activeCategory}
        />
      )}
    </div>
  );
}

export default AccesosDashboard;