import { getObservation } from "@/services/tutorship.services";
import type { InstrumentTable, PayloadType, ResponseSectionSchema } from "@/types/intruments.types"
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useFeedbackStore } from "@/stores/tutorship.store";

type FeedBackFormType = {
    observation: ResponseSectionSchema
}

function FeedBackForm({ observation }: FeedBackFormType) {
    const navigate = useNavigate();
    const saveCriterias = useFeedbackStore((state) => state.setCriterias);

    const { register, reset } = useForm<PayloadType['answers']>({
        defaultValues: {}
    });

    const [criterias, setCriterias] = useState<string[]>([]);

    const { data, isLoading, isError } = useQuery<InstrumentTable>({
        queryKey: ["observation-form"],
        queryFn: getObservation,
    });

    useEffect(() => {
        if (observation?.payload?.answers) {
            reset(observation.payload.answers);
        }
    }, [observation, reset]);

    const handleCheckboxChange = (criteria: string) => {
        setCriterias((prev) => {
            if (prev.includes(criteria)) {
                return prev.filter(c => c !== criteria);
            } else {
                if (prev.length < 3) {
                    return [...prev, criteria];
                }
                return prev;
            }
        });
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (criterias.length < 3) {
            alert('Debes seleccionar al menos 3 criterios');
            return;
        }

        saveCriterias(criterias);

        navigate(`/retroalimentacion/${observation.id}/create`);
    }

    if (isLoading)
        return (
            <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
                <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
                Cargando lista de docentes asignados...
            </p>
        );

    if (isError)
        return (
            <p className="text-xs text-red-600 text-center p-3">
                ¡Error inespertado! contacte con soporte.
            </p>
        );

    if (data) return (
        <>
            <h2 className="text-lg font-black text-indigo-600">Observación de clase</h2>
            <form
                onSubmit={handleSubmit}
                className="overflow-x-auto mt-3"
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
                            if (section.nombre_seccion.includes('Área') && !section.nombre_seccion.toLowerCase().includes(observation.payload.subject.toLowerCase())) {
                                return null;
                            }

                            return (
                                <React.Fragment key={section.id_seccion}>
                                    <tr className="bg-orange-200">
                                        <td></td>
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
                                                        colSpan={5}
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
                                                    <td className="bg-gray-100 p-2">
                                                        <input type="checkbox" name="pregunta"
                                                            id={`pregunta-${question.id_pregunta}`}
                                                            disabled={criterias.length >= 3 && !criterias.includes(question.texto)}

                                                            checked={criterias.includes(question.texto)}

                                                            onChange={() => handleCheckboxChange(question.texto)}
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        {question.texto}
                                                    </td>
                                                    {question.opciones.length === 2 && <td></td>}
                                                    {question.opciones.map((res, index) => (
                                                        <td key={index} className="p-2 text-center">
                                                            <input
                                                                type="radio"
                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                                value={res.etiqueta}
                                                                disabled
                                                                {...register(`pregunta-${question.id_pregunta}`)}
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
                    <button className="bg-indigo-600 text-white py-2 px-4 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={criterias.length < 3}>
                        Retroalimentar
                    </button>
                </div>
            </form>
        </>
    )
}

export default FeedBackForm
