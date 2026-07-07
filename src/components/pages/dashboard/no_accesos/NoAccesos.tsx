import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ClipboardList,
  Users,
  MessageSquareText,
  BookOpen,
  UserCheck,
  GraduationCap,
  Laptop,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getNoAccesos } from "@/services/metrisc.services";
import { getSeccionClasses } from "@/services/dashboard.services";

type ResumenMotivo = {
  motivo: string;
  secciones: number;
  docentesUnicos: number;
};

type DetailItem = {
  grupo: number;
  tasaPresenciaDocente: number;
  tasaPresenciaDocenteTotal: number;
  tasaPresenciaEstudiante: number;
  tasaPresenciaEstudianteTotal: number;
  logroAcademico: number;
  logroAcademicoTotal: number;
  recursosDigitales: number;
  recursosDigitalesTotal: number;
  tasaAccesosDocentesASecciones?: number;
  tasaAccesosDocentesASeccionesTotal?: number;
};

type SeccionesJson = {
  clases?: {
    details?: DetailItem[];
  };
};

type MetricsRecord = {
  id: number;
  dateReported: string;
  type: string;
  category: string;
  json: SeccionesJson;
};

type SeccionesApiResponse = {
  last: MetricsRecord | null;
  cumulative: MetricsRecord[];
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
  rawValue: number;
  docentesUnicos: number;
};

type PieRespuestaData = {
  name: string;
  value: number;
  rawValue: number;
};

type TooltipPayloadItem = {
  payload?: {
    name?: string;
    rawValue?: number;
    docentesUnicos?: number;
  };
};

type CustomPieTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  rawLabel: string;
  showDocentes?: boolean;
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
  "#818CF8", 
  "#22D3EE", 
  "#A78BFA", 
  "#FBBF24", 
  "#34D399", 
  "#F87171", 
  "#60A5FA", 
  "#FB923C", 
  "#2DD4BF", 
  "#C084FC", 
  "#A3E635", 
  "#F472B6"
];

const RADIAN = Math.PI / 180;

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
  if (normalized === "actividad institucional")
    return "Actividad institucional";
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

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function renderPieLabel(props: any) {
  const { cx, cy, midAngle, outerRadius, value, index } = props;
  const radius = outerRadius + (index % 2 === 0 ? 30 : 70);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const lx = cx + outerRadius * Math.cos(-midAngle * RADIAN);
  const ly = cy + outerRadius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <line x1={lx} y1={ly} x2={x} y2={y} stroke="#94a3b8" strokeWidth={1} />
      <text
        x={x}
        y={y}
        fill="#475569"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-[14px] font-bold"
      >
        {formatPercent(value)}
      </text>
    </g>
  );
}

function CustomPieTooltip({
  active,
  payload,
  rawLabel,
  showDocentes = false,
}: CustomPieTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;

  if (!item) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{item.name}</p>

      <p className="mt-1 text-sm text-slate-600">
        {rawLabel}:{" "}
        <span className="font-semibold text-slate-900">
          {(item.rawValue ?? 0).toLocaleString("en-US")}
        </span>
      </p>

      {showDocentes && (
        <p className="text-sm text-slate-600">
          Docentes únicos:{" "}
          <span className="font-semibold text-slate-900">
            {(item.docentesUnicos ?? 0).toLocaleString("en-US")}
          </span>
        </p>
      )}
    </div>
  );
}

function calcularPorcentaje(valor: number, total: number) {
  if (total === 0) return 0;
  return (valor / total) * 100;
}

function normalizeDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function limitarPorcentaje(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}

function truncarDosDecimales(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.trunc(value * 100) / 100;
}

function calcularFaltanteVisual(value: number) {
  const porcentajeSeccionesMostrado = truncarDosDecimales(
    limitarPorcentaje(value),
  );

  return Number((100 - porcentajeSeccionesMostrado).toFixed(2));
}

