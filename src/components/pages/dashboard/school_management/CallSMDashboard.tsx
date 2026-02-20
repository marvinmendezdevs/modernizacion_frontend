import { getPublicMetrics } from "@/services/schoolmanagement.services";
import type { DashboardPublicGS } from "@/types/schoolmanagement.type";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import StatCard from "../StatCard";
import { Check, PhoneCall, PhoneOff, School } from "lucide-react";

type DashboardTab = "directores" | "docentes";

type Calls = {
  respondidas: number;
  no_respondidas: number;
};

type PageData = {
  total: number;
  detalles: Record<string, number>;
  llamadas: Calls;
};

type AggregatedData = PageData;

function normalizeDetalleKey(key: string): string {
  const k = key.trim();

  const map: Record<string, string> = {
    "Fallas en el servicios de internet": "Fallas en el servicio de internet",
  };

  return map[k] ?? k;
}

function aggregateRange(data: DashboardPublicGS[] | undefined, page: DashboardTab): AggregatedData {
  const initial: AggregatedData = {
    total: 0,
    llamadas: { respondidas: 0, no_respondidas: 0 },
    detalles: {},
  };

  if (!data?.length) return initial;

  return data.reduce<AggregatedData>((acc, item) => {
    const pageData: Partial<PageData> | undefined = item.json?.[page];
    if (!pageData) return acc;

    acc.total += Number(pageData.total ?? 0);

    acc.llamadas.respondidas += Number(pageData.llamadas?.respondidas ?? 0);
    acc.llamadas.no_respondidas += Number(pageData.llamadas?.no_respondidas ?? 0);

    const detalles = pageData.detalles ?? {};
    for (const rawKey of Object.keys(detalles)) {
      const key = normalizeDetalleKey(rawKey);
      acc.detalles[key] = (acc.detalles[key] ?? 0) + Number(detalles[rawKey] ?? 0);
    }

    return acc;
  }, initial);
}

function CallSMDashboard({
  startDate,
  endDate,
  page,
}: {
  startDate: string;
  endDate: string;
  page: DashboardTab;
}) {
  const { isLoading, isError, data } = useQuery<DashboardPublicGS[]>({
    queryKey: ["dashboard-school-management", startDate, endDate, page],
    queryFn: () => getPublicMetrics(startDate, endDate),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const currentData = useMemo(() => aggregateRange(data, page), [data, page]);

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
        ¡Error inespertado! contacte con soporte.
      </p>
    );
  }

  return (
    <>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <StatCard
          title={page.toUpperCase()}
          value={currentData.total}
          color="emerald"
          icon={School}
        />

        <StatCard
          title="Llamadas realizadas"
          value={currentData.llamadas.respondidas + currentData.llamadas.no_respondidas}
          color="blue"
          icon={PhoneCall}
        />

        <StatCard
          title="Llamadas respondidas"
          value={currentData.llamadas.respondidas}
          color="green"
          icon={Check}
        />

        <StatCard
          title="Llamadas no respondidas"
          value={currentData.llamadas.no_respondidas}
          color="red"
          icon={PhoneOff}
        />
      </div>

      {Object.keys(currentData.detalles).length > 0 && (
        <div className="p-10 pt-3 mt-3 bg-white shadow rounded-lg">
          <h2 className="text-xl font-black mb-3 text-gray-600">
            Detalle de las llamadas
          </h2>
          <table className="w-full rounded-lg overflow-hidden">
            <thead className="bg-indigo-50 border-b-2 border-indigo-600">
              <tr>
                <th>No.</th>
                <th className="p-1">Caracterización</th>
                <th className="p-1">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.keys(currentData.detalles).map((key, index) => (
                <tr key={key}>
                  <td className="p-1 text-center">{index + 1}</td>
                  <td className="p-1">{key}</td>
                  <td className="p-1 text-center">
                    <span className="inline-block bg-indigo-100 text-indigo-600 p-1 rounded-full px-2 text-xs">
                      {currentData.detalles[key] ?? 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default CallSMDashboard;