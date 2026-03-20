import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

type GradoItem = {
  grado: number;
  clasesTotales: number;
  clasesEfectivas: number;
};

type CustomLabelProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number | string;
};

function ReceivedLabel(props: CustomLabelProps) {
  const { x = 0, y = 0, width = 0, height = 0, value } = props;

  if (!value || Number(width) < 22) return null;

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={12}
      fontWeight={600}
    >
      {value}
    </text>
  );
}

function TotalLabel(props: CustomLabelProps) {
  const { x = 0, y = 0, width = 0, height = 0, value } = props;

  if (!value || Number(width) < 22) return null;

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={12}
      fontWeight={600}
    >
      {value}
    </text>
  );
}

function GraficsSecciones({ grados }: { grados: GradoItem[] }) {
  const data = grados.map((item) => ({
    name: `${item.grado}°`,
    recibidas: item.clasesEfectivas,
    total: item.clasesTotales,
    restantes: Math.max(item.clasesTotales - item.clasesEfectivas, 0),
  }));

  const maxTotal =
    data.length > 0 ? Math.max(...data.map((item) => item.total)) : 0;

  if (data.length === 0) {
    return (
      <div className="w-full h-120 bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center justify-center">
        <p className="text-sm text-slate-500">
          No hay datos de grados para mostrar.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-120 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <p className="text-xl font-semibold mb-3">
        Clases recibidas por grado
      </p>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          barCategoryGap={14}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, maxTotal]} />
          <YAxis dataKey="name" type="category" width={40} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "recibidas") return [value, "Clases recibidas"];
              if (name === "restantes") return [value, "Clases faltantes"];
              return [value, name];
            }}
            labelFormatter={(label) => `Grado ${label}`}
          />

          <Bar
            dataKey="recibidas"
            stackId="clases"
            fill="#4f39f6"
            radius={[8, 0, 0, 8]}
            barSize={22}
          >
            <LabelList dataKey="recibidas" content={<ReceivedLabel />} />
          </Bar>

          <Bar
            dataKey="restantes"
            stackId="clases"
            fill="#008236"
            radius={[0, 8, 8, 0]}
            barSize={22}
          >
            <LabelList dataKey="total" content={<TotalLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GraficsSecciones;