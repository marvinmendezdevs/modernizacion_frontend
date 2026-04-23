import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ClipboardList,
  Users,
  MessageSquareText,
} from "lucide-react";
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

type NoAccesosResponse = {
  last: {
    id: number;
    dateReported: string;
    type: string;
    category: string;
    json: NoAccesosJson;
  } | null;
};

function NoAccesos() {
  const [selectedDate, setSelectedDate] = useState("2026-04-22");

  const { data, isLoading, isError } = useQuery<NoAccesosResponse>({
    queryKey: ["no-accesos", selectedDate],
    queryFn: () => getNoAccesos(selectedDate),
    enabled: !!selectedDate,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const registroSeleccionado = data?.last?.json ?? null;

  const totalSecciones = registroSeleccionado?.noAccesos?.totalSecciones ?? 0;
  const totalDocentesUnicos =
    registroSeleccionado?.noAccesos?.totalDocentesUnicos ?? 0;
  const resumenMotivos =
    registroSeleccionado?.noAccesos?.resumenMotivos ?? [];

  const totalRespuestas = registroSeleccionado?.respuestas?.total ?? 0;
  const actividadInstitucionalDetalle =
    registroSeleccionado?.respuestas?.actividadInstitucionalDetalle ?? [];

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
                  className="bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
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
        ) : !registroSeleccionado ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
            No hay datos para la fecha seleccionada.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-indigo-200 bg-indigo-600 p-5 text-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-indigo-100">Total de secciones</p>
                    <h2 className="mt-3 text-3xl font-bold">{totalSecciones}</h2>
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
                    <h2 className="mt-3 text-3xl font-bold">{totalRespuestas}</h2>
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
                    Resumen de motivos
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Distribución de los no accesos registrados por motivo.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {resumenMotivos.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-base font-semibold text-slate-800">
                          {item.motivo}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Motivo reportado
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 md:min-w-[280px] md:justify-end">
                        <span className="inline-flex min-w-[130px] justify-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                          Secciones: {item.secciones}
                        </span>
                        <span className="inline-flex min-w-[130px] justify-center rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-700">
                          Docentes: {item.docentesUnicos}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Respuestas de campaña
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Detalle de respuestas registradas para esta fecha.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {actividadInstitucionalDetalle.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div>
                        <p className="text-base font-semibold text-slate-800">
                          {item.motivo}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Respuestas registradas
                        </p>
                      </div>

                      <div className="inline-flex w-fit rounded-2xl bg-violet-100 px-4 py-2 text-violet-700">
                        <span className="text-2xl font-bold">
                          {item.recuento}
                        </span>
                      </div>
                    </div>
                  ))}
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