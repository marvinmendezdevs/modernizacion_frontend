import type { DashboardRecord } from "@/types/dashboard.types";
import { formatFullDate } from "@/utils/index.utils";
import { useMemo, useState } from "react";
import type { LabelProps } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, } from "recharts";


type TeachersGraficsProps = {
  onTimeInfo: DashboardRecord[];
};

type ChartRow = {
  name: "Acceso" | "Demo" | "Total";
  value: number;
};

const isoDay = (value: string) => {
  const t = Date.parse(value);
  if (Number.isNaN(t)) return "";
  return new Date(t).toISOString().split("T")[0];
};

const buildBars = (g: DashboardRecord): ChartRow[] => [
  { name: "Acceso", value: g.access },
  { name: "Demo", value: g.demo },
  { name: "Total", value: g.total },
];

function TeachersGrafics({ onTimeInfo }: TeachersGraficsProps) {
  const [activeGroup, setActiveGroup] = useState<1 | 2>(1);

  const { group1Cards, group2Cards } = useMemo(() => {
    const byDayGroup = new Map<string, DashboardRecord>();

    for (const row of onTimeInfo) {
      const day = isoDay(row.dateReported);
      if (!day) continue;
      const key = `${day}-${row.group}`;
      byDayGroup.set(key, row);
    }

    const days = Array.from(
      new Set(onTimeInfo.map((r) => isoDay(r.dateReported)).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    const group1Cards = days
      .map((day) => {
        const row = byDayGroup.get(`${day}-1`);
        return row ? { day, data: buildBars(row) } : null;
      })
      .filter((x): x is { day: string; data: ChartRow[] } => x !== null);

    const group2Cards = days
      .map((day) => {
        const row = byDayGroup.get(`${day}-2`);
        return row ? { day, data: buildBars(row) } : null;
      })
      .filter((x): x is { day: string; data: ChartRow[] } => x !== null);

    return { group1Cards, group2Cards };
  }, [onTimeInfo]);

  const cards = activeGroup === 1 ? group1Cards : group2Cards;
  const title =
    activeGroup === 1
      ? "Grupo 1 - Acumulado por día"
      : "Grupo 2 - Acumulado por día";

  return (
    <div className="border-b-2 border-gray-300 pb-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-indigo-700">{title}</h2>

        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveGroup(1)}
            className={[
              "px-3 py-1.5 text-sm rounded-lg transition cursor-pointer",
              activeGroup === 1
                ? "bg-white text-indigo-700 shadow-sm cursor-pointer"
                : "text-slate-600 hover:text-slate-800 cursor-pointer",
            ].join(" ")}
          >
            Grupo 1
          </button>
          <button
            type="button"
            onClick={() => setActiveGroup(2)}
            className={[
              "px-3 py-1.5 text-sm rounded-lg transition cursor-pointer",
              activeGroup === 2
                ? "bg-white text-indigo-700 shadow-sm cursor-pointer"
                : "text-slate-600 hover:text-slate-800 cursor-pointer",
            ].join(" ")}
          >
            Grupo 2
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-6 w-max pb-2">
          {cards.map(({ day, data }) => (
            <div
              key={day}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-[360px]"
            >
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                {formatFullDate(day)}
              </h3>

              <div className="h-[300px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} barCategoryGap="25%" margin={{ top: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />

                    <Bar dataKey="value" barSize={70} radius={[6, 6, 0, 0]}>
                      <LabelList
                        dataKey="value"
                        position="top"
                        content={(props: LabelProps) => {
                          const { x, y, width, value, index } = props;

                          if (
                            typeof x !== "number" ||
                            typeof y !== "number" ||
                            typeof width !== "number" ||
                            typeof index !== "number" ||
                            typeof value !== "number"
                          ) {
                            return null;
                          }

                          const entry = data[index];

                          const textColor =
                            entry.name === "Total"
                              ? "rgb(54, 162, 235)"
                              : entry.name === "Acceso"
                              ? "rgb(75, 192, 192)"
                              : "rgb(255, 99, 132)";

                          return value > 0 ? (
                            <text
                              x={x + width / 2}
                              y={y - 8}
                              fill={textColor}
                              textAnchor="middle"
                              fontSize={13}
                              fontWeight={600}
                            >
                              {value.toLocaleString("en-US")}
                            </text>
                          ) : null;
                        }}
                      />

                      {data.map((entry) => {
                        const fillColor =
                          entry.name === "Total"
                            ? "rgba(54, 162, 235, 0.5)"
                            : entry.name === "Acceso"
                            ? "rgba(75, 192, 192, 0.5)"
                            : "rgba(255, 99, 132, 0.5)";

                        const strokeColor =
                          entry.name === "Total"
                            ? "rgb(54, 162, 235)"
                            : entry.name === "Acceso"
                            ? "rgb(75, 192, 192)"
                            : "rgb(255, 99, 132)";

                        return (
                          <Cell
                            key={entry.name}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeachersGrafics;
