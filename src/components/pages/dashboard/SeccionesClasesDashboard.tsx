import { getSeccionClasses } from "@/services/dashboard.services";
import { formatFullDate } from "@/utils/index.utils";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useMemo, useState } from "react";

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

type SeccionesJson = {
  clases?: {
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
  cumulative: MetricsRecord | null;
};

const EMPTY_CLASES = {
  Lenguaje: [] as ClaseItem[],
  Matematica: [] as ClaseItem[],
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

function calcularVariacionPorcentual(valores: number[]) {
  if (valores.length < 2) return 0;

  const max = Math.max(...valores);
  const min = Math.min(...valores);

  if (max === 0) return 0;

  return ((max - min) / max) * 100;
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

  const sourceRecord = useMemo(() => {
    const records = [data?.last, data?.cumulative].filter(
      (record): record is MetricsRecord => Boolean(record)
    );

    const matchedRecord = records.find(
      (record) => normalizeDate(record.dateReported) === selectedDate
    );

    return matchedRecord ?? null;
  }, [data, selectedDate]);

  const currentData = useMemo(() => {
    const source = sourceRecord?.json ?? null;

    return {
      clases: {
        Lenguaje: source?.clases?.Lenguaje ?? EMPTY_CLASES.Lenguaje,
        Matematica: source?.clases?.Matematica ?? EMPTY_CLASES.Matematica,
      },
      remediacion: source?.remediacion ?? null,
      refuerzo: source?.refuerzo ?? null,
    };
  }, [sourceRecord]);

  const hasData = useMemo(() => {
    return (
      currentData.clases.Lenguaje.length > 0 ||
      currentData.clases.Matematica.length > 0
    );
  }, [currentData]);

  const gruposDisponibles = useMemo(() => {
    const grupos = new Set<number>();

    currentData.clases.Lenguaje.forEach((item) => grupos.add(item.grupo));
    currentData.clases.Matematica.forEach((item) => grupos.add(item.grupo));

    return Array.from(grupos)
      .sort((a, b) => a - b)
      .map((grupo) => `Grupo ${grupo}`);
  }, [currentData]);

  const grupoActivoResolved = useMemo(() => {
    if (!hasData) return "Grupo 1";
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

  const resumenGeneral = useMemo(() => {
    const totalDocentesAccesos = materiasResumen.reduce(
      (acc, item) => acc + item.docentesAccesos.valor,
      0
    );
    const totalEstudiantesAccesos = materiasResumen.reduce(
      (acc, item) => acc + item.estudiantesAccesos.valor,
      0
    );
    const totalClasesEfectivas = materiasResumen.reduce(
      (acc, item) => acc + item.clasesEfectivas.valor,
      0
    );

    return {
      totalDocentesAccesos,
      totalEstudiantesAccesos,
      totalClasesEfectivas,
      materias: materiasResumen.length,
    };
  }, [materiasResumen]);

  const variaciones = useMemo(() => {
    return {
      Lenguaje: {
        docentes: calcularVariacionPorcentual(
          currentData.clases.Lenguaje.map((item) => item.accesosDocentes)
        ),
        estudiantes: calcularVariacionPorcentual(
          currentData.clases.Lenguaje.map((item) => item.accesosEstudiantes)
        ),
        clases: calcularVariacionPorcentual(
          currentData.clases.Lenguaje.map((item) => item.clasesEfectivas)
        ),
      },
      Matemática: {
        docentes: calcularVariacionPorcentual(
          currentData.clases.Matematica.map((item) => item.accesosDocentes)
        ),
        estudiantes: calcularVariacionPorcentual(
          currentData.clases.Matematica.map((item) => item.accesosEstudiantes)
        ),
        clases: calcularVariacionPorcentual(
          currentData.clases.Matematica.map((item) => item.clasesEfectivas)
        ),
      },
    };
  }, [currentData]);

  console.log(data);
  console.log("selectedDate:", selectedDate);
  console.log("sourceRecord:", sourceRecord);
  console.log("variaciones:", variaciones);

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
        <div className="mb-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Secciones (clases)
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Accesos de docentes y estudiantes, clases efectivas y variación por
            materia.
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Fecha del reporte: {formatFullDate(selectedDate)}
          </p>
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
            disabled={!hasData}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Accesos docentes
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {resumenGeneral.totalDocentesAccesos.toLocaleString("en-US")}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Accesos estudiantes
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {resumenGeneral.totalEstudiantesAccesos.toLocaleString("en-US")}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Clases efectivas
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {resumenGeneral.totalClasesEfectivas.toLocaleString("en-US")}
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

                const porcentajeClases =
                  materia.clasesEfectivas.total > 0
                    ? (materia.clasesEfectivas.valor /
                        materia.clasesEfectivas.total) *
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

                    <div className="mt-6 grid gap-3">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Users size={16} />
                          <p className="text-sm font-medium">Docentes</p>
                        </div>

                        <p className="mt-3 text-2xl font-bold text-slate-900">
                          <span className="text-gray-500 text-xl">
                            {materia.docentesAccesos.valor.toLocaleString(
                              "en-US"
                            )}
                          </span>{" "}
                          /{" "}
                          {materia.docentesAccesos.total.toLocaleString("en-US")}
                        </p>

                        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-2.5 rounded-full bg-indigo-600"
                            style={{
                              width: `${Math.min(porcentajeDocentes, 100)}%`,
                            }}
                          />
                        </div>

                        <p className="mt-3 text-xs font-medium text-slate-500">
                          Variación: {variacionMateria.docentes.toFixed(1)}%
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <div className="flex items-center gap-2 text-slate-700">
                          <GraduationCap size={16} />
                          <p className="text-sm font-medium">Estudiantes</p>
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

                        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-2.5 rounded-full bg-emerald-600"
                            style={{
                              width: `${Math.min(
                                porcentajeEstudiantes,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <p className="mt-3 text-xs font-medium text-slate-500">
                          Variación: {variacionMateria.estudiantes.toFixed(1)}%
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <div className="flex items-center gap-2 text-slate-700">
                          <CheckCircle2 size={16} />
                          <p className="text-sm font-medium">
                            Clases efectivas
                          </p>
                        </div>

                        <p className="mt-3 text-2xl font-bold text-slate-900">
                          <span className="text-gray-500 text-xl">
                            {materia.clasesEfectivas.valor.toLocaleString(
                              "en-US"
                            )}
                          </span>{" "}
                          /{" "}
                          {materia.clasesEfectivas.total.toLocaleString("en-US")}
                        </p>

                        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-2.5 rounded-full bg-violet-600"
                            style={{
                              width: `${Math.min(porcentajeClases, 100)}%`,
                            }}
                          />
                        </div>

                        <p className="mt-3 text-xs font-medium text-slate-500">
                          Variación: {variacionMateria.clases.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeccionesClasesDashboard;