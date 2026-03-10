import { getFeedback } from "@/services/tutorship.services";
import type { UserType } from "@/types/auth.types";
import type { TeacherType } from "@/types/index.types";
import type { CoachingSessionType } from "@/types/intruments.types";
import { formatDate, getHours } from "@/utils/index.utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router"

type UseQueryType = CoachingSessionType & {
    teacher: TeacherType,
    tutor: UserType
}

function FeedBackView() {
    const { idFeedBack } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery<UseQueryType>({
        queryKey: ['feedback', idFeedBack],
        queryFn: () => {
            if(!idFeedBack){
                throw Error('Error inesperado');
            }

            return getFeedback(Number(idFeedBack));
        },
        retry: false,
        refetchOnWindowFocus: false,
    });


    if (isLoading) return (
        <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
            <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
            Cargando retroalimentación...
        </p>
    )

    if (isError) return (
        <p className="text-xs text-red-600 text-center p-3">
            ¡Error inespertado! contacte con soporte.
        </p>
    );

    if(data) return (
        <>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-black text-indigo-600">Detalles del último informe</h2>
                <button className="bg-indigo-600 text-white text-xs py-1 px-2 rounded-lg" onClick={ () => navigate(-1) }>
                    Volver
                </button>
            </div>
            <p className="text-sm text-gray-600 mb-3"><span className="font-bold">Propósito:</span> dar a conocer al docente el informe de la sesión observada, resaltando fortalezas y presentando áreas de mejora para el fortalecimiento de su práctica</p>

            <div className="bg-gray-100 border border-gray-300 p-3 rounded">
                <p className="font-bold">Fecha: <span className="font-normal">{formatDate(data.createdAt)}, {getHours(data.createdAt)}</span></p>
                <p className="font-bold">Docente observado: <span className="font-normal">{data.teacher.name}</span></p>
                <p className="font-bold">Observador: <span className="font-normal">{data.tutor.name}</span></p>
                <p className="font-bold">Director: <span className="font-normal">{data.directorName}</span></p>
            </div>

            <div className="border-t border-gray-300 mt-5 py-5">
                <p className="font-bold text-lg">1. Criterios de observación</p>
                <ol className="ms-8 text-gray-700 list-disc mb-4">
                    {data.selectedCriteria.map((criteria, index) => (
                        <li key={index}>{criteria}</li>
                    ))}
                </ol>
                <p className="font-bold text-lg">2. Recomendaciones</p>
                <ol className="ms-8 text-gray-700 list-disc mb-4">
                    {data.recommendations?.split('\n').map((criteria, index) => (
                        <li key={index}>{criteria}</li>
                    ))}
                </ol>

                <p className="font-bold text-lg">3. Compromisos</p>
                <ol className="ms-8 text-gray-700 list-disc mb-4">
                    {data.commitments?.split('\n').map((criteria, index) => (
                        <li key={index}>{criteria}</li>
                    ))}
                </ol>
            </div>
        </>
    )
}

export default FeedBackView