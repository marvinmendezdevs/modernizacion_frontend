import FeedBackForm from "@/components/pages/FeedBackForm";
import { getObservationById } from "@/services/tutorship.services";
import type { ResponseSectionSchema } from "@/types/intruments.types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router"

function Feedback() {
    const { observationId } = useParams();

    const { data, isLoading, isError } = useQuery<ResponseSectionSchema>({
        queryKey: ["observation", observationId],
        queryFn: () => {
            if (!observationId) {
                throw new Error("No se proporciono un id de observacion");
            }

            return getObservationById(Number(observationId));
        },
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
                <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
                Cargando lista de docentes asignados...
            </p>
        );
    }

    if (isError) {
        return (
            <p className="text-xs text-red-600 text-center p-3">
                ¡Error inespertado! contacte con soporte.
            </p>
        );
    }

    if (data) return (
        <div>
            <FeedBackForm
                observation={data}
            />
        </div>
    )
}

export default Feedback