function formatNoAccesoPercent(value: number) {
  if (!Number.isFinite(value)) return "0.00%";
  return `${limitarPorcentaje(value).toFixed(2)}%`;
}

function sumarDetailItems(items: DetailItem[]): DetailItem {
  return items.reduce(
    (acc, item) => ({
      grupo: 0,
      tasaPresenciaDocente:
        acc.tasaPresenciaDocente + (item.tasaPresenciaDocente ?? 0),
      tasaPresenciaDocenteTotal:
        acc.tasaPresenciaDocenteTotal + (item.tasaPresenciaDocenteTotal ?? 0),
      tasaPresenciaEstudiante:
        acc.tasaPresenciaEstudiante + (item.tasaPresenciaEstudiante ?? 0),
      tasaPresenciaEstudianteTotal:
        acc.tasaPresenciaEstudianteTotal +
        (item.tasaPresenciaEstudianteTotal ?? 0),
      logroAcademico: acc.logroAcademico + (item.logroAcademico ?? 0),
      logroAcademicoTotal:
        acc.logroAcademicoTotal + (item.logroAcademicoTotal ?? 0),
      recursosDigitales: acc.recursosDigitales + (item.recursosDigitales ?? 0),
      recursosDigitalesTotal:
        acc.recursosDigitalesTotal + (item.recursosDigitalesTotal ?? 0),
      tasaAccesosDocentesASecciones:
        (acc.tasaAccesosDocentesASecciones ?? 0) +
        (item.tasaAccesosDocentesASecciones ?? 0),
      tasaAccesosDocentesASeccionesTotal:
        (acc.tasaAccesosDocentesASeccionesTotal ?? 0) +
        (item.tasaAccesosDocentesASeccionesTotal ?? 0),
    }),
    {
      grupo: 0,
      tasaPresenciaDocente: 0,
      tasaPresenciaDocenteTotal: 0,
      tasaPresenciaEstudiante: 0,
      tasaPresenciaEstudianteTotal: 0,
      logroAcademico: 0,
      logroAcademicoTotal: 0,
      recursosDigitales: 0,
      recursosDigitalesTotal: 0,
      tasaAccesosDocentesASecciones: 0,
      tasaAccesosDocentesASeccionesTotal: 0,
    },
  );
}

