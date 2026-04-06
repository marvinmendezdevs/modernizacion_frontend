import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Phone,
  MessageSquare,
  ClipboardCheck,
  Layers,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { getGestionEscolar } from "@/services/dashboard.services";
import { formatFullDate } from "@/utils/index.utils";
import GestionEscolarGrafics from "./GestionEscolarGrafics";

type ApiGestionItem = {
  escuela: number;
  llamada: number;
  whatsApp: number;
  gestionPorCE: number;
  totalGestiones: number;
  seguimientoDeIncidencias: number;
};

type ApiInconsistenciaItem = {
  accion: string;
  cantidad: number;
};

type ApiMetricRecord = {
  dateReported?: string;
  json?: {
    registros?: ApiGestionItem[];
    inconsistencias?: ApiInconsistenciaItem[];
  };
};

type GestionRow = {
  id: number;
  unidad: string;
  escuelas: number;
  llamadas: number;
  whatsapp: number;
  gestionCE: number;
  seguimiento: number;
  total: number;
};

type CategoryTab = "Diario" | "Acumulado";

const safePct = (value: number, total: number) => {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(1));
};

function formatDate(date: Date) {
  return date.toLocaleDateString("sv-SE");
}

function getWeekStringFromDate(date: Date) {
  const tempDate = new Date(date);
  tempDate.setHours(0, 0, 0, 0);

  const day = tempDate.getDay() || 7;
  tempDate.setDate(tempDate.getDate() + 4 - day);

  const yearStart = new Date(tempDate.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    (((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
  );

  return `${tempDate.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getStartAndEndFromWeek(weekValue: string) {
  const [yearPart, weekPart] = weekValue.split("-W");

  const year = Number(yearPart);
  const week = Number(weekPart);

  const firstDayOfYear = new Date(year, 0, 1);
  const dayOffset = firstDayOfYear.getDay() || 7;

  const monday = new Date(firstDayOfYear);
  monday.setDate(firstDayOfYear.getDate() + (week - 1) * 7 - (dayOffset - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    startDate: formatDate(monday),
    endDate: formatDate(sunday),
  };
}

function StatCard({
  title,
  value,
  percentage,
  icon,
  iconBg,
}: {
  title: string;
  value: number;
  percentage?: number;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-semibold text-slate-900">{value}</h3>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${iconBg}`}
        >
          {icon}
        </div>
      </div>

      {percentage !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-end text-sm font-semibold">
            <span className="text-indigo-600">{percentage}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GestionDashboardPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("Diario");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<string>(
    getWeekStringFromDate(new Date())
  );
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  const { startDate, endDate } = useMemo(() => {
    return getStartAndEndFromWeek(selectedWeek);
  }, [selectedWeek]);

  const { isLoading, isError, data, isFetching } = useQuery({
    queryKey: [
      "dashboard-school-management",
      activeCategory,
      selectedDate,
      selectedWeek,
      startDate,
      endDate,
    ],
    queryFn: () =>
      getGestionEscolar({
        category: activeCategory,
        selectedDate: activeCategory === "Diario" ? selectedDate : undefined,
        startDate: activeCategory === "Acumulado" ? startDate : undefined,
        endDate: activeCategory === "Acumulado" ? endDate : undefined,
      }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const last = useMemo<ApiMetricRecord | null>(
    () => data?.data?.last ?? null,
    [data?.data?.last]
  );

  const inputDateValue = selectedDate || last?.dateReported?.slice(0, 10) || "";

  const rawRows = useMemo<ApiGestionItem[]>(() => {
  if (!last?.json) return [];

  if (Array.isArray(last.json)) {
    return last.json;
  }

  return last.json.registros ?? [];
}, [last]);

const rows: GestionRow[] = useMemo(() => {
  if (!rawRows.length) return [];

  return rawRows.map((item, index) => ({
    id: index + 1,
    unidad: String(index + 1),
    escuelas: item.escuela ?? 0,
    llamadas: item.llamada ?? 0,
    whatsapp: item.whatsApp ?? 0,
    gestionCE: item.gestionPorCE ?? 0,
    seguimiento: item.seguimientoDeIncidencias ?? 0,
    total: item.totalGestiones ?? 0,
  }));
}, [rawRows]);

  const inconsistencias: ApiInconsistenciaItem[] = useMemo(() => {
    return last?.json?.inconsistencias ?? [];
  }, [last]);

const totals = useMemo(() => {
  return rows.reduce(
    (acc, row) => {
      acc.escuelas += row.escuelas;
      acc.llamadas += row.llamadas;
      acc.whatsapp += row.whatsapp;
      acc.gestionCE += row.gestionCE;
      acc.seguimiento += row.seguimiento;
      acc.total += row.total;
      return acc;
    },
    {
      escuelas: 0,
      llamadas: 0,
      whatsapp: 0,
      gestionCE: 0,
      seguimiento: 0,
      total: 0,
    }
  );
}, [rows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return rows.slice(start, end);
  }, [rows, currentPage]);

  const startItem =
    rows.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, rows.length);

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: CategoryTab) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="font-semibold text-slate-700">
            Cargando métricas de gestión...
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-2xl border border-red-200 bg-white px-6 py-4 font-semibold text-red-600 shadow-sm">
          Ocurrió un error al cargar la gestión escolar.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-6 md:grid-cols-[1.5fr_auto] md:p-8">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">
                Gestión Escolar
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Consulta la actividad registrada por fecha y visualiza el
                comportamiento general de llamadas, WhatsApp, gestión por CE y
                seguimiento de incidencias.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3">
              <div className="flex w-auto mx-auto md:mx-0 gap-3 justify-center bg-slate-100 p-1 rounded-xl border border-slate-200 md:w-auto">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("Diario")}
                  className={[
                    "flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition cursor-pointer",
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
                  onClick={() => handleCategoryChange("Acumulado")}
                  className={[
                    "flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition cursor-pointer",
                    activeCategory === "Acumulado"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-800",
                  ].join(" ")}
                >
                  <Layers />
                  Acumulado
                </button>
              </div>

              <p>
                {activeCategory === "Diario"
                  ? "Filtrar por fecha:"
                  : "Filtrar por semana:"}
              </p>

              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Calendar />
                </div>

                {activeCategory === "Diario" ? (
                  <input
                    type="date"
                    value={inputDateValue}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                  />
                ) : (
                  <input
                    className="bg-transparent text-sm text-slate-600 outline-none w-full"
                    type="week"
                    value={selectedWeek}
                    onChange={(e) => {
                      setSelectedWeek(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                )}
              </div>

              {activeCategory === "Acumulado" && (
                <div className="text-xs text-slate-500">
                  Rango consultado: <strong>{startDate}</strong> al{" "}
                  <strong>{endDate}</strong>
                </div>
              )}

              {activeCategory === "Diario" && (
                <div className="flex w-full">
                  <p className="text-xs bg-green-600 p-1 rounded-lg text-green-900 w-full text-center">
                    <span className="text-white font-semibold">
                      {last?.dateReported
                        ? formatFullDate(last.dateReported)
                        : "Sin registro"}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center text-xs font-semibold text-slate-400">
                {isFetching && (
                  <span className="inline-flex items-center gap-2 text-indigo-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Actualizando...
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Escuelas"
            value={totals.escuelas}
            icon={<Layers className="h-6 w-6" />}
            iconBg="bg-slate-800"
          />

          <StatCard
            title="Llamadas"
            value={totals.llamadas}
            percentage={
              activeCategory === "Diario"
                ? safePct(totals.llamadas, totals.escuelas)
                : undefined
            }
            icon={<Phone className="h-6 w-6" />}
            iconBg="bg-blue-600"
          />

          <StatCard
            title="WhatsApp"
            value={totals.whatsapp}
            percentage={
              activeCategory === "Diario"
                ? safePct(totals.whatsapp, totals.escuelas)
                : undefined
            }
            icon={<MessageSquare className="h-6 w-6" />}
            iconBg="bg-green-600"
          />

          <StatCard
            title="Gestión por CE"
            value={totals.gestionCE}
            percentage={
              activeCategory === "Diario"
                ? safePct(totals.gestionCE, totals.escuelas)
                : undefined
            }
            icon={<ClipboardCheck className="h-6 w-6" />}
            iconBg="bg-indigo-600"
          />
        </section>

        <section>
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Registros de actividad
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  Desglose de métricas por registro.
                </p>
              </div>

              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                {rows.length} registros
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Registro
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Escuelas
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Llamadas
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      WhatsApp
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Gestión por CE
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Seguimiento
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {row.unidad}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">
                          {row.escuelas}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">
                          {row.llamadas}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">
                          {row.whatsapp}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">
                          {row.gestionCE}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">
                          {row.seguimiento}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-900">
                          {row.total}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-sm font-medium text-slate-500"
                      >
                        No hay registros para el filtro seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-medium text-slate-500">
                Mostrando {startItem} a {endItem} de {rows.length} registros
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
        {data.data.last !== null && (
          <section className="bg-white border rounded-lg border-gray-200 shadow p-2">
            <GestionEscolarGrafics inconsistencias={inconsistencias} />
          </section>
        )}
      </div>
    </div>
  );
}

export default GestionDashboardPage;