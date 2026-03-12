import {
  ChevronDown,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";

type MateriaNombre = "Matemática" | "Lenguaje";

type Materia = {
  nombre: MateriaNombre;
  docentesAccesos: number;
  estudiantesAccesos: number;
  clasesEfectivas: number;
  clasesProgramadas: number;
  variacion: number;
};

type Grupo = {
  grupo: string;
  materias: Materia[];
};

const TOTAL_DOCENTES = 4000;
const TOTAL_ESTUDIANTES = 135000;

const GRUPOS_DATA: Grupo[] = [
  {
    grupo: "Grupo 1",
    materias: [
      {
        nombre: "Matemática",
        docentesAccesos: 1481,
        estudiantesAccesos: 3088,
        clasesEfectivas: 72491,
        clasesProgramadas: 0,
        variacion: 0,
      },
      {
        nombre: "Lenguaje",
        docentesAccesos: 1459,
        estudiantesAccesos: 72568,
        clasesEfectivas: 502,
        clasesProgramadas: 0,
        variacion: 0,
      },
    ],
  },
  {
    grupo: "Grupo 2",
    materias: [
      {
        nombre: "Matemática",
        docentesAccesos: 1176,
        estudiantesAccesos: 57364,
        clasesEfectivas: 214,
        clasesProgramadas: 0,
        variacion: 0,
      },
      {
        nombre: "Lenguaje",
        docentesAccesos: 1170,
        estudiantesAccesos: 57563,
        clasesEfectivas: 214,
        clasesProgramadas: 0,
        variacion: 0,
      },
    ],
  },
];

function SeccionesClasesDashboard() {
  const [grupoActivo, setGrupoActivo] = useState<string>("Grupo 1");

  const gruposDisponibles = useMemo(
    () => GRUPOS_DATA.map((item) => item.grupo),
    []
  );

  const dataFiltrada = useMemo(() => {
    return GRUPOS_DATA.filter((item) => item.grupo === grupoActivo);
  }, [grupoActivo]);

  const materiasResumen = useMemo(() => {
    const acumulado: Record<MateriaNombre, Materia> = {
      Matemática: {
        nombre: "Matemática",
        docentesAccesos: 0,
        estudiantesAccesos: 0,
        clasesEfectivas: 0,
        clasesProgramadas: 0,
        variacion: 0,
      },
      Lenguaje: {
        nombre: "Lenguaje",
        docentesAccesos: 0,
        estudiantesAccesos: 0,
        clasesEfectivas: 0,
        clasesProgramadas: 0,
        variacion: 0,
      },
    };

    const contadorVariacion: Record<MateriaNombre, number> = {
      Matemática: 0,
      Lenguaje: 0,
    };

    dataFiltrada.forEach((grupo) => {
      grupo.materias.forEach((materia) => {
        acumulado[materia.nombre].docentesAccesos += materia.docentesAccesos;
        acumulado[materia.nombre].estudiantesAccesos +=
          materia.estudiantesAccesos;
        acumulado[materia.nombre].clasesEfectivas += materia.clasesEfectivas;
        acumulado[materia.nombre].clasesProgramadas += materia.clasesProgramadas;
        acumulado[materia.nombre].variacion += materia.variacion;
        contadorVariacion[materia.nombre] += 1;
      });
    });

    return (Object.values(acumulado) as Materia[]).map((materia) => ({
      ...materia,
      variacion:
        contadorVariacion[materia.nombre] > 0
          ? Number(
              (materia.variacion / contadorVariacion[materia.nombre]).toFixed(1)
            )
          : 0,
    }));
  }, [dataFiltrada]);

  const resumenGeneral = useMemo(() => {
    const totalDocentesAccesos = materiasResumen.reduce(
      (acc, item) => acc + item.docentesAccesos,
      0
    );
    const totalEstudiantesAccesos = materiasResumen.reduce(
      (acc, item) => acc + item.estudiantesAccesos,
      0
    );
    const totalClasesEfectivas = materiasResumen.reduce(
      (acc, item) => acc + item.clasesEfectivas,
      0
    );
    const totalClasesProgramadas = materiasResumen.reduce(
      (acc, item) => acc + item.clasesProgramadas,
      0
    );

    return {
      totalDocentesAccesos,
      totalEstudiantesAccesos,
      totalClasesEfectivas,
      totalClasesProgramadas,
      grupos: dataFiltrada.length,
      materias: materiasResumen.length,
    };
  }, [materiasResumen, dataFiltrada.length]);


  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Secciones(clases)
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Accesos de docentes y estudiantes, las clases efectivas y la
                variación en el tiempo por grupo y materia.
              </p>
            </div>

            <div className="">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Filtro por grupos
                </p>

                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Users size={16} />
                  </div>

                  <select
                    value={grupoActivo}
                    onChange={(e) => setGrupoActivo(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                  >
                    {gruposDisponibles.map((grupo) => (
                      <option key={grupo} value={grupo}>
                        {grupo}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={16} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

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
                {`Visualización correspondiente a ${grupoActivo}.`}
              </p>
            </div>

            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
              {grupoActivo}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {materiasResumen.map((materia) => {
              const porcentajeDocentes =
                (materia.docentesAccesos / TOTAL_DOCENTES) * 100;
              const porcentajeEstudiantes =
                (materia.estudiantesAccesos / TOTAL_ESTUDIANTES) * 100;
              const porcentajeClases =
                materia.clasesProgramadas > 0
                  ? (materia.clasesEfectivas / materia.clasesProgramadas) * 100
                  : 0;

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
                        {materia.docentesAccesos.toLocaleString("en-US")}
                      </p>

                      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-2.5 rounded-full bg-indigo-600"
                          style={{
                            width: `${Math.min(porcentajeDocentes, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <div className="flex items-center gap-2 text-slate-700">
                        <GraduationCap size={16} />
                        <p className="text-sm font-medium">Estudiantes</p>
                      </div>

                      <p className="mt-3 text-2xl font-bold text-slate-900">
                        {materia.estudiantesAccesos.toLocaleString("en-US")}
                      </p>

                      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-2.5 rounded-full bg-emerald-600"
                          style={{
                            width: `${Math.min(porcentajeEstudiantes, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <div className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 size={16} />
                        <p className="text-sm font-medium">Clases efectivas</p>
                      </div>

                      <p className="mt-3 text-2xl font-bold text-slate-900">
                        {materia.clasesEfectivas.toLocaleString("en-US")}
                      </p>

                      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-2.5 rounded-full bg-slate-900"
                          style={{
                            width: `${Math.min(porcentajeClases, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeccionesClasesDashboard;