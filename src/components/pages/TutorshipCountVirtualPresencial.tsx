import { getTutorsCount } from "@/services/tutorship.services";
import type { TutorCountType } from "@/types/tutorship.types";
import { useQuery } from "@tanstack/react-query";

interface Props {
    setTutorType: (type: string) => void;
}

function TutorshipCountVirtualPresencial({ setTutorType }: Props) {

    const { isLoading, isError, data } = useQuery<TutorCountType>({
        queryKey: ["tutor-count"],
        queryFn: () => getTutorsCount(),
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (isLoading) return (
        <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
            <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
            Cargando información para el diagnóstico...
        </p>
    );

    if (isError) return (
        <p className="text-xs text-red-600 text-center p-3">
            ¡Error inespertado! contacte con soporte.
        </p>
    );
    if (data) return (
        <div className="grid gap-4 md:grid-cols-3 my-3">
            <button value="PRESENCIAL" onClick={() => setTutorType("PRESENCIAL")} className="shadow-inner p-4 bg-gray-50 rounded-lg text-start cursor-pointer">
                <p className="font-bold">Presenciales</p>
                <p className="font-bold text-5xl">{data.presenciales}</p>
                <p className="text-xs">Tutores</p>
            </button>

            <button value="VIRTUAL" onClick={() => setTutorType("VIRTUAL")} className="shadow-inner p-4 bg-gray-50 rounded-lg text-start cursor-pointer">
                <p className="font-bold">Virtuales</p>
                <p className="font-bold text-5xl">{data.virtuales}</p>
                <p className="text-xs">Tutores</p>
            </button>
        </div>
    )
}

export default TutorshipCountVirtualPresencial