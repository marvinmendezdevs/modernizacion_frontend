import { getSeccionClasses } from "@/services/dashboard.services";
import { formatFullDate } from "@/utils/index.utils";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type MateriaNombre = "Matemática" | "Lenguaje";

type Indicador = {
  valor: number;
  total: number;
};

type Materia = {
  nombre: MateriaNombre;
  docentesAccesos: Indicador;
  estudiantesAccesos: Indicador;
  clasesEfectivas: Indicador;
};

type ClaseItem = {
  grupo: number;
  totalClases: number;
  totalDocentes: number;
  accesosDocentes: number;
  clasesEfectivas: number;
  totalEstudiantes: number;
  accesosEstudiantes: number;
};

type IndicadoresItem = {
  grupo: number;
  clasesTotales: number;
  totalDocentes: number;
  accesosDocentes: number;
  clasesEfectivas: number;
  totalEstudiantes: number;
  accesosEstudiantes: number;
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
};

type GradoItem = {
  grado: number;
  clasesTotales: number;
  clasesEfectivas: number;
};

type SeccionesJson = {
  clases?: {
    grados?: GradoItem[];
    Indicadores?: IndicadoresItem[];
    details?: DetailItem[];
    Lenguaje?: ClaseItem[];
    Matematica?: ClaseItem[];
  };
  remediacion?: unknown;
  refuerzo?: unknown;
};

type MetricsRecord = {
  id: number;
  dateReported: string;
  type: string;
  category: string;
  json: SeccionesJson;
};

type ApiResponse = {
  last: MetricsRecord | null;
  cumulative: MetricsRecord[];
};

type LineChartItem = {
  fecha: string;
  accesosDocentes: number;
  accesosEstudiantes: number;
  clasesEfectivas: number;
};

const EMPTY_CLASES = {
  Lenguaje: [] as ClaseItem[],
  Matematica: [] as ClaseItem[],
  Indicadores: [] as IndicadoresItem[],
  details: [] as DetailItem[],
  grados: [] as GradoItem[],
};

function normalizeDate(date?: string | null) {
  if (!date) return "";
  return date.slice(0, 10);
}

function calcularVariacionPorcentual(anterior: number, actual: number) {
  if (anterior === 0) return 0;
  return ((actual - anterior) / anterior) * 100;
}

function calcularPorcentaje(valor: number, total: number) {
  if (total === 0) return 0;
  return (valor / total) * 100;
}

function sumarClaseItems(items: ClaseItem[]): ClaseItem {
  return items.reduce(
    (acc, item) => ({
      grupo: 0,
      totalClases: acc.totalClases + (item.totalClases ?? 0),
      totalDocentes: acc.totalDocentes + (item.totalDocentes ?? 0),
      accesosDocentes: acc.accesosDocentes + (item.accesosDocentes ?? 0),
      clasesEfectivas: acc.clasesEfectivas + (item.clasesEfectivas ?? 0),
      totalEstudiantes: acc.totalEstudiantes + (item.totalEstudiantes ?? 0),
      accesosEstudiantes: acc.accesosEstudiantes + (item.accesosEstudiantes ?? 0),
    }),
    {
      grupo: 0,
      totalClases: 0,
      totalDocentes: 0,
      accesosDocentes: 0,
      clasesEfectivas: 0,
      totalEstudiantes: 0,
      accesosEstudiantes: 0,
    }
  );
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
    }
  );
}

// function sumarIndicadoresItems(items: IndicadoresItem[]): IndicadoresItem {
//   return items.reduce(
//     (acc, item) => ({
//       grupo: 0,
//       clasesTotales: acc.clasesTotales + (item.clasesTotales ?? 0),
//       totalDocentes: acc.totalDocentes + (item.totalDocentes ?? 0),
//       accesosDocentes: acc.accesosDocentes + (item.accesosDocentes ?? 0),
//       clasesEfectivas: acc.clasesEfectivas + (item.clasesEfectivas ?? 0),
//       totalEstudiantes: acc.totalEstudiantes + (item.totalEstudiantes ?? 0),
//       accesosEstudiantes: acc.accesosEstudiantes + (item.accesosEstudiantes ?? 0),
//     }),
//     {
//       grupo: 0,
//       clasesTotales: 0,
//       totalDocentes: 0,
//       accesosDocentes: 0,
//       clasesEfectivas: 0,
//       totalEstudiantes: 0,
//       accesosEstudiantes: 0,
//     }
//   );
// }

