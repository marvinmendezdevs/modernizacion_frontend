import { getSchoolByMonitor } from "@/services/schoolmanagement.services";
import type { SchoolByMonitorType } from "@/types/schoolmanagement.type";
import { useQuery } from "@tanstack/react-query"
import { Building, ChevronsUpDown, MapPin, School } from "lucide-react";
import SideDrawer from "../ui/SideDrawer";
import { useState } from "react";
import SchoolMonitorDetails from "./SchoolMonitorDetails";

function SchoolMonitor() {

    const [active, setActive] = useState<number | null >(null);
    const { isLoading, isError, data: schools } = useQuery<SchoolByMonitorType[]>({
        queryKey: ["school-by-monitor"],
        queryFn: getSchoolByMonitor,
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (isLoading){
        return (
            <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
                <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
                Cargando lista de docentes asignados...
            </p>
        );
    }

    if (isError){
        return (
            <p className="text-xs text-red-600 text-center p-3">
                ¡Error inespertado! contacte con soporte.
            </p>
        );
    }
    
    if(!schools) {
        return (
            <p className="text-xs text-red-600 text-center p-3">
                ¡Vaya! no tiene centros escolares asignados... contacte con soporte.
            </p>
        );
    }

    if(schools) return (
        <>
            <div className="space-y-2 mt-3">
                {schools.map(school => (
                    <div className="border border-gray-300 rounded p-3 flex flex-col items-center gap-3 md:flex-row" key={school.id}>
                        <div className="bg-indigo-600 p-3 rounded-full text-white">
                            <School />
                        </div>

                        <div className="flex-1">
                            <p className="text-lg font-black">{school.school.name}</p>
                            <div className="text-xs flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg">
                                    <Building className="size-4" />
                                    {school.schoolCode}
                                </div>

                                <div className="flex items-center lowercase">
                                    <MapPin className="size-4" />
                                    <p>{school.school.address}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button className="cursor-pointer p-3 rounded-full transition hover:bg-gray-100" onClick={ () => setActive(school.schoolCode) }>
                                <ChevronsUpDown />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {active && (
                <SideDrawer setActive={ setActive }>
                    <SchoolMonitorDetails
                        active={ active }
                    />
                </SideDrawer>
            )}

        </>
    )
}

export default SchoolMonitor