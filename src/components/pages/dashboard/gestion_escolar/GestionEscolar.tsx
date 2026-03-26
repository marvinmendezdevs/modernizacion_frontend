import{ useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Phone,
  MessageSquare,
  ClipboardCheck,
  TrendingUp,
  Layers,
  CheckCircle2,
  FileText,
  Loader2,
  CalendarDays,
  Filter,
} from "lucide-react";
import { getGestionEscolar } from "@/services/dashboard.services";

type ApiGestionItem = {
  escuela: number;
  llamada: number;
  whatsApp: number;
  gestionPorCE: number;
  totalGestiones: number;
  seguimientoDeIncidencias: number;
};

type DashboardGestionResponse = {
  status: string;
  data: {
    last: {
      id: number;
      dateReported: string;
      type: string;
      category: string;
      json: ApiGestionItem[];
    } | null;
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

const getTodayDate = () => new Date().toLocaleDateString("sv-SE");

const formatDate = (date?: string) => {
  if (!date) return "Sin fecha";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("es-SV", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const safePct = (value: number, total: number) => {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(1));
};

function GestionDashboard() {
  const [startDate, setStartDate] = useState(getTodayDate());
  const [filterDate, setFilterDate] = useState(getTodayDate());

  const { isLoading, isError, data, isFetching } =
    useQuery<DashboardGestionResponse>({
      queryKey: ["dashboard-school-management", filterDate],
      queryFn: () => getGestionEscolar(filterDate),
      retry: false,
      refetchOnWindowFocus: false,
    });

  const last = data?.data?.last ?? null;
  const rawRows = last?.json ?? [];

  const rows: GestionRow[] = useMemo(() => {
    if (!rawRows.length) return [];

    return rawRows.map((item, index) => ({
      id: index + 1,
      unidad: (index + 1).toString().padStart(3, "0"),
      escuelas: item.escuela ?? 0,
      llamadas: item.llamada ?? 0,
      whatsapp: item.whatsApp ?? 0,
      gestionCE: item.gestionPorCE ?? 0,
      seguimiento: item.seguimientoDeIncidencias ?? 0,
      total: item.totalGestiones ?? 0,
    }));
  }, [rawRows]);

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

  const channelBars = [
    {
      label: "Gestión Directa por CE",
      pct: safePct(totals.gestionCE, totals.escuelas),
      color: "bg-indigo-600",
    },
    {
      label: "Atención Telefónica",
      pct: safePct(totals.llamadas, totals.escuelas),
      color: "bg-blue-600",
    },
    {
      label: "Mensajería WhatsApp",
      pct: safePct(totals.whatsapp, totals.escuelas),
      color: "bg-cyan-600",
    },
  ];

  const dominantChannel = useMemo(() => {
    const channels = [
      { label: "Gestión CE", value: totals.gestionCE },
      { label: "Llamadas", value: totals.llamadas },
      { label: "WhatsApp", value: totals.whatsapp },
    ];

    return channels.sort((a, b) => b.value - a.value)[0] ?? {
      label: "Sin datos",
      value: 0,
    };
  }, [totals]);

  const handleFilter = () => {
    setFilterDate(startDate);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-10 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-700 font-bold">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando métricas de gestión...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-10 flex items-center justify-center">
        <div className="bg-white border border-red-200 text-red-600 px-6 py-4 rounded-2xl shadow-sm font-semibold">
          Ocurrió un error al cargar la gestión escolar.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto mb-10 border-b border-gray-200 pb-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                Métricas de Gestión
              </h1>
              <p className="text-gray-500 font-medium">
                Visualización de incidencias por volumen de escuelas
              </p>

              <div className="mt-4 inline-flex items-center rounded-xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
                Fecha del reporte: {formatDate(last?.dateReported ?? filterDate)}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2">
                <FileText className="w-4 h-4" /> Exportar PDF
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <CalendarDays className="w-4 h-4" />
                  Filtrar por fecha
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleFilter}
                  disabled={isFetching}
                  className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isFetching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Filter className="w-4 h-4" />
                  )}
                  Filtrar por fecha
                </button>
              </div>
            </div>

            <div className="mt-3 text-xs font-semibold text-gray-500">
              Mostrando datos para: {formatDate(filterDate)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-slate-700 p-3 rounded-xl text-white">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Total Escuelas
            </p>
          </div>
          <span className="text-3xl font-black text-slate-900">
            {totals.escuelas}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl text-white">
              <Phone className="w-6 h-6" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Llamadas
            </p>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              {totals.llamadas}
            </span>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {safePct(totals.llamadas, totals.escuelas)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-cyan-600 p-3 rounded-xl text-white">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              WhatsApp
            </p>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              {totals.whatsapp}
            </span>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {safePct(totals.whatsapp, totals.escuelas)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-indigo-600 p-3 rounded-xl text-white">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Gestión por CE
            </p>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              {totals.gestionCE}
            </span>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {safePct(totals.gestionCE, totals.escuelas)}%
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-gray-50/50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
            Registros de Actividad
          </h2>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Fecha filtrada
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Fila / ID
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                  Escuelas
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                  Llamadas
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                  WhatsApp
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                  Gestión CE
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                  Seguimiento
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Total Gestión
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-8 py-4 font-bold text-gray-400"># {row.unidad}</td>
                    <td className="px-6 py-4 text-center">{row.escuelas}</td>
                    <td className="px-6 py-4 text-center">{row.llamadas}</td>
                    <td className="px-6 py-4 text-center">{row.whatsapp}</td>
                    <td className="px-6 py-4 text-center">{row.gestionCE}</td>
                    <td className="px-6 py-4 text-center">{row.seguimiento}</td>
                    <td className="px-8 py-4 text-right font-black text-indigo-600">
                      {row.total}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-10 text-center text-sm font-semibold text-gray-400">
                    No hay datos para la fecha seleccionada.
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot className="bg-slate-900 text-white">
              <tr>
                <td className="px-8 py-6 font-black uppercase text-xs tracking-widest">Totales</td>
                <td className="px-6 py-6 text-center font-black text-xl">{totals.escuelas}</td>
                <td className="px-6 py-6 text-center font-black text-xl">{totals.llamadas}</td>
                <td className="px-6 py-6 text-center font-black text-xl">{totals.whatsapp}</td>
                <td className="px-6 py-6 text-center font-black text-xl">{totals.gestionCE}</td>
                <td className="px-6 py-6 text-center font-black text-xl">{totals.seguimiento}</td>
                <td className="px-8 py-6 text-right font-black text-2xl">{totals.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-8 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Distribución de Canales
          </h3>

          <div className="space-y-6">
            {channelBars.map((bar, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">{bar.label}</span>
                  <span className="text-xs font-black text-slate-800">{bar.pct}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full">
                  <div
                    className={`h-full ${bar.color} rounded-full`}
                    style={{ width: `${Math.min(bar.pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl text-white flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">
              Conclusión del Periodo
            </p>
            <h3 className="text-2xl font-black mb-4">
              Dominio de {dominantChannel.label}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              El canal con mayor volumen fue{" "}
              <span className="font-bold text-white">{dominantChannel.label}</span>,
              representando el{" "}
              <span className="font-bold text-white">
                {safePct(dominantChannel.value, totals.escuelas)}%
              </span>.
            </p>

            <div className="inline-flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Datos procesados correctamente
            </div>
          </div>

          <BarChart3 className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-[0.03]" />
        </div>
      </div>
    </div>
  );
}

export default GestionDashboard;