function SeccionesClasesDashboard() {
  const [gruposSeleccionados, setGruposSeleccionados] = useState<string[]>([
    "Grupo 1",
    "Grupo 2",
  ]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["dashboard-secciones", selectedDate],
    queryFn: () => getSeccionClasses(selectedDate),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const lastReportedDate = data?.last?.dateReported?.slice(0, 10) || "";
  const effectiveSelectedDate = selectedDate || lastReportedDate;
  const cumulative = data?.cumulative;

  const orderedRecords = useMemo<MetricsRecord[]>(() => {
    if (!Array.isArray(cumulative)) return [];

    return [...cumulative].sort(
      (a, b) =>
        new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()
    );
  }, [cumulative]);

  const lastReportDate = useMemo(() => {
    if (orderedRecords.length === 0) return "Sin registros";
    return formatFullDate(orderedRecords[0].dateReported);
  }, [orderedRecords]);

  const sourceRecord = useMemo<MetricsRecord | null>(() => {
    if (orderedRecords.length === 0) return null;

    const matchedRecord = orderedRecords.find(
      (record) => normalizeDate(record.dateReported) === effectiveSelectedDate
    );

    return matchedRecord ?? null;
  }, [orderedRecords, effectiveSelectedDate]);

  const previousRecord = useMemo<MetricsRecord | null>(() => {
    if (!sourceRecord || orderedRecords.length === 0) return null;

    const currentIndex = orderedRecords.findIndex(
      (record) => record.id === sourceRecord.id
    );

    if (currentIndex === -1) return null;

    return orderedRecords[currentIndex + 1] ?? null;
  }, [sourceRecord, orderedRecords]);

  const currentData = useMemo(() => {
    const source = sourceRecord?.json ?? null;

    return {
      clases: {
        grados: source?.clases?.grados ?? EMPTY_CLASES.grados,
        Indicadores: source?.clases?.Indicadores ?? EMPTY_CLASES.Indicadores,
        details: source?.clases?.details ?? EMPTY_CLASES.details,
        Lenguaje: source?.clases?.Lenguaje ?? EMPTY_CLASES.Lenguaje,
        Matematica: source?.clases?.Matematica ?? EMPTY_CLASES.Matematica,
      },
      remediacion: source?.remediacion ?? null,
      refuerzo: source?.refuerzo ?? null,
    };
  }, [sourceRecord]);

  const previousData = useMemo(() => {
    const source = previousRecord?.json ?? null;

    return {
      clases: {
        grados: source?.clases?.grados ?? EMPTY_CLASES.grados,
        Indicadores: source?.clases?.Indicadores ?? EMPTY_CLASES.Indicadores,
        details: source?.clases?.details ?? EMPTY_CLASES.details,
        Lenguaje: source?.clases?.Lenguaje ?? EMPTY_CLASES.Lenguaje,
        Matematica: source?.clases?.Matematica ?? EMPTY_CLASES.Matematica,
      },
      remediacion: source?.remediacion ?? null,
      refuerzo: source?.refuerzo ?? null,
    };
  }, [previousRecord]);

  const hasData = useMemo(() => {
    return (
      currentData.clases.Lenguaje.length > 0 ||
      currentData.clases.Matematica.length > 0 ||
      currentData.clases.Indicadores.length > 0 ||
      currentData.clases.details.length > 0
    );
  }, [currentData]);

  const gruposDisponibles = useMemo(() => {
    const grupos = new Set<number>();

    currentData.clases.Lenguaje.forEach((item) => grupos.add(item.grupo));
    currentData.clases.Matematica.forEach((item) => grupos.add(item.grupo));
    currentData.clases.Indicadores.forEach((item) => grupos.add(item.grupo));
    currentData.clases.details.forEach((item) => grupos.add(item.grupo));

    return Array.from(grupos)
      .sort((a, b) => a - b)
      .map((grupo) => `Grupo ${grupo}`);
  }, [currentData]);

  const gruposActivosResolved = useMemo(() => {
    if (!hasData && gruposDisponibles.length === 0) return ["Grupo 1"];

    const validos = gruposSeleccionados.filter((grupo) =>
      gruposDisponibles.includes(grupo)
    );

    if (validos.length > 0) return validos;

    return gruposDisponibles.length > 0 ? gruposDisponibles : ["Grupo 1"];
  }, [gruposSeleccionados, gruposDisponibles, hasData]);

  const etiquetaGrupoActiva = useMemo(() => {
    if (gruposActivosResolved.length > 1) return "Todos";
    return gruposActivosResolved[0] ?? "Grupo 1";
  }, [gruposActivosResolved]);

  const gruposNumerosActivos = useMemo(() => {
    return gruposActivosResolved.map((grupo) =>
      Number(grupo.replace("Grupo ", ""))
    );
  }, [gruposActivosResolved]);

  const toggleGrupo = (grupo: string) => {
    setGruposSeleccionados((prev) => {
      if (prev.includes(grupo)) {
        const next = prev.filter((item) => item !== grupo);
        return next.length > 0 ? next : [grupo];
      }

      return [...prev, grupo].sort();
    });
  };

  const materiasResumen = useMemo((): Materia[] => {
    if (!hasData) {
      return [
        {
          nombre: "Lenguaje",
          docentesAccesos: { valor: 0, total: 0 },
          estudiantesAccesos: { valor: 0, total: 0 },
          clasesEfectivas: { valor: 0, total: 0 },
        },
        {
          nombre: "Matemática",
          docentesAccesos: { valor: 0, total: 0 },
          estudiantesAccesos: { valor: 0, total: 0 },
          clasesEfectivas: { valor: 0, total: 0 },
        },
      ];
    }

    const lenguajeItems = currentData.clases.Lenguaje.filter((item) =>
      gruposNumerosActivos.includes(item.grupo)
    );

    const matematicaItems = currentData.clases.Matematica.filter((item) =>
      gruposNumerosActivos.includes(item.grupo)
    );

    const lenguaje = sumarClaseItems(lenguajeItems);
    const matematica = sumarClaseItems(matematicaItems);

    return [
      {
        nombre: "Lenguaje",
        docentesAccesos: {
          valor: lenguaje.accesosDocentes,
          total: lenguaje.totalDocentes,
        },
        estudiantesAccesos: {
          valor: lenguaje.accesosEstudiantes,
          total: lenguaje.totalEstudiantes,
        },
        clasesEfectivas: {
          valor: lenguaje.clasesEfectivas,
          total: lenguaje.totalClases,
        },
      },
      {
        nombre: "Matemática",
        docentesAccesos: {
          valor: matematica.accesosDocentes,
          total: matematica.totalDocentes,
        },
        estudiantesAccesos: {
          valor: matematica.accesosEstudiantes,
          total: matematica.totalEstudiantes,
        },
        clasesEfectivas: {
          valor: matematica.clasesEfectivas,
          total: matematica.totalClases,
        },
      },
    ];
  }, [hasData, currentData, gruposNumerosActivos]);

  const detailsResumen = useMemo(() => {
    const detailItems = currentData.clases.details.filter((item) =>
      gruposNumerosActivos.includes(item.grupo)
    );

    const detail = sumarDetailItems(detailItems);

    return {
      tasaPresenciaDocente: detail.tasaPresenciaDocente,
      tasaPresenciaDocenteTotal: detail.tasaPresenciaDocenteTotal,
      tasaPresenciaEstudiante: detail.tasaPresenciaEstudiante,
      tasaPresenciaEstudianteTotal: detail.tasaPresenciaEstudianteTotal,
      logroAcademico: detail.logroAcademico,
      logroAcademicoTotal: detail.logroAcademicoTotal,
      recursosDigitales: detail.recursosDigitales,
      recursosDigitalesTotal: detail.recursosDigitalesTotal,
    };
  }, [currentData, gruposNumerosActivos]);

  const detailsPorcentajes = useMemo(() => {
    return {
      presenciaDocente: calcularPorcentaje(
        detailsResumen.tasaPresenciaDocente,
        detailsResumen.tasaPresenciaDocenteTotal
      ),
      presenciaEstudiante: calcularPorcentaje(
        detailsResumen.tasaPresenciaEstudiante,
        detailsResumen.tasaPresenciaEstudianteTotal
      ),
      logroAcademico: calcularPorcentaje(
        detailsResumen.logroAcademico,
        detailsResumen.logroAcademicoTotal
      ),
      recursosDigitales: calcularPorcentaje(
        detailsResumen.recursosDigitales,
        detailsResumen.recursosDigitalesTotal
      ),
    };
  }, [detailsResumen]);

  const variaciones = useMemo(() => {
    const lenguajeActual = sumarClaseItems(
      currentData.clases.Lenguaje.filter((item) =>
        gruposNumerosActivos.includes(item.grupo)
      )
    );

    const lenguajeAnterior = sumarClaseItems(
      previousData.clases.Lenguaje.filter((item) =>
        gruposNumerosActivos.includes(item.grupo)
      )
    );

    const matematicaActual = sumarClaseItems(
      currentData.clases.Matematica.filter((item) =>
        gruposNumerosActivos.includes(item.grupo)
      )
    );

    const matematicaAnterior = sumarClaseItems(
      previousData.clases.Matematica.filter((item) =>
        gruposNumerosActivos.includes(item.grupo)
      )
    );

    return {
      Lenguaje: {
        docentes: calcularVariacionPorcentual(
          lenguajeAnterior.accesosDocentes,
          lenguajeActual.accesosDocentes
        ),
        estudiantes: calcularVariacionPorcentual(
          lenguajeAnterior.accesosEstudiantes,
          lenguajeActual.accesosEstudiantes
        ),
        clases: calcularVariacionPorcentual(
          lenguajeAnterior.clasesEfectivas,
          lenguajeActual.clasesEfectivas
        ),
      },
      Matemática: {
        docentes: calcularVariacionPorcentual(
          matematicaAnterior.accesosDocentes,
          matematicaActual.accesosDocentes
        ),
        estudiantes: calcularVariacionPorcentual(
          matematicaAnterior.accesosEstudiantes,
          matematicaActual.accesosEstudiantes
        ),
        clases: calcularVariacionPorcentual(
          matematicaAnterior.clasesEfectivas,
          matematicaActual.clasesEfectivas
        ),
      },
    };
  }, [currentData, previousData, gruposNumerosActivos]);

  const clasesEfectivasResumen = useMemo(() => {
    const lenguaje = materiasResumen.find((m) => m.nombre === "Lenguaje");
    const matematica = materiasResumen.find((m) => m.nombre === "Matemática");

    const valor =
      (lenguaje?.clasesEfectivas.valor ?? 0) +
      (matematica?.clasesEfectivas.valor ?? 0);

    const total =
      (lenguaje?.clasesEfectivas.total ?? 0) +
      (matematica?.clasesEfectivas.total ?? 0);

    const porcentaje = calcularPorcentaje(valor, total);

    const variacion =
      ((variaciones.Lenguaje?.clases ?? 0) +
        (variaciones["Matemática"]?.clases ?? 0)) /
      2;

    return {
      valor,
      total,
      porcentaje,
      variacion,
    };
  }, [materiasResumen, variaciones]);

  const lineChartData = useMemo<LineChartItem[]>(() => {
  if (!orderedRecords.length) return [];

  const ultimosCinco = [...orderedRecords]
    .slice(0, 5)
    .sort(
      (a, b) =>
        new Date(a.dateReported).getTime() - new Date(b.dateReported).getTime()
    );

  return ultimosCinco.map((record) => {
    const lenguajeItems = (record.json?.clases?.Lenguaje ?? []).filter((item) =>
      gruposNumerosActivos.includes(item.grupo)
    );

    const matematicaItems = (record.json?.clases?.Matematica ?? []).filter((item) =>
      gruposNumerosActivos.includes(item.grupo)
    );

    const lenguaje = sumarClaseItems(lenguajeItems);
    const matematica = sumarClaseItems(matematicaItems);

    return {
      fecha: formatFullDate(record.dateReported),
      accesosDocentes:
        (lenguaje.accesosDocentes ?? 0) + (matematica.accesosDocentes ?? 0),
      accesosEstudiantes:
        (lenguaje.accesosEstudiantes ?? 0) +
        (matematica.accesosEstudiantes ?? 0),
      clasesEfectivas:
        (lenguaje.clasesEfectivas ?? 0) + (matematica.clasesEfectivas ?? 0),
    };
  });
}, [orderedRecords, gruposNumerosActivos]);

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
      <p className="text-xs text-red-600 flex justify-center items-center p-3">
        Ocurrió un error al cargar la información.
      </p>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8 my-5">
        <div className="mb-3 flex gap-2 justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Secciones (clases)
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Accesos de docentes y estudiantes, clases efectivas y variación por
              materia.
            </p>
          </div>

          <div className="flex mt-3">
            <p className="text-xs bg-green-600 p-1 rounded-lg text-green-900">
              <span className="font-semibold">Reciente:</span>{" "}
              <span className="text-white font-light">{lastReportDate}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-end items-center gap-2 text-xs my-5">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-full md:w-auto">
          <div className="flex h-9 w-15 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Calendar size={16} />
          </div>
          <input
            type="date"
            className="w-full"
            value={effectiveSelectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm w-full md:w-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Users size={16} />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {gruposDisponibles.length > 0 ? (
              gruposDisponibles.map((grupo) => (
                <label
                  key={grupo}
                  className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={gruposActivosResolved.includes(grupo)}
                    onChange={() => toggleGrupo(grupo)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span>{grupo}</span>
                </label>
              ))
            ) : (
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Grupo 1</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {!hasData ? (
        <p className="border-l-2 border-green-700 text-green-700 p-2 bg-green-50 text-center">
          No hay datos para la fecha seleccionada.
        </p>
      ) : (
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-700">
                  <BookOpen size={16} />
                  <p className="text-sm font-medium">Clases efectivas</p>
                </div>
                {clasesEfectivasResumen.variacion > 0 ? (
                  <p className="flex gap-2 items-center text-xs font-medium text-green-700">
                    <TrendingUp size={16} />
                    Variación: {clasesEfectivasResumen.variacion.toFixed(1)}%
                  </p>
                ) : (
                  <p className="flex gap-2 items-center text-xs font-medium text-red-700">
                    <TrendingDown size={16} />
                    Variación: {clasesEfectivasResumen.variacion.toFixed(1)}%
                  </p>
                )}
              </div>
              <p className="mt-2 font-bold text-indigo-600 text-5xl">
                {Math.round(Math.min(clasesEfectivasResumen.porcentaje, 100))}%
              </p>
              <p className="mt-3 text-lg text-gray-500 font-semibold">
                <span className="text-gray-500">
                  {clasesEfectivasResumen.valor.toLocaleString("en-US")}
                </span>{" "}
                de {clasesEfectivasResumen.total.toLocaleString("en-US")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Tasa de presencia de docentes
              </p>
              <p className="mt-2 font-bold text-indigo-600 text-5xl">
                {Math.round(Math.min(detailsPorcentajes.presenciaDocente, 100))}%
              </p>
              <p className="mt-3 text-lg text-gray-500 font-semibold">
                {detailsResumen.tasaPresenciaDocente.toLocaleString("en-US")}{" "}
                <span>
                  de{" "}
                  {detailsResumen.tasaPresenciaDocenteTotal.toLocaleString(
                    "en-US"
                  )}
                </span>
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Tasa de presencia de estudiantes
              </p>
              <p className="mt-2 font-bold text-indigo-600 text-5xl">
                {Math.round(
                  Math.min(detailsPorcentajes.presenciaEstudiante, 100)
                )}
                %
              </p>
              <p className="mt-3 text-lg text-gray-500 font-semibold">
                {detailsResumen.tasaPresenciaEstudiante.toLocaleString("en-US")}{" "}
                <span>
                  de{" "}
                  {detailsResumen.tasaPresenciaEstudianteTotal.toLocaleString(
                    "en-US"
                  )}
                </span>
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Nivel de logro académico
              </p>
              <p className="mt-2 font-bold text-green-700 text-5xl">
                {Math.round(Math.min(detailsPorcentajes.logroAcademico, 100))}%
              </p>
              <p className="mt-3 text-lg text-gray-500 font-semibold">
                {detailsResumen.logroAcademico.toLocaleString("en-US")}{" "}
                <span>
                  de {detailsResumen.logroAcademicoTotal.toLocaleString("en-US")}
                </span>
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Uso de recursos digitales
              </p>
              <p className="mt-2 font-bold text-green-700 text-5xl">
                {Math.round(Math.min(detailsPorcentajes.recursosDigitales, 100))}
                %
              </p>
              <p className="mt-3 text-lg text-gray-500 font-semibold">
                {detailsResumen.recursosDigitales.toLocaleString("en-US")}{" "}
                <span>
                  de{" "}
                  {detailsResumen.recursosDigitalesTotal.toLocaleString("en-US")}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Resumen por materia
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {`Visualización correspondiente a ${etiquetaGrupoActiva}.`}
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                {etiquetaGrupoActiva}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {materiasResumen.map((materia) => {
                const porcentajeDocentes =
                  materia.docentesAccesos.total > 0
                    ? (materia.docentesAccesos.valor /
                        materia.docentesAccesos.total) *
                      100
                    : 0;

                const porcentajeEstudiantes =
                  materia.estudiantesAccesos.total > 0
                    ? (materia.estudiantesAccesos.valor /
                        materia.estudiantesAccesos.total) *
                      100
                    : 0;

                const variacionMateria = variaciones[materia.nombre];

                return (
                  <div
                    key={materia.nombre}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                          <BookOpen size={18} />
                        </div>

                        <h3 className="text-xl font-semibold text-slate-900">
                          {materia.nombre}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Indicadores principales de la materia
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 mt-6">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Users size={16} />
                            <p className="text-sm font-medium">Docentes</p>
                          </div>
                          {variacionMateria.docentes > 0 ? (
                            <p className="flex gap-2 items-center text-xs font-medium text-green-700">
                              <TrendingUp size={16} />
                              Variación: {variacionMateria.docentes.toFixed(1)}%
                            </p>
                          ) : (
                            <p className="flex gap-2 items-center text-xs font-medium text-red-700">
                              <TrendingDown size={16} />
                              Variación: {variacionMateria.docentes.toFixed(1)}%
                            </p>
                          )}
                        </div>

                        <p className="mt-3 text-2xl font-bold text-slate-900">
                          <span className="text-gray-500 text-xl">
                            {materia.docentesAccesos.valor.toLocaleString(
                              "en-US"
                            )}
                          </span>{" "}
                          / {materia.docentesAccesos.total.toLocaleString("en-US")}
                        </p>

                        <div className="flex items-center justify-center mt-4 gap-2">
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-2.5 rounded-full bg-indigo-600"
                              style={{
                                width: `${Math.min(porcentajeDocentes, 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-gray-500 text-sm font-semibold">
                            {Math.round(Math.min(porcentajeDocentes, 100))}%
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Users size={16} />
                            <p className="text-sm font-medium">Estudiantes</p>
                          </div>
                          {variacionMateria.estudiantes > 0 ? (
                            <p className="flex gap-2 items-center text-xs font-medium text-green-700">
                              <TrendingUp size={16} />
                              Variación:{" "}
                              {variacionMateria.estudiantes.toFixed(1)}%
                            </p>
                          ) : (
                            <p className="flex gap-2 items-center text-xs font-medium text-red-700">
                              <TrendingDown size={16} />
                              Variación:{" "}
                              {variacionMateria.estudiantes.toFixed(1)}%
                            </p>
                          )}
                        </div>

                        <p className="mt-3 text-2xl font-bold text-slate-900">
                          <span className="text-gray-500 text-xl">
                            {materia.estudiantesAccesos.valor.toLocaleString(
                              "en-US"
                            )}
                          </span>{" "}
                          /{" "}
                          {materia.estudiantesAccesos.total.toLocaleString(
                            "en-US"
                          )}
                        </p>

                        <div className="flex items-center justify-center mt-4 gap-2">
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-2.5 rounded-full bg-indigo-600"
                              style={{
                                width: `${Math.min(
                                  porcentajeEstudiantes,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <p className="text-gray-500 text-sm font-semibold">
                            {Math.round(Math.min(porcentajeEstudiantes, 100))}%
                          </p>
                        </div>
                      </div>

                      
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Comportamiento semanal
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tendencia de los últimos 5 días para {etiquetaGrupoActiva.toLowerCase()}.
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                Últimos 5 días
              </div>
            </div>

            {lineChartData.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No hay datos suficientes para mostrar la tendencia semanal.
              </div>
            ) : (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineChartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="accesosDocentes"
                      name="Accesos docentes"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="accesosEstudiantes"
                      name="Accesos estudiantes"
                      stroke="#059669"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clasesEfectivas"
                      name="Clases efectivas"
                      stroke="#ea580c"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SeccionesClasesDashboard;