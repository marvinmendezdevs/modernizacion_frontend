import React from "react";
import { Link, useNavigate } from "react-router";
import { getObservation, setObservation } from "@/services/tutorship.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import type {
    DiagnosticResponseValues,
    InstrumentTable,
} from "@/types/intruments.types";
import type { TeacherSectionUser } from "@/types/tutorship.types";

type ObservationFormItemType = {
    dataAccess: TeacherSectionUser;
};

function ObservationFormItem({ dataAccess }: ObservationFormItemType) {
    const navigate = useNavigate();
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm();
    const { data, isLoading, isError } = useQuery<InstrumentTable>({
        queryKey: ["observation-form"],
        queryFn: getObservation,
    });


    const mutation = useMutation({
        mutationFn: setObservation,
        onError: (error) => console.log(error),
        onSuccess: () => navigate(-1),
    });

    if (isLoading)
        return (
            <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
                <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
                Cargando información para la observación...
            </p>
        );

    if (isError)
        return (
            <p className="text-xs text-red-600 text-center p-3">
                ¡Error inespertado! contacte con soporte.
            </p>
        );

    const onSubmit: SubmitHandler<DiagnosticResponseValues> = (answers) => {

        mutation.mutate({
            teacherId: dataAccess.teacherId,
            sectionId: dataAccess.sectionId,
            schoolCode: dataAccess.section.schoolCode,
            payload: {
                answers,
                subject: dataAccess.subject,
                score: 0
            }
        });
    };

    if (data)
        return (
            <>
                {mutation.isPending ? (
                    <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
                        <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
                        Enviando observación...
                    </p>
                ) : (
                    <form
                        className="overflow-x-auto mt-3"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <table className="w-full max-w-full">
                            <thead>
                                <tr>
                                    <th className="text-left"></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.schema.map((section) => {
                                    if (section.nombre_seccion.includes('Área') && !section.nombre_seccion.toLowerCase().includes(dataAccess.subject.toLowerCase())) {
                                        return null;
                                    }

                                    return (
                                        <React.Fragment key={section.id_seccion}>
                                            <tr className="bg-orange-200">
                                                <td className="px-4 py-2 font-bold text-lg">
                                                    {section.nombre_seccion}
                                                </td>
                                                <td className="w-15 px-2 py-2 text-center font-semibold">
                                                    N/A
                                                </td>
                                                <td className="px-2 py-2 text-center font-semibold">
                                                    Si
                                                </td>
                                                <td className="px-2 py-2 text-center font-semibold">
                                                    No
                                                </td>
                                            </tr>
                                            {section.indicadores.map((indicator, index) => (
                                                <React.Fragment key={index}>
                                                    {indicator.nombre_indicador && (
                                                        <tr className="bg-gray-100">
                                                            <td
                                                                colSpan={4}
                                                                className="px-6 py-3 font-semibold text-gray-800"
                                                            >
                                                                {indicator.nombre_indicador}
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {indicator.preguntas.map((question) => (
                                                        <tr
                                                            key={question.id_pregunta}
                                                            className="border-b border-gray-200"
                                                        >
                                                            <td className="p-2">
                                                                {question.texto}
                                                                {errors[`pregunta-${question.id_pregunta}`] && (
                                                                    <p className="text-red-500 text-xs mt-1">
                                                                        Esta pregunta es requerida.
                                                                    </p>
                                                                )}
                                                            </td>
                                                            {question.opciones.length === 2 && <td></td>}
                                                            {question.opciones.map((res, index) => (
                                                                <td key={index} className="p-2 text-center">
                                                                    <input
                                                                        {...register(
                                                                            `pregunta-${question.id_pregunta}`,
                                                                            { required: true }
                                                                        )}
                                                                        type="radio"
                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                                        value={res.etiqueta}
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="flex justify-end gap-2 mt-5">
                            <Link
                                className="bg-red-600 text-white py-2 px-4 rounded"
                                to="/tutoria"
                            >
                                Cancelar
                            </Link>
                            <button className="bg-indigo-600 text-white py-2 px-4 rounded cursor-pointer">
                                Enviar
                            </button>
                        </div>
                    </form>
                )}
            </>
        );
}

export default ObservationFormItem;
