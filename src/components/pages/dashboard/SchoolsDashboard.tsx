import { Funnel, School } from "lucide-react";
import { useState } from "react";
import StatCard from "./StatCard";
import { getAllSchools } from "@/services/school.services";
import type { SchoolInfo } from "@/types/schoolmanagement.type";
import { useQuery } from "@tanstack/react-query";
import { cleanSearchTerm } from "@/utils/index.utils";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/ui/Pagination";

function SchoolsDashboard() {
  const { isLoading, isError, data: schools } = useQuery<SchoolInfo[]>({
    queryKey: ["allSchools"],
    queryFn: getAllSchools,
    retry: false,
  });

  const [groupSelected, setGroupSelected] = useState<string>("");

  const grupo1 = schools?.filter((items) => items.block === "1");
  const grupo2 = schools?.filter((items) => items.block === "2");
  const totalSchools = schools?.filter((items) => items.block !== "Sin grupo" && items.block !== "3")

  const schoolFiltered = (school: SchoolInfo, searchTerm: string) => {
    const term = cleanSearchTerm(searchTerm.trim());
    const matchesText = !term || school.code.includes(searchTerm) || cleanSearchTerm(school.name).includes(term) || school.block.includes(searchTerm);
    const matchesGroup = !groupSelected || school.block === groupSelected;

    return matchesText && matchesGroup;
  };

  const { handleSetSearchTerm, totalPage, itemsPage: schoolsPage, setPage, page } =
    usePagination<SchoolInfo>({
      data: totalSchools ?? [],
      perPage: 5,
      fn: schoolFiltered,
    });

  if (isLoading) {
    return (
      <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
        <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
        Cargando información...
      </p>
    );
  }

  if (isError || !schools) {
    return (
      <p className="text-xs text-red-600 text-center p-3">
        ¡Error inespertado! contacte con soporte.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 mt-5 md:grid-cols-3 gap-6">
        <StatCard title="Total de Centros Escolares" value={Number(totalSchools?.length)} icon={School} color="emerald"/>
        <StatCard title="Grupo 1" value={Number(grupo1?.length)} icon={School} color="blue" />
        <StatCard title="Grupo 2" value={Number(grupo2?.length)} icon={School} color="blue" />
      </div>

      <div className="bg-white mt-5 p-3 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
          <div className="w-full">
            <div className="flex items-center text-gray-600 my-2">
              <Funnel className="size-5" />
              <p className="w-auto">Filtrar por Centro Escolar</p>
            </div>
            <input
              className="p-2 border border-gray-300 rounded-lg block mb-3 outline-0 w-full md:ms-auto"
              type="search"
              placeholder="Ingrese el código o nombre del centro escolar"
              onChange={(e) => {
                handleSetSearchTerm(e);
                setPage(1);
              }}
            />
          </div>

          <div className="w-full">
            <div className="flex items-center text-gray-600 my-2">
              <Funnel className="size-5" />
              <p className="w-auto">Filtrar por grupo</p>
            </div>

            <select
              className="p-2 border border-gray-300 rounded-lg block mb-3 outline-0 w-full md:ms-auto"
              value={groupSelected}
              onChange={(e) => {
                setGroupSelected(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              <option value="1">Grupo 1</option>
              <option value="2">Grupo 2</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr className="text-left text-xs uppercase tracking-wider text-slate-600">
                <th className="p-3 font-bold">Código</th>
                <th className="p-3 font-bold">Nombre del Centro</th>
                <th className="p-3 font-bold text-center">Grupo</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {schoolsPage.length > 0 ? (
                schoolsPage.map((ce) => (
                  <tr key={ce.code} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-3 text-sm font-mono text-indigo-600">{ce.code}</td>
                    <td className="p-3 text-sm text-slate-700">{ce.name}</td>
                    <td className="p-3 text-sm text-center">
                      <span className="text-indigo-700 px-2 py-1 rounded-full font-bold">
                        {ce.block}
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
        <Pagination setPage={setPage} totalPage={totalPage} page={page} />
      </div>
    </div>
  );
}

export default SchoolsDashboard;
