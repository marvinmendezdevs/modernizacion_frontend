import { metricsUpload } from "@/services/metrisc.services";
import type { metricData } from "@/types/metrics";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

type DetallesGestionEscolar = {
  Otros: number;
  "Docente incapacitado": number;
  "Inoperatividad del LXP": number;
  "No respondió la llamada": number;
  "Docente no asignado por MINED": number;
  "No tiene estudiantes asignados": number;
  "Horario no corresponde a ese día": number;
  "Fallas en el servicios de internet": number;
  "Se conectó desde la cuenta de emergencia": number;
  "Docente sin credenciales/con asignación incorrecta": number;
};

type GestionEscolarJson = {
  directores: {
    total: number;
    detalles: DetallesGestionEscolar;
    llamadas: {
      respondidas: number;
      no_respondidas: number;
    };
  };
};

type FormValues = {
  dateReported: string;
  timeReported: string;
  type: string;
  category: string;
  json: GestionEscolarJson;
};

const detalleLabels: Array<keyof DetallesGestionEscolar> = [
  "Otros",
  "Docente incapacitado",
  "Inoperatividad del LXP",
  "No respondió la llamada",
  "Docente no asignado por MINED",
  "No tiene estudiantes asignados",
  "Horario no corresponde a ese día",
  "Fallas en el servicios de internet",
  "Se conectó desde la cuenta de emergencia",
  "Docente sin credenciales/con asignación incorrecta",
];

function getCurrentLocalTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function FormGestionEscolar() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultValues: FormValues = {
    dateReported: "",
    timeReported: getCurrentLocalTime(),
    type: "Gestion_Escolar",
    category: "",
    json: {
      directores: {
        total: 0,
        detalles: {
          Otros: 0,
          "Docente incapacitado": 0,
          "Inoperatividad del LXP": 0,
          "No respondió la llamada": 0,
          "Docente no asignado por MINED": 0,
          "No tiene estudiantes asignados": 0,
          "Horario no corresponde a ese día": 0,
          "Fallas en el servicios de internet": 0,
          "Se conectó desde la cuenta de emergencia": 0,
          "Docente sin credenciales/con asignación incorrecta": 0,
        },
        llamadas: {
          respondidas: 0,
          no_respondidas: 0,
        },
      },
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
    mutationKey: ["metrics-gestion-escolar"],
    mutationFn: metricsUpload,
    onSuccess: async (res) => {
      if (res) {
        setSuccessMsg("Datos actualizados correctamente.");
        setErrorMsg(null);
        queryClient.invalidateQueries({ queryKey: ["gestion-escolar-update"] });
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

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h1 className="font-semibold text-indigo-600 text-xl">
          Agregar gestión escolar
        </h1>

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
                value="Gestion_Escolar"
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

        <section className="border border-gray-200 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-bold text-indigo-600">Directores</h2>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Total</label>
              <input
                type="number"
                min={0}
                disabled={mutation.isPending}
                {...register("json.directores.total", {
                  required: "El total es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0, message: "Debe ser mayor o igual a 0" },
                })}
                className="border border-gray-200 p-2 rounded-lg text-gray-700"
              />
              {errors.json?.directores?.total?.message && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.json.directores.total.message}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">Respondidas</label>
              <input
                type="number"
                min={0}
                disabled={mutation.isPending}
                {...register("json.directores.llamadas.respondidas", {
                  required: "Las respondidas son obligatorias",
                  valueAsNumber: true,
                  min: { value: 0, message: "Debe ser mayor o igual a 0" },
                })}
                className="border border-gray-200 p-2 rounded-lg text-gray-700"
              />
              {errors.json?.directores?.llamadas?.respondidas?.message && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.json.directores.llamadas.respondidas.message}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-700">No respondidas</label>
              <input
                type="number"
                min={0}
                disabled={mutation.isPending}
                {...register("json.directores.llamadas.no_respondidas", {
                  required: "Las no respondidas son obligatorias",
                  valueAsNumber: true,
                  min: { value: 0, message: "Debe ser mayor o igual a 0" },
                })}
                className="border border-gray-200 p-2 rounded-lg text-gray-700"
              />
              {errors.json?.directores?.llamadas?.no_respondidas?.message && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.json.directores.llamadas.no_respondidas.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-md font-semibold text-gray-800">Detalles</h3>

            <div className="grid md:grid-cols-2 gap-3">
              {detalleLabels.map((detalle) => (
                <div key={detalle} className="flex flex-col">
                  <label className="font-semibold text-gray-700 text-sm">
                    {detalle}
                  </label>
                  <input
                    type="number"
                    min={0}
                    disabled={mutation.isPending}
                    {...register(`json.directores.detalles.${detalle}`, {
                      required: "Este campo es obligatorio",
                      valueAsNumber: true,
                      min: { value: 0, message: "Debe ser mayor o igual a 0" },
                    })}
                    className="border border-gray-200 p-2 rounded-lg text-gray-700 bg-white"
                  />
                  {errors.json?.directores?.detalles?.[detalle]?.message && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.json.directores.detalles[detalle]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
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

export default FormGestionEscolar;