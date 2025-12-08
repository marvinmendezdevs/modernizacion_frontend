import { useQuery } from "@tanstack/react-query";
import { getMetricsTutorship } from "@/services/tutorship.services";

type MetricsTutorshipType = {
    diagnosticos: number
    observaciones: number
}

function Tutorship() {
    const { data, error, isLoading } = useQuery<MetricsTutorshipType>({
        queryKey: ["tutorship"],
        queryFn: getMetricsTutorship,
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (isLoading) return <div>Cargando datos...</div>
    if (error) return <div>Error: {error.message}</div>
    if (data) return (
        <div>
            <h2 className="font-bold text-indigo-700 text-2xl">Resumen general</h2>

            <div className="grid gap-4 md:grid-cols-3 my-3">
                <div className="shadow-inner p-4 bg-gray-50 rounded-lg">
                    <p className="font-bold">Diagnósticos</p>
                    <p className="text-xs">realizados</p>

                    <p className="font-bold text-5xl">{data.diagnosticos}</p>
                </div>

                <div className="shadow-inner p-4 bg-gray-50 rounded-lg">
                    <p className="font-bold">Observaciones</p>
                    <p className="text-xs">realizadas</p>

                    <p className="font-bold text-5xl">{data.observaciones}</p>
                </div>
            </div>
        </div>
    )
}

export default Tutorship
