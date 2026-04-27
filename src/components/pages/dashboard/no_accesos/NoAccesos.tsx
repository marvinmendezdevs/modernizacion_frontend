import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ClipboardList,
  Users,
  MessageSquareText,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getNoAccesos } from "@/services/metrisc.services";

type ResumenMotivo = {
  motivo: string;
  secciones: number;
  docentesUnicos: number;
};

type ActividadInstitucionalDetalle = {
  motivo: string;
  recuento: number;
};

type NoAccesosJson = {
  noAccesos: {
    resumenMotivos: ResumenMotivo[];
    totalSecciones: number;
    totalDocentesUnicos: number;
  };
  respuestas: {
    total: number;
    actividadInstitucionalDetalle: ActividadInstitucionalDetalle[];
  };
};

type NoAccesosRecord = {
  id: number;
  dateReported: string;
  type: string;
  category: string;
  json: NoAccesosJson;
};

type NoAccesosResponse =
  | {
      mode: "Diario";
      last: NoAccesosRecord | null;
    }
  | {
      mode: "Acumulado";
      records: NoAccesosRecord[];
    };

type PieMotivoData = {
  name: string;
  value: number;
  docentesUnicos: number;
};

type PieRespuestaData = {
  name: string;
  value: number;
};

const PIE_COLORS = [
  "#4F46E5",
  "#06B6D4",
  "#8B5CF6",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#3B82F6",
  "#F97316",
  "#14B8A6",
  "#A855F7",
  "#84CC16",
  "#EC4899",
];

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeRespuestaLabel(value: string) {
  const normalized = normalizeText(value);

  if (
    normalized === "problema de plataforma" ||
    normalized === "problemas de plataforma"
  ) {
    return "Problemas de plataforma";
  }

  if (
    normalized === "problema de equipo" ||
    normalized === "problemas de equipo"
  ) {
    return "Problemas de equipo";
  }

  if (
    normalized === "problema de conectividad" ||
    normalized === "problemas de conectividad"
  ) {
    return "Problemas de conectividad";
  }

  if (normalized === "asignacion incorrecta") return "Asignacion incorrecta";
  if (normalized === "actividad institucional") return "Actividad institucional";
  if (normalized === "incapacidad o permiso") return "Incapacidad o permiso";
  if (normalized === "incapacidad") return "Incapacidad";
  if (normalized === "no corresponde") return "No corresponde";
  if (normalized === "no corresponde al horario") {
    return "No corresponde al horario";
  }
  if (normalized === "problema de correo") return "Problema de correo";
  if (normalized === "uso de cuenta demo") return "Uso de cuenta demo";
  if (normalized === "uso de cuenta de emergencia") {
    return "Uso de cuenta de emergencia";
  }

  return value.trim();
}

function renderPieLabel(props: unknown) {
  const { value = 0 } = props as { value?: number };
  return `${value}`;
}

function NoAccesos() {
  const today = new Date().toLocaleDateString("sv-SE");

  const [category, setCategory] = useState<"Diario" | "Acumulado">("Diario");
  const [selectedDate, setSelectedDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const { data, isLoading, isError } = useQuery<NoAccesosResponse>({
    queryKey: ["no-accesos", category, selectedDate, startDate, endDate],
    queryFn: () =>
      getNoAccesos(
        category === "Acumulado"
          ? { category, startDate, endDate }
          : { category, selectedDate }
      ),
    enabled:
      category === "Acumulado"
        ? Boolean(startDate) && Boolean(endDate)
        : Boolean(selectedDate),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const processedData = useMemo(() => {
    if (!data) {
      return {
        totalSecciones: 0,
        totalDocentesUnicos: 0,
        totalRespuestas: 0,
        resumenMotivos: [] as ResumenMotivo[],
        actividadInstitucionalDetalle: [] as ActividadInstitucionalDetalle[],
      };
    }

    if (data.mode === "Diario") {
      const json = data.last?.json;

      return {
        totalSecciones: json?.noAccesos?.totalSecciones ?? 0,
        totalDocentesUnicos: json?.noAccesos?.totalDocentesUnicos ?? 0,
        totalRespuestas: json?.respuestas?.total ?? 0,
        resumenMotivos: json?.noAccesos?.resumenMotivos ?? [],
        actividadInstitucionalDetalle:
          json?.respuestas?.actividadInstitucionalDetalle ?? [],
      };
    }

    const resumenMap = new Map<
      string,
      { motivo: string; secciones: number; docentesUnicos: number }
    >();

    const respuestasMap = new Map<string, { motivo: string; recuento: number }>();

    let totalSecciones = 0;
    let totalDocentesUnicos = 0;

    for (const record of data.records) {
      const json = record.json;

      totalSecciones += json?.noAccesos?.totalSecciones ?? 0;
      totalDocentesUnicos += json?.noAccesos?.totalDocentesUnicos ?? 0;

      for (const item of json?.noAccesos?.resumenMotivos ?? []) {
        const key = normalizeText(item.motivo);
        const current = resumenMap.get(key);

        if (!current) {
          resumenMap.set(key, {
            motivo: item.motivo.trim(),
            secciones: item.secciones ?? 0,
            docentesUnicos: item.docentesUnicos ?? 0,
          });
        } else {
          resumenMap.set(key, {
            motivo: current.motivo,
            secciones: current.secciones + (item.secciones ?? 0),
            docentesUnicos: current.docentesUnicos + (item.docentesUnicos ?? 0),
          });
        }
      }

      for (const item of json?.respuestas?.actividadInstitucionalDetalle ?? []) {
        const normalizedLabel = normalizeRespuestaLabel(item.motivo);
        const key = normalizeText(normalizedLabel);
        const current = respuestasMap.get(key);

        if (!current) {
          respuestasMap.set(key, {
            motivo: normalizedLabel,
            recuento: item.recuento ?? 0,
          });
        } else {
          respuestasMap.set(key, {
            motivo: current.motivo,
            recuento: current.recuento + (item.recuento ?? 0),
          });
        }
      }
    }

    const resumenMotivos = Array.from(resumenMap.values()).sort(
      (a, b) => b.secciones - a.secciones
    );

    const actividadInstitucionalDetalle = Array.from(respuestasMap.values()).sort(
      (a, b) => b.recuento - a.recuento
    );

    const totalRespuestas = actividadInstitucionalDetalle.reduce(
      (acc, item) => acc + item.recuento,
      0
    );

    return {
      totalSecciones,
      totalDocentesUnicos,
      totalRespuestas,
      resumenMotivos,
      actividadInstitucionalDetalle,
    };
  }, [data]);

  const {
    totalSecciones,
    totalDocentesUnicos,
    totalRespuestas,
    resumenMotivos,
    actividadInstitucionalDetalle,
  } = processedData;

  const pieData = useMemo<PieMotivoData[]>(() => {
    return resumenMotivos.map((item) => ({
      name: item.motivo,
      value: item.secciones,
      docentesUnicos: item.docentesUnicos,
    }));
  }, [resumenMotivos]);

  const pieRespuestasData = useMemo<PieRespuestaData[]>(() => {
    return actividadInstitucionalDetalle.map((item) => ({
      name: item.motivo,
      value: item.recuento,
    }));
  }, [actividadInstitucionalDetalle]);

  const hasData =
    resumenMotivos.length > 0 || actividadInstitucionalDetalle.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Seguimiento de no accesos
              </h1>

              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Visualiza los motivos reportados, el total de secciones afectadas
                y el detalle de respuestas relacionadas con la campaña.
              </p>
            </div>

            <div className="flex w-full max-w-md flex-col gap-3">
              <label className="text-sm font-medium text-slate-700">
                Tipo de consulta
              </label>

              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setCategory("Diario")}
                  className={`w-full rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    category === "Diario"
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  Diario
                </button>

                <button
                  type="button"
                  onClick={() => setCategory("Acumulado")}
                  className={`w-full rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    category === "Acumulado"
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  Acumulado
                </button>
              </div>

              {category === "Diario" ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    Filtrar por fecha
                  </label>
                  <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
                    <CalendarDays className="size-4 text-slate-500" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-700 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">
                      Fecha inicio
                    </label>
                    <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
                      <CalendarDays className="size-4 text-slate-500" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-transparent text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">
                      Fecha fin
                    </label>
                    <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
                      <CalendarDays className="size-4 text-slate-500" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-transparent text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
            Cargando datos...
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-600 shadow-sm">
            Ocurrió un error al cargar los datos.
          </div>
        ) : !hasData ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
            No hay datos para la consulta seleccionada.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-indigo-200 bg-indigo-600 p-5 text-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-indigo-100">Total de secciones</p>
                    <h2 className="mt-3 text-3xl font-bold">
                      {totalSecciones}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <ClipboardList className="size-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-200 bg-cyan-600 p-5 text-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-cyan-100">
                      Total de docentes únicos
                    </p>
                    <h2 className="mt-3 text-3xl font-bold">
                      {totalDocentesUnicos}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Users className="size-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-violet-200 bg-violet-600 p-5 text-white shadow-sm md:col-span-2 xl:col-span-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-violet-100">
                      Total de respuestas
                    </p>
                    <h2 className="mt-3 text-3xl font-bold">
                      {totalRespuestas}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <MessageSquareText className="size-6" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Gestión de no accesos
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Comparativo y distribución de los motivos reportados.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                    <ResponsiveContainer width="100%" height={360}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={115}
                          paddingAngle={2}
                          labelLine={false}
                          label={renderPieLabel}
                        >
                          {pieData.map((_, index) => (
                            <Cell
                              key={`motivo-cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value, name) => [
                            `${value} secciones`,
                            name,
                          ]}
                        />

                        <Legend
                          verticalAlign="bottom"
                          height={48}
                          formatter={(value) => (
                            <span className="text-sm text-slate-600">
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Respuestas de campaña
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Comparativo y distribución de respuestas registradas.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                    <ResponsiveContainer width="100%" height={360}>
                      <PieChart>
                        <Pie
                          data={pieRespuestasData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={115}
                          paddingAngle={4}
                          labelLine={false}
                          label={renderPieLabel}
                        >
                          {pieRespuestasData.map((_, index) => (
                            <Cell
                              key={`respuesta-cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value, name) => [
                            `${value} respuestas`,
                            name,
                          ]}
                        />

                        <Legend
                          verticalAlign="bottom"
                          height={48}
                          formatter={(value) => (
                            <span className="text-sm text-slate-600">
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NoAccesos;
