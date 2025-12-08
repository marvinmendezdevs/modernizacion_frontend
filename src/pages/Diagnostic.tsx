import DiagnosticForm from "@/components/pages/DiagnosticForm";
import { getTeacherBySection } from "@/services/tutorship.services";
import type { TeacherSectionUser } from "@/types/tutorship.types";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router"

function Diagnostic() {
    const {teacher, section} = useParams();

    const {data, isLoading, isError} = useQuery<TeacherSectionUser>({
        queryKey: ['teacher-section'],
        queryFn: async () => {
            if (!teacher || !section) {
                throw new Error("Parámetros faltantes");
            }

            return await getTeacherBySection(Number(teacher), Number(section));
        }
    });

    if(!teacher || !section) return <Navigate to="/" replace />

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


    if(data) return (
        <>
            <div className="flex gap-3 flex-col md:flex-row md:justify-between">
                <div className="flex-1">
                    <p className="text-lg font-bold">{data.teacher.name}</p>
                    <p className="text-xs text-gray-700">{data.teacher.email}</p>
                    <p className="text-xs text-gray-700"><span className="font-bold">DUI: </span>{data.teacher.dui}</p>
                </div>
                <div className="text-xs md:text-end md:w-1/4">
                    <p className="font-bold">{data.section.schoolCode}</p>
                    <p>{data.section.school.name}</p>
                    <p>
                        {data.section.grade}o. {data.section.track === 'none' ? '' : data.section.track} {data.section.subtrack === 'none' ? '' : data.section.subtrack} "{data.section.sectionClass}" - {data.subject}
                    </p>
                </div>
            </div>

            <DiagnosticForm
                dataAccess={data}
            />
        </>
    )
}

export default Diagnostic