import { metricsUpload } from "@/services/metrisc.services";
import type { metricData } from "@/types/metrics";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

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
  clases: {
    Lenguaje: [ClaseItem, ClaseItem];
    Matematica: [ClaseItem, ClaseItem];
  };
  remediacion: Record<string, never>;
  refuerzo: Record<string, never>;
};

type FormValues = {
  dateReported: string;
  timeReported: string;
  type: string;
  category: string;
  json: SeccionesJson;
};

const createDefaultClaseItem = (grupo: number): ClaseItem => ({
  grupo,
  totalClases: 0,
  totalDocentes: 0,
  accesosDocentes: 0,
  clasesEfectivas: 0,
  totalEstudiantes: 0,
  accesosEstudiantes: 0,
});

function getCurrentLocalTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function FormSecciones() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultValues: FormValues = {
    dateReported: "",
    timeReported: getCurrentLocalTime(),
    type: "Secciones",
    category: "",
    json: {
      clases: {
        Lenguaje: [createDefaultClaseItem(1), createDefaultClaseItem(2)],
        Matematica: [createDefaultClaseItem(1), createDefaultClaseItem(2)],
      },
      remediacion: {},
      refuerzo: {},
    },
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    const updateTime = () => {
      setValue("timeReported", getCurrentLocalTime(), {
        shouldValidate: true,
        shouldDirty: false,
      });
    };

    updateTime();

    const interval = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(interval);
  }, [setValue]);

  const mutation = useMutation<ResponseType, Error, metricData>({
    mutationKey: ["metrics-secciones"],
    mutationFn: metricsUpload,
    onSuccess: async (res) => {
      if (res) {
        setSuccessMsg("Datos actualizados correctamente.");
        setErrorMsg(null);
        queryClient.invalidateQueries({ queryKey: ["secciones-update"] });
      }
    },
    onError: (err) => {
      setSuccessMsg(null);
      setErrorMsg(err.message || "Ocurrió un error");
    },
  });

  const onSubmit = (values: FormValues) => {
    const now = new Date();
    const currentTime = [
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0"),
    ].join(":");

    const [year, month, day] = values.dateReported.split("-").map(Number);
    const [hours, minutes, seconds = "00"] = currentTime.split(":").map(Number);

    const payload: metricData = {
      dateReported: new Date(
        Date.UTC(year, month - 1, day, hours, minutes, Number(seconds), 0)
      ),
      type: values.type.trim(),
      category: values.category.trim(),
      json: values.json,
    };

    mutation.mutate(payload);
  };

  const renderClaseFields = (
    materia: "Lenguaje" | "Matematica",
    groupIndex: 0 | 1
  ) => {
    const grupo = groupIndex + 1;

    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
        <h4 className="font-semibold text-indigo-700">Grupo {grupo}</h4>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="hidden">
            <label className="font-semibold text-gray-700 text-sm">Grupo</label>
            <input
              type="number"
              disabled
              {...register(`json.clases.${materia}.${groupIndex}.grupo`, {
                valueAsNumber: true,
              })}
              className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-gray-100"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-700 text-sm">Total clases</label>
            <input
              type="number"
              min={0}
              disabled={mutation.isPending}
              {...register(`json.clases.${materia}.${groupIndex}.totalClases`, {
                required: "El total de clases es obligatorio",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              })}
              className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-white"
            />
            {errors.json?.clases?.[materia]?.[groupIndex]?.totalClases?.message && (
              <p className="text-xs text-red-600 mt-1">
                {errors.json.clases[materia][groupIndex]?.totalClases?.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-700 text-sm">Clases efectivas</label>
            <input
              type="number"
              min={0}
              disabled={mutation.isPending}
              {...register(`json.clases.${materia}.${groupIndex}.clasesEfectivas`, {
                required: "Las clases efectivas son obligatorias",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              })}
              className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-white"
            />
            {errors.json?.clases?.[materia]?.[groupIndex]?.clasesEfectivas?.message && (
              <p className="text-xs text-red-600 mt-1">
                {errors.json.clases[materia][groupIndex]?.clasesEfectivas?.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-700 text-sm">Total docentes</label>
            <input
              type="number"
              min={0}
              disabled={mutation.isPending}
              {...register(`json.clases.${materia}.${groupIndex}.totalDocentes`, {
                required: "El total de docentes es obligatorio",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              })}
              className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-white"
            />
            {errors.json?.clases?.[materia]?.[groupIndex]?.totalDocentes?.message && (
              <p className="text-xs text-red-600 mt-1">
                {errors.json.clases[materia][groupIndex]?.totalDocentes?.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-700 text-sm">Accesos docentes</label>
            <input
              type="number"
              min={0}
              disabled={mutation.isPending}
              {...register(`json.clases.${materia}.${groupIndex}.accesosDocentes`, {
                required: "Los accesos de docentes son obligatorios",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              })}
              className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-white"
            />
            {errors.json?.clases?.[materia]?.[groupIndex]?.accesosDocentes?.message && (
              <p className="text-xs text-red-600 mt-1">
                {errors.json.clases[materia][groupIndex]?.accesosDocentes?.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-700 text-sm">Total estudiantes</label>
            <input
              type="number"
              min={0}
              disabled={mutation.isPending}
              {...register(`json.clases.${materia}.${groupIndex}.totalEstudiantes`, {
                required: "El total de estudiantes es obligatorio",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              })}
              className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-white"
            />
            {errors.json?.clases?.[materia]?.[groupIndex]?.totalEstudiantes?.message && (
              <p className="text-xs text-red-600 mt-1">
                {errors.json.clases[materia][groupIndex]?.totalEstudiantes?.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-700 text-sm">Accesos estudiantes</label>
            <input
              type="number"
              min={0}
              disabled={mutation.isPending}
              {...register(`json.clases.${materia}.${groupIndex}.accesosEstudiantes`, {
                required: "Los accesos de estudiantes son obligatorios",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              })}
              className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-white"
            />
            {errors.json?.clases?.[materia]?.[groupIndex]?.accesosEstudiantes?.message && (
              <p className="text-xs text-red-600 mt-1">
                {errors.json.clases[materia][groupIndex]?.accesosEstudiantes?.message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h1 className="font-semibold text-indigo-600 text-xl">Agregar secciones</h1>

        <Link
          to="/dashboard/update"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Regresar
        </Link>
      </div>

      {successMsg && (
        <p className="bg-green-600 rounded-lg text-white px-3 py-2 my-3 font-semibold text-center">
          {successMsg}
        </p>
      )}

      {errorMsg && (
        <p className="bg-red-600 rounded-lg text-white px-3 py-2 my-3 font-semibold text-center">
          {errorMsg}
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 border border-gray-200 rounded-lg mt-5 space-y-6"
      >
        <fieldset>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Fecha</label>
              <input
                type="date"
                disabled={mutation.isPending}
                {...register("dateReported", {
                  required: "La fecha es obligatoria",
                })}
                className="border border-gray-200 p-2 rounded-lg text-gray-700"
              />
              {errors.dateReported?.message && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.dateReported.message}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Hora de subida</label>
              <input
                type="text"
                readOnly
                disabled={mutation.isPending}
                {...register("timeReported", {
                  required: "La hora es obligatoria",
                })}
                className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-gray-100 cursor-not-allowed"
              />
              {errors.timeReported?.message && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.timeReported.message}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Tipo</label>
              <input
                type="text"
                readOnly
                value="Secciones"
                className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Categoría</label>
              <select
                disabled={mutation.isPending}
                {...register("category", {
                  required: "La categoría es obligatoria",
                })}
                className="border border-gray-200 p-2 rounded-lg text-gray-700"
              >
                <option value="">Seleccione</option>
                <option value="Diario">Diario</option>
                <option value="Acumulado">Acumulado</option>
              </select>
              {errors.category?.message && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <section className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-indigo-600">Matemática</h2>
            {renderClaseFields("Matematica", 0)}
            {renderClaseFields("Matematica", 1)}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-indigo-600">Lenguaje</h2>
            {renderClaseFields("Lenguaje", 0)}
            {renderClaseFields("Lenguaje", 1)}
          </div>
        </section>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="submit"
            disabled={mutation.isPending || !isValid}
            className="px-3 py-2 rounded bg-indigo-600 text-white hover:cursor-pointer disabled:opacity-50"
          >
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormSecciones;