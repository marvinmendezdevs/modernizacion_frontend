import { useMemo, useState } from "react";
import { updateMetrics } from "@/services/metrisc.services";
import type { metricsUpdate } from "@/types/metrics";
import { useQuery } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import Modal from "./Modal";
import { formatFullDate } from "@/utils/index.utils";

function DashboardAccesos() {
  const { isLoading, isError, data } = useQuery<metricsUpdate>({
    queryKey: ["accesos-update"],
    queryFn: updateMetrics,
    retry: false,
  });

  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const perPage = 8;

  const metrics = useMemo(() => data?.metrics ?? [], [data?.metrics]);

  const totalPages = Math.ceil(metrics.length / perPage);

  const paginatedMetrics = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return metrics.slice(start, end);
  }, [metrics, page]);

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (isLoading) {
    return (
      <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
        <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
        Cargando información...
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
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xl font-semibold text-indigo-700">Métricas</p>

        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Agregar nuevo
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-300">
            {metrics.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              paginatedMetrics.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {formatFullDate(String(item.dateReported))}
                  </td>
                  <td className="px-3 py-2">{item.type}</td>
                  <td className="px-3 py-2">{item.category}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center items-center gap-3">
                      <Edit className="size-5 text-blue-800 cursor-pointer" />
                      <Trash2 className="size-5 text-red-800 cursor-pointer" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {metrics.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Anterior
            </button>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
}

export default DashboardAccesos;