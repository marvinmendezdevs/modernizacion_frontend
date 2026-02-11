import { getPublicMetrics } from "@/services/schoolmanagement.services";
import type { DashboardPublicGS } from "@/types/schoolmanagement.type";
import { useQuery } from "@tanstack/react-query"
import StatCard from "../StatCard";
import { Check, PhoneCall, PhoneOff, School } from "lucide-react";
import { useState } from "react";

type DashboardTab = 'directores' | 'docentes';

function CallSMDashboard() {

    const [page, setPage] = useState<DashboardTab>("directores");

    const { isLoading, isError, data } = useQuery<DashboardPublicGS[]>({
        queryKey: ["dashboard-school-management"],
        queryFn: getPublicMetrics
    });

    const currentData = data?.[0]?.json[page];


    if (isLoading) {
        return (
            <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
                <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
                Cargando información...
            </p>
        );
    }

    if (isError || !data) {
        return (
            <p className="text-xs text-red-600 text-center p-3">
                ¡Error inespertado! contacte con soporte.
            </p>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-xl font-black">Registro de llamadas</p>
                    <p className="text-xs text-gray-600">Centro escolares del grupo 1, fase 2</p>
                </div>

                <div className="flex items-center gap-3">
                    <input className="p-2 bg-white border border-gray-200 rounded-lg" type="date" />
                    <div className="bg-white w-42 p-2 flex gap-3 justify-center rounded-lg text-xs border border-gray-200">
                        <button className={`${page === "directores" ? "bg-gray-100 font-bold" : ""} cursor-pointer px-2 p-1 rounded-lg`} onClick={() => setPage("directores")}>Directores</button>
                        <button className={`${page === "docentes" ? "bg-gray-100 font-bold" : ""} cursor-pointer px-"docentes" p-1 rounded-lg`} onClick={() => setPage("docentes")}>Docentes</button>
                    </div>
                </div>
            </div>


            <h2 className="text-xl font-black text-gray-600">Métricas de llamadas</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
                <StatCard
                    title={page.toUpperCase()}
                    value={currentData?.total ?? 0}
                    color="emerald"
                    icon={School}
                />

                <StatCard
                    title="Llamadas realizadas"
                    value={(currentData?.llamadas.respondidas ?? 0) + (currentData?.llamadas.no_respondidas ?? 0)}
                    color="blue"
                    icon={PhoneCall}
                />

                <StatCard
                    title="Llamadas respondidas"
                    value={currentData?.llamadas.respondidas ?? 0}
                    color="green"
                    icon={Check}
                />

                <StatCard
                    title="Llamadas no respondidas"
                    value={currentData?.llamadas.no_respondidas ?? 0}
                    color="red"
                    icon={PhoneOff}
                />
            </div>

            <div className="p-10 pt-3 mt-3 bg-white shadow rounded-lg">
                <h2 className="text-xl font-black mb-3 text-gray-600">Detalle de las llamadas</h2>
                <table className="w-full rounded-lg overflow-hidden">
                    <thead className="bg-indigo-50 border-b-2 border-indigo-600">
                        <tr>
                            <th>No.</th>
                            <th className="p-1">Caracterización</th>
                            <th className="p-1">Cantidad</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {Object.keys(currentData?.detalles ?? []).map((key, index) => (
                            <tr key={index}>
                                <td className="p-1 text-center">{index + 1}</td>
                                <td className="p-1">{key}</td>
                                <td className="p-1 text-center">
                                    <span className="inline-block bg-indigo-100 text-indigo-600 p-1 rounded-full px-2 text-xs">
                                        {currentData?.detalles[key] ?? 0}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default CallSMDashboard