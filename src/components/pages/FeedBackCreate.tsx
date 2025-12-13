import { setFeedback } from "@/services/tutorship.services";
import { useFeedbackStore } from "@/stores/tutorship.store";
import type { CoachingSessionCreateType, ResponseSectionSchema } from "@/types/intruments.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";

type FormData = {
    recommendations: string;
    commitments: string;
    directorObservation?: boolean;
    tracking?: string;
}

function FeedBackCreate() {
    const { observationId } = useParams();
    const criterias = useFeedbackStore((state) => state.criterias);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { register, handleSubmit } = useForm<FormData>();

    const observation = queryClient.getQueryData<ResponseSectionSchema>(['observation', observationId]);

    const mutation = useMutation({
        mutationFn: setFeedback,
        onSuccess: () => {
            navigate(-1);
        }
    });

    useEffect(() => {
        if (!criterias.length || !observation) {
            navigate('/tutoria');
        }
    }, [criterias, observation, navigate]);

    const onSubmit = (data: FormData) => {

        if (!observation) return;

        const formData: CoachingSessionCreateType = {
            responseId: observation.responseId,
            tutorId: observation.tutorId,
            teacherId: observation.teacherId,
            directorName: observation.school.directorName,
            selectedCriteria: criterias,
            recommendations: data.recommendations,
            commitments: data.commitments,
            directorObservation: data.directorObservation || false,
            tracking: data.tracking || ''
        }

        mutation.mutate(formData);
    }

    if (observation) return (
        <div>
            <h2 className="text-lg font-black text-indigo-600">Generador de reportes de retroalimentación docente</h2>
            <p className="text-sm">
                <span className="font-bold">Propósito del encuentro:</span> Dar a conocer al docente el informe de la sesión observada, resaltando fortalezas y presentando áreas de mejora para el fortalecimiento de su práctica.
            </p>

            {mutation.isPending ? (
                <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
                    <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
                    Guardando...
                </p>
            ) : (
                <form className="my-5 text-sm" onSubmit={handleSubmit(onSubmit)}>
                    <fieldset>
                        <legend className="text-lg text-indigo-600 mb-3">Datos de la observación</legend>

                        <p className="font-black">Datos del encuentro</p>
                        <div className="grid md:grid-cols-2 gap-4 my-2">
                            <div className="grid gap-1">
                                <label htmlFor="teacher">Docente:</label>
                                <input className="border border-gray-200 rounded p-2 bg-gray-100 cursor-not-allowed outline-0" type="text" id="teacher" value={observation.teacher.name} disabled />
                            </div>

                            <div className="grid gap-1">
                                <label htmlFor="director">Director:</label>
                                <input className="border border-gray-200 rounded p-2 bg-gray-100 cursor-not-allowed outline-0" type="text" id="director" value={observation.school.directorName} disabled />
                            </div>
                        </div>

                        <p className="font-black mb-1">Criterios abordados</p>

                        <div className="bg-gray-100 p-3 rounded border border-gray-200">
                            {criterias.map((criteria, index) => (
                                <div key={index}>
                                    <p>{index + 1}. {criteria}</p>
                                </div>
                            ))}
                        </div>
                    </fieldset>

                    {observation.teacher.coachingSessions.length > 0 && (
                        <fieldset className="mt-5">
                            <legend className="text-lg text-indigo-600 mb-3">Progreso de observaciones</legend>

                            <div className="flex items-center gap-2">
                                <label htmlFor="directorObservation">Chequeo observación de clase Director/Subdirector</label>
                                <input type="checkbox" id="directorObservation"
                                    {...register('directorObservation')}
                                />
                            </div>

                            <div className="my-3 grid gap-1">
                                <label htmlFor="tracking">Seguimiento al ciclo anterior: </label>
                                <input className="p-2 border border-gray-200 rounded" type="text" id="tracking" placeholder="Seguimiento al ciclo anterior"
                                    {...register('tracking')}
                                />
                            </div>
                        </fieldset>
                    )}

                    <fieldset className="mt-5">
                        <legend className="text-lg text-indigo-600 mb-3">Contenido de la retroalimentación</legend>

                        <div>
                            <div className="grid gap-1">
                                <label htmlFor="recommendations">Recomendaciones:</label>
                                <textarea id="recommendations" className="border border-gray-200 rounded p-2" rows={4}
                                    {...register('recommendations')}
                                ></textarea>
                            </div>
                        </div>

                        <div className="my-3">
                            <div className="grid gap-1">
                                <label htmlFor="commitments">Compromisos:</label>
                                <textarea id="commitments" className="border border-gray-200 rounded p-2" rows={4}
                                    {...register('commitments')}
                                ></textarea>
                            </div>
                        </div>
                    </fieldset>

                    <div className="flex items-center gap-2 justify-end">
                        <Link className="bg-red-500 text-white px-3 py-2 rounded" to="/tutoria">Cancelar</Link>
                        <button type="submit" className="bg-indigo-500 text-white px-3 py-2 rounded">Guardar</button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default FeedBackCreate;