import { getDataPublic } from "@/services/tutorship.services";
import { useQuery } from "@tanstack/react-query";
import StatCard from "../StatCard";
import type { ResponseSectionSchema } from "@/types/intruments.types";
import { Laptop, ListTodo, School } from "lucide-react";
import { useMemo } from "react";
import { usePagination } from "@/hooks/usePagination";
import type { VirtualSessionType } from "@/types/tutorship.types";

type QueryResponse = {
    diagnostic: ResponseSectionSchema[]
    virtualSessions: VirtualSessionType[]
}

type NewSchoolType = {
    code: string,
    name: string,
    count: number
}

type MyAcc = {
    [key: string]: NewSchoolType
}

function GeneralInfo({ startDate, endDate }: { startDate: string, endDate: string }) {

    const { isLoading, isError, data } = useQuery<QueryResponse>({
        queryKey: ["general-tutoria", startDate, endDate],
        queryFn: () => getDataPublic(startDate, endDate)
    });

    const diagnosticsArray = useMemo(() => {
        if (!data || !data.diagnostic) return [];

        const diagnostics = data.diagnostic.map(diag => diag.school);
        const grouped = diagnostics.reduce<MyAcc>((acc, item) => {
            if (!acc[item.code]) {
                acc[item.code] = { code: item.code, name: item.name, count: 1 };
            } else {
                acc[item.code].count += 1;
            }
            return acc;
        }, {});

        return Object.values(grouped);
    }, [data]);

    const {
        itemsPage,
        handleSetSearchTerm,
        totalPage,
        page,
        setPage
    } = usePagination<NewSchoolType>({
        data: diagnosticsArray,
        perPage: 5,
        fn: (item, search) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.code.includes(search)
    });


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
        <div>
            <div className="grid gap-3 md:grid-cols-3">
                <StatCard
                    title="Diagnósticos realizados"
                    icon={ListTodo}
                    color="emerald"
                    value={data.diagnostic.length}
                />
                <StatCard
                    title="Centros escolares atendidos"
                    icon={School}
                    color="blue"
                    value={diagnosticsArray.length} // Usamos la longitud del array procesado
                />
                <StatCard
                    title="Tutorías virtuales"
                    icon={Laptop}
                    color="blue"
                    value={data.virtualSessions.length} // Usamos la longitud del array procesado
                />
            </div>

            <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm mt-5">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="font-black text-xl text-indigo-600">
                            Centros escolares atendidos por tutores
                        </h2>
                        <p className="text-xs text-slate-500">Listado detallado por código y conteo</p>
                    </div>

                    {/* Input de búsqueda conectado al Hook */}
                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Buscar centro o código..."
                            onChange={handleSetSearchTerm}
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </header>

                {/* Tabla con Scroll Horizontal en móvil */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-slate-50 border-b border-gray-200">
                            <tr className="text-left text-xs uppercase tracking-wider text-slate-600">
                                <th className="p-3 font-bold">Código</th>
                                <th className="p-3 font-bold">Nombre del Centro</th>
                                <th className="p-3 font-bold text-center">Diagnósticos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {itemsPage.length > 0 ? (
                                itemsPage.map((ce) => (
                                    <tr key={ce.code} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="p-3 text-sm font-mono text-indigo-600">{ce.code}</td>
                                        <td className="p-3 text-sm text-slate-700">{ce.name}</td>
                                        <td className="p-3 text-sm text-center">
                                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">
                                                {ce.count}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-400 italic">
                                        No se encontraron centros que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <footer className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-4">
                    <p className="text-sm text-slate-500">
                        Mostrando página <span className="font-bold text-slate-800">{page}</span> de{" "}
                        <span className="font-bold text-slate-800">{totalPage}</span>
                    </p>

                    <div className="inline-flex shadow-sm rounded-md" role="group">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={page === totalPage || totalPage === 0}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border-t border-b border-r border-gray-200 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </footer>
            </div>

        </div>
    )
}

export default GeneralInfo