import { setFeedback } from "@/services/tutorship.services";
import { useFeedbackStore } from "@/stores/tutorship.store";
import type { CoachingSessionCreateType, ResponseSectionSchema } from "@/types/intruments.types";
import { formatFullDate } from "@/utils/index.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, SquarePen } from "lucide-react";
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
            navigate('/tutoria');
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
            responseId: observation.id,
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

    const lastFeedback = observation?.teacher.coachingSessions.at(-1)

    console.log(observation)
    if (observation) return (
        <div>
            <h2 className="text-2xl font-black text-indigo-600">Generador de reportes de retroalimentación docente</h2>
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
                            <legend className="text-lg text-indigo-600 mb-3">
                                Progreso de observaciones
                            </legend>

                            <div className="space-y-6 relative mt-5">
                                <div className="absolute left-[19px] top-2 bottom-0 w-0.5 bg-slate-200 hidden sm:block"></div>

                                <div className="relative pl-0 sm:pl-12">
                                    <div className="absolute left-0 top-1 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 border-2 border-white ring-4 ring-white z-10 shadow-lg shadow-indigo-200">
                                        <SquarePen className="text-white size-5" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <input
                                                type="checkbox"
                                                id="directorObservation"
                                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                {...register("directorObservation")}
                                            />
                                            <label
                                                htmlFor="directorObservation"
                                                className="text-sm font-medium text-slate-700"
                                            >
                                                Chequeo observación de clase Director/Subdirector
                                            </label>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="tracking"
                                                className="block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2"
                                            >
                                                Seguimiento al ciclo anterior
                                            </label>

                                            <div className="relative group">
                                                <textarea
                                                    id="tracking"
                                                    placeholder="Escribe el resumen del ciclo anterior..."
                                                    className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all outline-none resize-none"
                                                    {...register("tracking")}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {lastFeedback?.tracking !== "" && (
                                    <div className="relative pl-0 sm:pl-12">
                                        <div className="absolute left-0 top-1 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border-2 border-white ring-4 ring-white z-10">
                                            <Clock className="text-gray-700" />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-bold text-indigo-900 uppercase tracking-wider">
                                                    Seguimiento del {formatFullDate(lastFeedback?.createdAt ?? "")}
                                                </label>
                                            </div>

                                            <div className="relative group">
                                                <textarea
                                                    disabled
                                                    readOnly
                                                    defaultValue={lastFeedback?.tracking ?? ""}
                                                    className="w-full min-h-40 p-4 bg-white border-2 border-indigo-100 rounded-xl text-slate-800 shadow-sm placeholder-slate-400 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                        <button type="submit" className="bg-indigo-500 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={mutation.isPending}>Guardar</button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default FeedBackCreate;