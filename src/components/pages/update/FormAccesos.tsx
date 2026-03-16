import { metricsUpload } from "@/services/metrisc.services";
import type { metricData } from "@/types/metrics";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router"
   
function FormAccesos() {
    const queryClient = useQueryClient();

    const defaultValues = {
        id: "",
        fecha: "",
        tipo: "",
        json: "",
        categoria: ""
    }

    const { register, handleSubmit, formState: { errors, isValid }, } = useForm<metricData>({
        mode: "onChange",
        defaultValues,
    });

    const mutation = useMutation({
        mutationKey: ["metrics-data"],
        mutationFn: metricsUpload,
        onSuccess: async (res) => {
            console.log(res)
            queryClient.invalidateQueries({ queryKey: ["accesos-update"] });
        },
    });

    const onSubmit = (values: metricData) => {
        const payload: metricData = {
            id: "",
            dateReported: values.dateReported,
            type: values.type.trim(),
            json: values.json,
            category: values.category.trim()
        };

        mutation.mutate(payload);
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <h1 className="font-semibold text-indigo-600 text-xl">Agregar acceso</h1>
                <Link to={"/dashboard/update"} className="border border-gray-200 rounded-lg p-1">Regresar</Link>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 border border-gray-200 rounded-lg mt-5">
                <fieldset>
                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700">Fecha</label>
                            <input disabled={mutation.isPending} {...register("dateReported", { required: "La fecha es obligatoria" })} className="border border-gray-200 p-1 rounded-lg text-gray-700" type="date" />
                            {errors.dateReported?.message && (
                                <p className="text-xs text-red-600 mt-1">{errors.dateReported.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700">Tipo</label>
                            <select disabled={mutation.isPending} {...register("type", { required: "El tipo es obligatorio" })} id="type" className="border border-gray-200 p-1 rounded-lg text-gray-700">
                                <option value="">Seleccione</option>
                                <option value="Accesos">Accesos</option>
                                <option value="Formacion_Tutoria">Formación y Tutoría</option>
                                <option value="Gestion_Escolar">Gestión escolar</option>
                            </select>
                            {errors.type?.message && (
                                <p className="text-xs text-red-600 mt-1">{errors.type.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700">Json</label>
                            <input disabled={mutation.isPending} {...register("json", { required: "El json es obligatorio" })} className="border border-gray-200 p-1 rounded-lg text-gray-700" type="text" placeholder="Ingrese el json de los datos." />
                            {errors.json?.message && (
                                <p className="text-xs text-red-600 mt-1">{errors.json.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700">Categoría</label>
                            <select disabled={mutation.isPending} {...register("category", { required: "La categoría es obligatoria" })} className="border border-gray-200 p-1 rounded-lg text-gray-700">
                                <option value="">Seleccione</option>
                                <option value="Diario">Diario</option>
                                <option value="Acumulado">Acumulado</option>
                            </select>
                            {errors.category?.message && (
                                <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>
                            )}
                        </div>
                    </div>
                </fieldset>
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
    )
}

export default FormAccesos
