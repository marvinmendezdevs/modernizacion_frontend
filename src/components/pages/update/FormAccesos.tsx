import { metricsUpload } from "@/services/metrisc.services";
import type { metricData } from "@/types/metrics";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

type GroupMetric = {
  total: number;
  access: number;
  demo: number;
  group: number;
};

type SectionBlock = {
  docentes: [GroupMetric, GroupMetric];
  estudiantes: [GroupMetric, GroupMetric];
};

type FormValues = {
  dateReported: string;
  timeReported: string;
  type: string;
  category: string;
  json: {
    clases: SectionBlock;
    refuerzo: SectionBlock;
    remediacion: SectionBlock;
  };
};

const createDefaultGroup = (group: number): GroupMetric => ({
  total: 0,
  access: 0,
  demo: 0,
  group,
});

const createDefaultSection = (): SectionBlock => ({
  docentes: [createDefaultGroup(1), createDefaultGroup(2)],
  estudiantes: [createDefaultGroup(1), createDefaultGroup(2)],
});

const sectionTitles = {
  clases: "Clases",
  refuerzo: "Refuerzo",
  remediacion: "Remediación",
} as const;

const metricTitles = {
  docentes: "Docentes",
  estudiantes: "Estudiantes",
} as const;

type SectionKey = keyof typeof sectionTitles;
type MetricKey = keyof typeof metricTitles;

function getCurrentLocalTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function FormAccesos() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultValues: FormValues = {
    dateReported: "",
    timeReported: getCurrentLocalTime(),
    type: "Accesos",
    category: "",
    json: {
      clases: createDefaultSection(),
      refuerzo: createDefaultSection(),
      remediacion: createDefaultSection(),
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
    mutationKey: ["metrics-data"],
    mutationFn: metricsUpload,
    onSuccess: async (res) => {
      if (res) {
        setSuccessMsg("Datos actualizados correctamente.");
        setErrorMsg(null);
        queryClient.invalidateQueries({ queryKey: ["accesos-update"] });
      }
    },
    onError: (err) => {
      setSuccessMsg(null);
      setErrorMsg(err.message || "Ocurrió un error");
    },
  });

  const onSubmit = (values: FormValues) => {
    const [year, month, day] = values.dateReported.split("-").map(Number);
    const [hours, minutes, seconds = "00"] = values.timeReported.split(":").map(Number);

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

  const renderMetricFields = (
    section: SectionKey,
    metric: MetricKey,
    groupIndex: 0 | 1
  ) => {
    const groupNumber = groupIndex + 1;

    return (
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <h5 className="font-semibold text-sm text-indigo-700 mb-3">
          Grupo {groupNumber}
        </h5>

        <div className="grid md:grid-cols-4 gap-3">
          <div className="flex flex-col">
            <label className="font-semibold text-gray-700 text-sm">Total</label>
            <input
              type="number"
              min={0}
              disabled={mutation.isPending}
              {...register(`json.${section}.${metric}.${groupIndex}.total`, {
                required: "El total es obligatorio",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              })}
              className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-white"
            />
            {errors.json?.[section]?.[metric]?.[groupIndex]?.total?.message && (
              <p className="text-xs text-red-600 mt-1">
                {errors.json?.[section]?.[metric]?.[groupIndex]?.total?.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-700 text-sm">Access</label>
            <input
              type="number"
              min={0}
              disabled={mutation.isPending}
              {...register(`json.${section}.${metric}.${groupIndex}.access`, {
                required: "El access es obligatorio",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              })}
              className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-white"
            />
            {errors.json?.[section]?.[metric]?.[groupIndex]?.access?.message && (
              <p className="text-xs text-red-600 mt-1">
                {errors.json?.[section]?.[metric]?.[groupIndex]?.access?.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-700 text-sm">Demo</label>
            <input
              type="number"
              min={0}
              disabled={mutation.isPending}
              {...register(`json.${section}.${metric}.${groupIndex}.demo`, {
                required: "El demo es obligatorio",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              })}
              className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-white"
            />
            {errors.json?.[section]?.[metric]?.[groupIndex]?.demo?.message && (
              <p className="text-xs text-red-600 mt-1">
                {errors.json?.[section]?.[metric]?.[groupIndex]?.demo?.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-700 text-sm">Group</label>
            <input
              type="number"
              disabled
              {...register(`json.${section}.${metric}.${groupIndex}.group`, {
                valueAsNumber: true,
              })}
              className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-gray-100"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-indigo-600 text-xl">Agregar acceso</h1>
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
                disabled={mutation.isPending}
                {...register("dateReported", {
                  required: "La fecha es obligatoria",
                })}
                className="border border-gray-200 p-2 rounded-lg text-gray-700"
                type="date"
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
                className="border border-gray-200 p-2 rounded-lg text-gray-700 cursor-not-allowed bg-gray-100"
                readOnly
                value="Accesos"
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

        {(Object.keys(sectionTitles) as SectionKey[]).map((sectionKey) => (
          <details
            key={sectionKey}
            className="border border-gray-200 rounded-xl p-4 group cursor-pointer"
          >
            <summary className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-indigo-600">
                {sectionTitles[sectionKey]}
              </h2>
              <ChevronUp className="transition-transform duration-300 group-open:rotate-180" />
            </summary>

            {(Object.keys(metricTitles) as MetricKey[]).map((metricKey) => (
              <div key={metricKey} className="space-y-3">
                <h3 className="text-md font-semibold text-gray-800">
                  {metricTitles[metricKey]}
                </h3>

                {renderMetricFields(sectionKey, metricKey, 0)}
                {renderMetricFields(sectionKey, metricKey, 1)}
              </div>
            ))}
          </details>
        ))}

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

export default FormAccesos;