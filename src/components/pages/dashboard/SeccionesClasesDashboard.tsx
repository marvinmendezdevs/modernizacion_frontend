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
import GraficsSecciones from "./secciones/GraficsSecciones";

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

const EMPTY_CLASES = {
  Lenguaje: [] as ClaseItem[],
  Matematica: [] as ClaseItem[],
  Indicadores: [] as IndicadoresItem[],
  details: [] as DetailItem[],
  grados: [] as GradoItem[],
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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

function SeccionesClasesDashboard() {
  const [grupoActivo, setGrupoActivo] = useState<string>("Grupo 1");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["dashboard-secciones", selectedDate],
    queryFn: () => getSeccionClasses(selectedDate),
    retry: false,
    refetchOnWindowFocus: false,
  });

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
      (record) => normalizeDate(record.dateReported) === selectedDate
    );

    return matchedRecord ?? null;
  }, [orderedRecords, selectedDate]);

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

  const grupoActivoResolved = useMemo(() => {
    if (!hasData && gruposDisponibles.length === 0) return "Grupo 1";
    if (gruposDisponibles.includes(grupoActivo)) return grupoActivo;
    return gruposDisponibles[0] ?? "Grupo 1";
  }, [hasData, gruposDisponibles, grupoActivo]);

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

    const grupoNumero = Number(grupoActivoResolved.replace("Grupo ", ""));

    const lenguaje = currentData.clases.Lenguaje.find(
      (item) => item.grupo === grupoNumero
    );

    const matematica = currentData.clases.Matematica.find(
      (item) => item.grupo === grupoNumero
    );

    return [
      {
        nombre: "Lenguaje",
        docentesAccesos: {
          valor: lenguaje?.accesosDocentes ?? 0,
          total: lenguaje?.totalDocentes ?? 0,
        },
        estudiantesAccesos: {
          valor: lenguaje?.accesosEstudiantes ?? 0,
          total: lenguaje?.totalEstudiantes ?? 0,
        },
        clasesEfectivas: {
          valor: lenguaje?.clasesEfectivas ?? 0,
          total: lenguaje?.totalClases ?? 0,
        },
      },
      {
        nombre: "Matemática",
        docentesAccesos: {
          valor: matematica?.accesosDocentes ?? 0,
          total: matematica?.totalDocentes ?? 0,
        },
        estudiantesAccesos: {
          valor: matematica?.accesosEstudiantes ?? 0,
          total: matematica?.totalEstudiantes ?? 0,
        },
        clasesEfectivas: {
          valor: matematica?.clasesEfectivas ?? 0,
          total: matematica?.totalClases ?? 0,
        },
      },
    ];
  }, [hasData, grupoActivoResolved, currentData]);

  const detailsResumen = useMemo(() => {
    const grupoNumero = Number(grupoActivoResolved.replace("Grupo ", ""));

    const detail = currentData.clases.details.find(
      (item) => item.grupo === grupoNumero
    );

    return {
      tasaPresenciaDocente: detail?.tasaPresenciaDocente ?? 0,
      tasaPresenciaDocenteTotal: detail?.tasaPresenciaDocenteTotal ?? 0,
      tasaPresenciaEstudiante: detail?.tasaPresenciaEstudiante ?? 0,
      tasaPresenciaEstudianteTotal: detail?.tasaPresenciaEstudianteTotal ?? 0,
      logroAcademico: detail?.logroAcademico ?? 0,
      logroAcademicoTotal: detail?.logroAcademicoTotal ?? 0,
      recursosDigitales: detail?.recursosDigitales ?? 0,
      recursosDigitalesTotal: detail?.recursosDigitalesTotal ?? 0,
    };
  }, [currentData, grupoActivoResolved]);

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
    const grupoNumero = Number(grupoActivoResolved.replace("Grupo ", ""));

    const lenguajeActual = currentData.clases.Lenguaje.find(
      (item) => item.grupo === grupoNumero
    );
    const lenguajeAnterior = previousData.clases.Lenguaje.find(
      (item) => item.grupo === grupoNumero
    );

    const matematicaActual = currentData.clases.Matematica.find(
      (item) => item.grupo === grupoNumero
    );
    const matematicaAnterior = previousData.clases.Matematica.find(
      (item) => item.grupo === grupoNumero
    );

    return {
      Lenguaje: {
        docentes: calcularVariacionPorcentual(
          lenguajeAnterior?.accesosDocentes ?? 0,
          lenguajeActual?.accesosDocentes ?? 0
        ),
        estudiantes: calcularVariacionPorcentual(
          lenguajeAnterior?.accesosEstudiantes ?? 0,
          lenguajeActual?.accesosEstudiantes ?? 0
        ),
        clases: calcularVariacionPorcentual(
          lenguajeAnterior?.clasesEfectivas ?? 0,
          lenguajeActual?.clasesEfectivas ?? 0
        ),
      },
      Matemática: {
        docentes: calcularVariacionPorcentual(
          matematicaAnterior?.accesosDocentes ?? 0,
          matematicaActual?.accesosDocentes ?? 0
        ),
        estudiantes: calcularVariacionPorcentual(
          matematicaAnterior?.accesosEstudiantes ?? 0,
          matematicaActual?.accesosEstudiantes ?? 0
        ),
        clases: calcularVariacionPorcentual(
          matematicaAnterior?.clasesEfectivas ?? 0,
          matematicaActual?.clasesEfectivas ?? 0
        ),
      },
    };
  }, [currentData, previousData, grupoActivoResolved]);

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
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-full md:w-auto">
          <div className="flex h-9 w-15 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Users size={16} />
          </div>
          <select
            value={grupoActivoResolved}
            onChange={(e) => setGrupoActivo(e.target.value)}
            className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none"
            disabled={!hasData && gruposDisponibles.length === 0}
          >
            {gruposDisponibles.length > 0 ? (
              gruposDisponibles.map((grupo) => (
                <option key={grupo} value={grupo}>
                  {grupo}
                </option>
              ))
            ) : (
              <option value="Grupo 1">Grupo 1</option>
            )}
          </select>
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
                {Math.round(Math.min(detailsPorcentajes.presenciaEstudiante, 100))}%
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
                  de{" "}
                  {detailsResumen.logroAcademicoTotal.toLocaleString("en-US")}
                </span>
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Uso de recursos digitales
              </p>
              <p className="mt-2 font-bold text-green-700 text-5xl">
                {Math.round(Math.min(detailsPorcentajes.recursosDigitales, 100))}%
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
                  {`Visualización correspondiente a ${grupoActivoResolved}.`}
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                {grupoActivoResolved}
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

          <div className="mt-5 hidden">
            <GraficsSecciones grados={currentData.clases.grados} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SeccionesClasesDashboard;