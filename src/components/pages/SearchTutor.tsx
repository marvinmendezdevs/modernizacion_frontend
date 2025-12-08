import { getTeachersByTutors } from "@/services/tutorship.services";
import type { TeacherTutorType } from "@/types/tutorship.types";
import { getCategoryFromScore } from "@/utils/index.utils";
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router";

type SearchTutorType = {
    search: string
}

function SearchTutor({ search }: SearchTutorType) {
    const { data, isLoading, isError } = useQuery<TeacherTutorType>({
        queryKey: ['teachers-by-tutor', search],
        queryFn: () => getTeachersByTutors(search),
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (isLoading) return (
        <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
            <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
            Cargando lista de docentes asignados...
        </p>
    );

    if (isError) return (
        <p className="text-xs text-red-600 text-center p-3">
            ¡Error inespertado! contacte con soporte.
        </p>
    );

    const verifyDiagnostics = () => {
        if(data){
            return data.responses.length;
        }
        
        return 0
    }

    verifyDiagnostics();

    if (data) return (
        <div className="my-5">
            <div className="flex justify-between items-center">
                <div className="text-gray-700">
                    <p className="font-bold">{data.name}</p>
                    <p className="text-sm"><span></span>{data.email}</p>
                    <p className="text-sm"><span>DUI:</span>{data.dui}</p>
                    <p className="text-sm"><span>Tel.:</span>{data.telephone}</p>

                    {verifyDiagnostics() && (
                        <Link to={"/"} className="text-xs bg-indigo-600 text-white py-1 px-3 rounded-lg mt-2 inline-block hover:bg-indigo-700">
                            Ver observaciones
                        </Link>
                    )}
                </div>

                <div>
                    {verifyDiagnostics() && (
                        <div>
                            <button className="text-xs bg-green-600 p-1 rounded text-white hover:bg-green-700">
                                Diagnóstico: <span className="font-bold">{getCategoryFromScore(data.responses[0].payload.score)}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3 overflow-x-auto">
                {data.assignments.length ? (
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b-2">
                            <tr>
                                <th className="p-2">Código</th>
                                <th className="p-2">Centro escolar</th>
                                <th className="p-2">Clase</th>
                                <th className="p-2">Turno</th>
                                <th className="p-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.assignments.map(assignament => (
                                <tr key={assignament.id}>
                                    <td className="p-2">{assignament.section.school.code}</td>
                                    <td className="p-2">{assignament.section.school.name}</td>
                                    <td className="p-2">{assignament.section.grade} {assignament.section.track === 'none' ? '' : assignament.section.track} {assignament.section.subtrack === 'none' ? '' : assignament.section.subtrack} {assignament.section.sectionClass} - {assignament.subject}</td>
                                    <td className="p-2">{assignament.section.shift}</td>
                                    <td className="p-2">
                                        {!verifyDiagnostics() && (
                                            <Link className="text-xs rounded-lg bg-indigo-700 text-white p-1" to={`/diagnostico/${data.id}/${assignament.sectionId}`}>Diagnóstico</Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p>No hay asignación...</p>}
            </div>
        </div>

    )
}

export default SearchTutor