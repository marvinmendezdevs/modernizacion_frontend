import React, { useState } from "react";
import { getDiagnostic, setDiagnostic } from "@/services/tutorship.services";
import type { DiagnosticResponseValues, InstrumentTable } from "@/types/intruments.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router";
import type { TeacherSectionUser } from "@/types/tutorship.types";
import { getCategoryFromScore } from "@/utils/index.utils";

type DiagnosticFormType = {
    dataAccess: TeacherSectionUser
}

function DiagnosticForm({ dataAccess }: DiagnosticFormType) {
    const [obtainedScore, setObtainedScore] = useState<number | null>(null);
    const { register, formState: { errors }, handleSubmit } = useForm();
    const { data, isLoading, isError } = useQuery<InstrumentTable>({
        queryKey: ['diagnostic'],
        queryFn: getDiagnostic,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const mutation = useMutation({
        mutationFn: setDiagnostic,
        onError: (error) => console.log(error),
        onSuccess: (data) => {
            setObtainedScore(data.payload.score);
        }
    });

    if (isLoading) return (
        <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
            <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
            Cargando formulario...
        </p>
    )

    if (isError) return (
        <p className="text-xs text-red-600 text-center p-3">
            ¡Error inespertado! contacte con soporte.
        </p>
    );

    const onSubmit: SubmitHandler<DiagnosticResponseValues> = (answers) => {
        let maxPossibleScore = 0; // Renombrado para claridad

        const SCORE_MAP: Record<string, number> = {
            'Bajo': 1,
            'Medio': 2,
            'Alto': 3
        };

        const obtainedPoints = Object.values(answers).reduce<number>((acc, value) => {
            // Validamos que sea string y exista en el mapa
            if (typeof value === 'string' && SCORE_MAP[value] !== undefined) {
                maxPossibleScore += 3; // Sumamos el valor máximo posible de esta pregunta
                return acc + SCORE_MAP[value];
            }
            return acc;
        }, 0);

        // GUARDIA DE SEGURIDAD: Evitar división por cero
        // Si no contestó nada válido, el score es 0
        const score = maxPossibleScore === 0
            ? 0
            : (obtainedPoints / maxPossibleScore) * 10;

        const finalScore = Number(score.toFixed(1));

        mutation.mutate({
            teacherId: dataAccess.teacherId,
            sectionId: dataAccess.sectionId,
            schoolCode: Number(dataAccess.section.schoolCode),
            payload: {
                answers,
                score: finalScore,
                subject: dataAccess.subject
            }
        });
    }

    if (data) return (
        <div className="mt-5">
            <h2 className="text-lg font-black text-indigo-600">Instrumento Diagnóstico - Centros educativos</h2>
            <p className="text-sm text-gray-600 mb-3">Proyecto de Modernización Educativa - El Salvador</p>

            {mutation.isPending ? (
                <p className="p-2 text-sm text-gray-500 text-center">Enviando diagnóstico...</p>
            ) : !obtainedScore ? (
                <form className="overflow-x-auto" onSubmit={handleSubmit(onSubmit)}>
                    <table className="w-full max-w-full">
                        <thead>
                            <tr>
                                <th className="text-left"></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.schema.map(section => (
                                <React.Fragment key={section.id_seccion}>
                                    <tr className="bg-orange-200">
                                        <td className="px-4 py-2 font-bold text-lg">{section.nombre_seccion}</td>
                                        <td className="w-15 px-2 py-2 text-center font-semibold">N/A</td>
                                        <td className="px-2 py-2 text-center font-semibold">Bajo</td>
                                        <td className="px-2 py-2 text-center font-semibold">Medio</td>
                                        <td className="px-2 py-2 text-center font-semibold">Alto</td>
                                    </tr>
                                    {section.indicadores.map((indicator, index) => {
                                        if (indicator.nombre_indicador.includes('Área') && !indicator.nombre_indicador.toLowerCase().includes(dataAccess.subject.toLowerCase())) {
                                            return null;
                                        }

                                        return (
                                            <React.Fragment key={index}>
                                                <tr className="bg-gray-100">
                                                    <td colSpan={5} className="px-6 py-3 font-semibold text-gray-800">{indicator.nombre_indicador}</td>
                                                </tr>
                                                {indicator.preguntas.map(question => (
                                                    <tr key={question.id_pregunta} className="border-b border-gray-200">
                                                        <td className="p-2">
                                                            {question.texto}
                                                            {errors[`pregunta-${question.id_pregunta}`] && <p className="text-red-500 text-xs mt-1">Esta pregunta es requerida.</p>}
                                                        </td>
                                                        {question.opciones.length === 3 && <td></td>}
                                                        {question.opciones.map((res, index) => (
                                                            <td key={index} className="p-2 text-center">
                                                                <input {...register(`pregunta-${question.id_pregunta}`, { required: true })} type="radio" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" value={res.etiqueta} />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        )

                                    })}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end gap-2 mt-5">
                        <Link className="bg-red-600 text-white py-2 px-4 rounded" to="/tutoria">Cancelar</Link>
                        <button className="bg-indigo-600 text-white py-2 px-4 rounded cursor-pointer">Enviar</button>
                    </div>
                </form>

            ) : (
                <div>
                    <p className="bg-orange-300 p-2 font-black">Diagnóstico enviado</p>
                    <div className="px-2 py-5 border border-gray-300">
                        <p>
                            Puntaje obtenido: {getCategoryFromScore(obtainedScore)}
                        </p>
                        <Link className="bg-gray-300 py-2 px-6 rounded inline-block mt-3" to="/tutoria" replace>Cerrar</Link>
                    </div>
                </div>

            )
            }

        </div >
    )
}

export default DiagnosticForm