function NoAccesos() {
  const [category, setCategory] = useState<"Diario" | "Acumulado">("Diario");
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, isError } = useQuery<NoAccesosResponse>({
    queryKey: ["no-accesos", category, selectedDate, startDate, endDate],
    queryFn: () =>
      getNoAccesos(
        category === "Acumulado"
          ? { category, startDate, endDate }
          : { category, selectedDate },
      ),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: seccionData } = useQuery<SeccionesApiResponse>({
    queryKey: [
      "dashboard-secciones-no-accesos",
      category,
      selectedDate,
      startDate,
      endDate,
    ],
    queryFn: () =>
      getSeccionClasses(
        category === "Acumulado" ? endDate || selectedDate : selectedDate,
      ),
    enabled: category === "Acumulado" ? Boolean(endDate) : true,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data && data.mode === "Diario" && data.last && !selectedDate) {
      const date = normalizeDate(data.last.dateReported);
      setSelectedDate(date);
      setStartDate(date);
      setEndDate(date);
    }
  }, [data, selectedDate]);

  const seccionMetrics = useMemo(() => {
    if (!seccionData) return null;

    const orderedRecords = [
      ...(seccionData.last ? [seccionData.last] : []),
      ...(seccionData.cumulative ?? []),
    ].sort(
      (a, b) =>
        new Date(b.dateReported).getTime() -
        new Date(a.dateReported).getTime(),
    );

    const recordsToUse =
      category === "Diario"
        ? orderedRecords.filter(
            (record) => normalizeDate(record.dateReported) === selectedDate,
          )
        : orderedRecords.filter((record) => {
            const recordDate = normalizeDate(record.dateReported);
            return recordDate >= startDate && recordDate <= endDate;
          });

    const details = recordsToUse.flatMap(
      (record) => record.json?.clases?.details ?? [],
    );

    if (details.length === 0) return null;

    const detailsGruposUnoYDos = details.filter((item) =>
      [1, 2].includes(item.grupo),
    );

    if (detailsGruposUnoYDos.length === 0) return null;

    const summed = sumarDetailItems(detailsGruposUnoYDos);

    const hasTasaAccesosDocentesASecciones = detailsGruposUnoYDos.some(
      (item) =>
        Object.prototype.hasOwnProperty.call(
          item,
          "tasaAccesosDocentesASecciones",
        ) &&
        Object.prototype.hasOwnProperty.call(
          item,
          "tasaAccesosDocentesASeccionesTotal",
        ),
    );

    const presenciaDocente = calcularPorcentaje(
      summed.tasaPresenciaDocente,
      summed.tasaPresenciaDocenteTotal,
    );

    const presenciaEstudiante = calcularPorcentaje(
      summed.tasaPresenciaEstudiante,
      summed.tasaPresenciaEstudianteTotal,
    );

    const logroAcademico = calcularPorcentaje(
      summed.logroAcademico,
      summed.logroAcademicoTotal,
    );

    const recursosDigitales = calcularPorcentaje(
      summed.recursosDigitales,
      summed.recursosDigitalesTotal,
    );

    const tasaAccesosDocentesASecciones = calcularPorcentaje(
      summed.tasaAccesosDocentesASecciones ?? 0,
      summed.tasaAccesosDocentesASeccionesTotal ?? 0,
    );

    const promedioClasesEfectivas =
      (presenciaDocente +
        presenciaEstudiante +
        logroAcademico +
        recursosDigitales) /
      4;

    return {
      clasesEfectivas: calcularFaltanteVisual(promedioClasesEfectivas),
      presenciaDocente: calcularFaltanteVisual(presenciaDocente),
      presenciaEstudiante: calcularFaltanteVisual(presenciaEstudiante),
      logroAcademico: calcularFaltanteVisual(logroAcademico),
      recursosDigitales: calcularFaltanteVisual(recursosDigitales),
      tasaAccesosDocentesASecciones: calcularFaltanteVisual(
        tasaAccesosDocentesASecciones,
      ),
      hasTasaAccesosDocentesASecciones,
      tasaAccesosDocentesASeccionesTotal:
        summed.tasaAccesosDocentesASeccionesTotal ?? 0,
    };
  }, [seccionData, selectedDate, startDate, endDate, category]);

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
      (a, b) => b.secciones - a.secciones,
    );

    const actividadInstitucionalDetalle = Array.from(
      respuestasMap.values(),
    ).sort((a, b) => b.recuento - a.recuento);

    const totalRespuestas = actividadInstitucionalDetalle.reduce(
      (acc, item) => acc + item.recuento,
      0,
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
    const total = resumenMotivos.reduce(
      (acc, item) => acc + (item.secciones ?? 0),
      0,
    );

    if (total === 0) return [];

    return resumenMotivos
      .filter((item) => (item.secciones ?? 0) > 0)
      .map((item) => ({
        name: item.motivo,
        value: calcularPorcentaje(item.secciones, total),
        rawValue: item.secciones ?? 0,
        docentesUnicos: item.docentesUnicos,
      }));
  }, [resumenMotivos]);

  const pieRespuestasData = useMemo<PieRespuestaData[]>(() => {
    const total = actividadInstitucionalDetalle.reduce(
      (acc, item) => acc + (item.recuento ?? 0),
      0,
    );

    if (total === 0) return [];

    return actividadInstitucionalDetalle
      .filter((item) => (item.recuento ?? 0) > 0)
      .map((item) => ({
        name: item.motivo,
        value: calcularPorcentaje(item.recuento, total),
        rawValue: item.recuento,
      }));
  }, [actividadInstitucionalDetalle]);

  const hasGestionNoAccesosChart = pieData.length > 0;
  const hasRespuestasCampaniaChart = pieRespuestasData.length > 0;

  const porcentajeNoAccesosDocentesASecciones =
    seccionMetrics?.tasaAccesosDocentesASecciones ?? 0;

  const hasData =
    totalSecciones > 0 ||
    totalDocentesUnicos > 0 ||
    totalRespuestas > 0 ||
    Boolean(seccionMetrics) ||
    hasGestionNoAccesosChart ||
    hasRespuestasCampaniaChart;

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
                Visualiza los motivos reportados, el total de secciones
                afectadas y el detalle de respuestas relacionadas con la
                campaña.
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
                    <p className="text-sm text-indigo-100">
                      Total de secciones
                    </p>
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

            {seccionMetrics && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {seccionMetrics.hasTasaAccesosDocentesASecciones && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <UserCheck size={16} />
                      <p className="text-xs font-medium">
                        Tasa de secciones no ejecutadas
                      </p>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-red-700">
                      -
                      {formatNoAccesoPercent(
                        porcentajeNoAccesosDocentesASecciones,
                      )}
                    </p>

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {totalSecciones.toLocaleString("en-US")} de{" "}
                      {seccionMetrics.tasaAccesosDocentesASeccionesTotal.toLocaleString(
                        "en-US",
                      )}
                    </p>
                  </div>
                )}

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <BookOpen size={16} />
                    <p className="text-xs font-medium">Clases efectivas</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-red-700">
                    -{formatNoAccesoPercent(seccionMetrics.clasesEfectivas)}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <UserCheck size={16} />
                    <p className="text-xs font-medium">Presencia docentes</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-red-700">
                    -{formatNoAccesoPercent(seccionMetrics.presenciaDocente)}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users size={16} />
                    <p className="text-xs font-medium">Presencia estudiantes</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-red-700">
                    -{formatNoAccesoPercent(seccionMetrics.presenciaEstudiante)}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <GraduationCap size={16} />
                    <p className="text-xs font-medium">Logro académico</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-red-700">
                    -{formatNoAccesoPercent(seccionMetrics.logroAcademico)}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Laptop size={16} />
                    <p className="text-xs font-medium">Recursos digitales</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-red-700">
                    -{formatNoAccesoPercent(seccionMetrics.recursosDigitales)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-6">
              {hasGestionNoAccesosChart && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-xl font-semibold text-slate-900">
                      Gestión de no accesos por secciones
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Comparativo y distribución de los motivos reportados.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <ResponsiveContainer width="100%" height={700}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={220}
                            minAngle={2}
                            paddingAngle={0}
                            labelLine={true}
                            label={renderPieLabel}
                          >
                            {pieData.map((_, index) => (
                              <Cell
                                key={`motivo-cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                stroke= {PIE_COLORS[index % PIE_COLORS.length]}
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => (
                              <CustomPieTooltip
                                active={active}
                                payload={payload as TooltipPayloadItem[]}
                                rawLabel="Total"
                              />
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {hasRespuestasCampaniaChart && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-xl font-semibold text-slate-900">
                      Justificación por número de docentes 
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Comparativo y distribución de respuestas registradas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <ResponsiveContainer width="100%" height={700}>
                        <PieChart>
                          <Pie
                            data={pieRespuestasData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={220}
                            minAngle={2}
                            paddingAngle={0}
                            labelLine={true}
                            label={renderPieLabel}
                          >
                            {pieRespuestasData.map((_, index) => (
                              <Cell
                                key={`respuesta-cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                stroke= {PIE_COLORS[index % PIE_COLORS.length]}
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>

                          <Tooltip
                            content={({ active, payload }) => (
                              <CustomPieTooltip
                                active={active}
                                payload={payload as TooltipPayloadItem[]}
                                rawLabel="Recuento"
                              />
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NoAccesos;