import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMonitorDashboard } from "@/services/schoolmanagement.services";
import { Clock4, Funnel, FunnelX, Presentation, UserPlus } from "lucide-react";
import { percentYes } from "@/utils/index.utils";
import type { MonitorRow, SchoolAnswers, TableRow } from "@/types/schoolmanagement.type";

function normYesNo(answers: unknown): "Si" | "No" | "" {
    const answer = (answers ?? "").toString().trim().toLowerCase();
    if (answer === "si") return "Si";
    if (answer === "no") return "No";
    return "";
}

function MonitorDashboard() {
    const { isLoading, isError, data } = useQuery<MonitorRow[]>({
        queryKey: ["monitor-dashboard"],
        queryFn: getMonitorDashboard,
    });

    const [departmentFilter, setDepartmentFilter] = useState("Todos");
    const [municipalityFilter, setMunicipalityFilter] = useState("Todos");
    const [districtFilter, setDistrictFilter] = useState("Todos");

    // ✅ búsqueda por código o nombre
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const pageSize = 10;

    const questions = data ?? [];

    const uniqueBySchool = useMemo(() => {
        const map = new Map<string, MonitorRow>();

        for (const item of questions) {
            const code = item.school?.code ?? item.schoolCode ?? "";
            if (!code) continue;

            const prev = map.get(code);
            if (!prev) {
                map.set(code, item);
                continue;
            }

            const prevTime = new Date(prev.submittedAt).getTime();
            const currTime = new Date(item.submittedAt).getTime();

            if (currTime >= prevTime) map.set(code, item);
        }

        return Array.from(map.values());
    }, [questions]);

    const contenido: TableRow[] = useMemo(() => {
        return uniqueBySchool.map((item) => {
            const ubicacion = item.school?.Districts;
            return {
                code: item.school?.code ?? item.schoolCode ?? "",
                name: item.school?.name ?? "",
                directorName: item.school?.directorName ?? "",
                directorPhone: item.school?.directorPhone ?? "",
                matricula: normYesNo(item.payload?.question_1),
                cargaHoraria: normYesNo(item.payload?.question_3),
                asignacionDocente: normYesNo(item.payload?.question_5),
                district: ubicacion?.district ?? "",
                municipality: ubicacion?.municipality ?? "",
                department: ubicacion?.department ?? "",
            };
        });
    }, [uniqueBySchool]);

    // ✅ sort sin mover "Todos"
    const departmentOptions = useMemo(() => {
        const opts = Array.from(new Set(contenido.map(item => item.department).filter(Boolean))).sort();
        return ["Todos", ...opts];
    }, [contenido]);

    const municipalityOptions = useMemo(() => {
        const opts = Array.from(new Set(contenido.map(item => item.municipality).filter(Boolean))).sort();
        return ["Todos", ...opts];
    }, [contenido]);

    const districtOptions = useMemo(() => {
        const opts = Array.from(new Set(contenido.map(item => item.district).filter(Boolean))).sort();
        return ["Todos", ...opts];
    }, [contenido]);

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();

        return contenido.filter(item => {
            const departamento = departmentFilter === "Todos" || item.department === departmentFilter;
            const municipio = municipalityFilter === "Todos" || item.municipality === municipalityFilter;
            const distrito = districtFilter === "Todos" || item.district === districtFilter;

            const matchSearch =
                q.length === 0 ||
                item.code.toLowerCase().includes(q) ||
                item.name.toLowerCase().includes(q);

            return departamento && municipio && distrito && matchSearch;
        });
    }, [contenido, departmentFilter, municipalityFilter, districtFilter, search]);

    useEffect(() => {
        setPage(1);
    }, [departmentFilter, municipalityFilter, districtFilter, search]);

    const filteredPayloads: SchoolAnswers[] = useMemo(() => {
        return filteredRows.map(item => ({
            question_1: item.matricula,
            question_3: item.cargaHoraria,
            question_5: item.asignacionDocente,
        }));
    }, [filteredRows]);

    const matriculaCount = percentYes(filteredPayloads, "question_1");
    const cargaHorariaCount = percentYes(filteredPayloads, "question_3");
    const asignacionCount = percentYes(filteredPayloads, "question_5");

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const paginatedRows = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, page]);

    const clearFilters = () => {
        setDepartmentFilter("Todos");
        setMunicipalityFilter("Todos");
        setDistrictFilter("Todos");
        setSearch("");
        setPage(1);
    };

    if (isLoading) {
        return (
            <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
                <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
                Cargando información de tutores...
            </p>
        );
    }

    if (isError) {
        return (
            <p className="text-xs text-red-600 text-center p-3">
                ¡Error inesperado! contacte con soporte.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:flex-wrap gap-4 w-full">
                <div className="shadow-inner p-4 bg-gray-50 rounded-lg w-full md:flex-1 md:min-w-[280px] flex flex-col justify-center md:justify-start md:items-start gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <UserPlus className="size-5 text-indigo-600" />
                        <p className="font-semibold">Matrícula</p>
                    </div>
                    <p className="text-4xl font-bold">{matriculaCount}</p>
                    <p className="text-xs">Registradas</p>
                </div>

                <div className="shadow-inner p-4 bg-gray-50 rounded-lg w-full md:flex-1 md:min-w-[280px] flex flex-col justify-center md:justify-start md:items-start gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <Clock4 className="size-5 text-indigo-600" />
                        <p className="font-semibold">Carga horaria</p>
                    </div>
                    <p className="text-4xl font-bold">{cargaHorariaCount}</p>
                    <p className="text-xs">Registradas</p>
                </div>

                <div className="shadow-inner p-4 bg-gray-50 rounded-lg w-full md:flex-1 md:min-w-[280px] flex flex-col justify-center md:justify-start md:items-start gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <Presentation className="size-5 text-indigo-600" />
                        <p className="font-semibold">Asignación docente</p>
                    </div>
                    <p className="text-4xl font-bold">{asignacionCount}</p>
                    <p className="text-xs">Registradas</p>
                </div>
            </div>



            <div className="space-y-2 mt-12">
                <div className="flex flex-col md:flex-row gap-2 items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Funnel className="size-5 text-indigo-600" />
                        <p className="text-xs">Filtros:</p>
                    </div>

                    <input type="search" className="border border-gray-200 rounded-md text-gray-600 px-3 py-2 text-xs w-full md:w-72" placeholder="Buscar por código o nombre..." value={search} onChange={(e) => setSearch(e.target.value)} />

                    <p className="font-semibold text-xs">Departamento</p>
                    <select className="border border-gray-200 rounded-md text-gray-600 px-3 py-2 text-xs cursor-pointer w-full md:w-auto" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                        {departmentOptions.map(department => (
                            <option key={department} value={department}>{department || "—"}</option>
                        ))}
                    </select>

                    <p className="font-semibold text-xs">Municipio</p>
                    <select className="border border-gray-200 rounded-md text-gray-600 px-3 py-2 text-xs cursor-pointer w-full md:w-auto" value={municipalityFilter} onChange={(e) => setMunicipalityFilter(e.target.value)}>
                        {municipalityOptions.map(municipality => (
                            <option key={municipality} value={municipality}>{municipality || "—"}</option>
                        ))}
                    </select>

                    <p className="font-semibold text-xs">Distrito</p>
                    <select className="border border-gray-200 rounded-md text-gray-600 px-3 py-2 text-xs cursor-pointer w-full md:w-auto" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
                        {districtOptions.map(district => (
                            <option key={district} value={district}>{district || "—"}</option>
                        ))}
                    </select>

                    <button type="button" onClick={clearFilters} className="text-red-600 hover:text-red-800 cursor-pointer"><FunnelX className="size-5 cursor-pointer" /></button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-gray-700">
                                <th className="w-26 py-2">Código</th>
                                <th className="w-86 py-2">Centro escolar</th>
                                <th className="w-66 py-2">Director</th>
                                <th className="w-36 py-2">Teléfono</th>
                                <th className="w-36 py-2">Matrícula</th>
                                <th className="w-38 py-2">Carga horaria</th>
                                <th className="w-36 py-2">Asignación docente</th>
                                <th className="w-36 py-2">Distrito</th>
                                <th className="w-36 py-2">Municipio</th>
                                <th className="w-36 py-2">Departamento</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 text-gray-700">
                            {paginatedRows.map((item) => (
                                <tr key={item.code}>
                                    <td className="w-26 px-2 py-5 truncate text-sm text-center">{item.code}</td>
                                    <td className="w-86 px-2 py-5 truncate text-sm">{item.name}</td>
                                    <td className="w-86 px-2 py-5 truncate text-sm">{item.directorName}</td>
                                    <td className="w-46 px-2 py-5 truncate text-center text-sm">{item.directorPhone}</td>
                                    <td className="w-36 px-2 py-5 truncate text-center text-sm">{item.matricula || "-"}</td>
                                    <td className="w-36 px-2 py-5 truncate text-center text-sm">{item.cargaHoraria || "-"}</td>
                                    <td className="w-36 px-2 py-5 truncate text-center text-sm">{item.asignacionDocente || "-"}</td>
                                    <td className="w-56 px-2 py-5 truncate text-sm">{item.district || "-"}</td>
                                    <td className="w-56 px-2 py-5 truncate text-sm">{item.municipality || "-"}</td>
                                    <td className="w-56 px-2 py-5 truncate text-sm">{item.department || "-"}</td>
                                </tr>
                            ))}

                            {filteredRows.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                                        No se encontraron resultados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredRows.length > 0 && (
                    <div className="flex justify-between items-center mt-4 text-xs">
                        <div className="text-xs text-slate-800">
                            <span className="font-semibold">{filteredRows.length} registros · Página</span>
                            <span className="font-semibold"> {page}</span>
                            <span className="font-semibold"> de {totalPages}</span>
                        </div>

                        <div className="flex gap-2">
                            <button className="px-3 py-1 border rounded disabled:opacity-40" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>

                            <button className="px-3 py-1 border rounded disabled:opacity-40" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MonitorDashboard;
