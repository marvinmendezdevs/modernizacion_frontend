import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Modal from "./Modal";
import { deleteMetric, updateMetrics } from "@/services/metrisc.services";
import type { MetricsInfo, MetricsUpdate } from "@/types/metrics";
import { formatFullDate } from "@/utils/index.utils";

function DashboardAccesos() {
  const queryClient = useQueryClient();

  const { isLoading, isError, data } = useQuery<MetricsUpdate>({
    queryKey: ["accesos-update"],
    queryFn: updateMetrics,
    retry: false,
  });

  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [deleteInfo, setDeleteInfo] = useState<{
    dateReported: string;
    type: string;
    category: string;
  } | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const perPage = 15;

  const metricsList = useMemo<MetricsInfo[]>(() => {
    return data?.metrics ?? [];
  }, [data]);

  const totalPages = Math.ceil(metricsList.length / perPage);

  const paginatedMetrics = useMemo<MetricsInfo[]>(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return metricsList.slice(start, end);
  }, [metricsList, page]);

  const getFormRouteByType = (item: MetricsInfo) => {
    if (item.type === "Accesos") return "/dashboard/accesos/form";

    if (item.type === "Secciones") return "/dashboard/secciones/form";

    if (
      item.type === "Gestion_Escolar" ||
      item.type === "Gestión Escolar" ||
      item.type === "Gestion Escolar"
    ) {
      return "/dashboard/gestion-escolar/form";
    }

    return "/dashboard/update";
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  const openDeleteModal = (item: {
    id: number;
    dateReported: string;
    type: string;
    category: string;
  }) => {
    setDeleteId(item.id);
    setDeleteInfo({
      dateReported: item.dateReported,
      type: item.type,
      category: item.category,
    });
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
    setDeleteInfo(null);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMetric(id),
    onSuccess: async () => {
      setSuccessMsg("Métrica eliminada correctamente.");
      setErrorMsg(null);
      closeDeleteModal();

      await queryClient.invalidateQueries({
        queryKey: ["accesos-update"],
      });
    },
    onError: (error: Error) => {
      setSuccessMsg(null);
      setErrorMsg(error.message || "Ocurrió un error al eliminar la métrica.");
    },
  });

  const handleDelete = () => {
    if (deleteId === null) return;

    deleteMutation.mutate(deleteId);
  };

  if (isLoading) {
    return (
      <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
        <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin" />
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

      {successMsg && (
        <p className="mb-4 rounded-lg bg-green-100 text-green-700 px-4 py-2 text-sm">
          {successMsg}
        </p>
      )}

      {errorMsg && (
        <p className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">
          {errorMsg}
        </p>
      )}

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
            {metricsList.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              paginatedMetrics.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {formatFullDate(String(item.dateReported))}
                  </td>

                  <td className="px-3 py-2">{item.type}</td>

                  <td className="px-3 py-2">{item.category}</td>

                  <td className="px-3 py-2">
                    <div className="flex justify-center items-center gap-3">
                      <Link
                        to={getFormRouteByType(item)}
                        state={{ metric: item }}
                        title="Editar registro"
                      >
                        <Pencil className="size-5 text-indigo-700 cursor-pointer" />
                      </Link>

                      <Trash2
                        onClick={() =>
                          openDeleteModal({
                            id: item.id,
                            dateReported: String(item.dateReported),
                            type: String(item.type),
                            category: String(item.category),
                          })
                        }
                        className="size-5 text-red-800 cursor-pointer"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {metricsList.length > 0 && (
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

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">
              Eliminar métrica
            </h2>

            <p className="text-sm text-slate-600 mb-2">
              ¿Deseas eliminar esta métrica?
            </p>

            {deleteInfo && (
              <div className="mb-4 rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
                <p>
                  <span className="font-medium">Fecha:</span>{" "}
                  {formatFullDate(deleteInfo.dateReported)}
                </p>

                <p>
                  <span className="font-medium">Tipo:</span> {deleteInfo.type}
                </p>

                <p>
                  <span className="font-medium">Categoría:</span>{" "}
                  {deleteInfo.category}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm cursor-pointer disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardAccesos;