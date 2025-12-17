import { getTutorsInfo } from "@/services/tutorship.services";
import type { TutorCountType } from "@/types/auth.types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import TutorshipCountVirtualPresencial from "./TutorshipCountVirtualPresencial";
import TutorshipInfoTutores from "./TutorshipInfoTutores";

type QueryType = {
    data: TutorCountType[]
    meta: {
        page: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    }
}

function TutorLeader() {
    const [tutorType, setTutorType] = useState("PRESENCIAL");
    const [page, setPage] = useState(1);
    const { isLoading, isError, data } = useQuery<QueryType>({
        queryKey: ["tutors-info", tutorType, page],
        queryFn: () => getTutorsInfo(tutorType, page),
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (isLoading) return (
        <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
            <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
            Cargando información de tutores...
        </p>
    );

    if (isError) return (
        <p className="text-xs text-red-600 text-center p-3">
            ¡Error inespertado! contacte con soporte.
        </p>
    );

    if (data) return (
        <>
            <h2 className="text-lg font-black text-indigo-600">Información de tutores</h2>
            <TutorshipCountVirtualPresencial setTutorType={setTutorType} />
            <TutorshipInfoTutores
                tutor={data.data}
                meta={data.meta}
                setPage={setPage}
            />
        </>
    )
}

export default TutorLeader