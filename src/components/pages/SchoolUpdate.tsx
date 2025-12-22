import { getSchoolByCode } from "@/services/school.services";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router"

function SchoolUpdate() {
    const { schoolCode } = useParams();

    const { isLoading, isError, data: school } = useQuery({
        queryKey: ["school", schoolCode],
        queryFn: () => {
            if(!schoolCode){
                throw Error("404: Escuela no encontrada");
            }

            return getSchoolByCode(schoolCode);
        }
    });

    if (isLoading) {
        return (
            <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
                <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
                Cargando lista de docentes asignados...
            </p>
        );
    }

    if (isError || !schoolCode || !school) {
        return (
            <p className="text-xs text-red-600 text-center p-3">
                ¡Error inespertado! contacte con soporte.
            </p>
        );
    }

    return (
        <div>
            <div>
                <h2 className="text-lg font-black text-indigo-600">Datos del centro escolar</h2>
                <p className="text-sm text-slate-600">Actualiza los datos del centro escolar</p>
            </div>
        </div>
    )
}

export default SchoolUpdate