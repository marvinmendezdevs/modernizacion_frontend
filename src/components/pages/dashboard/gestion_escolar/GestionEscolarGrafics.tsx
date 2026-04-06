import { Pie, PieChart, Cell } from 'recharts';

const COLORS = [
  '#4285F4', '#FB8C00', '#34A853', '#FABB05', '#EA4335', '#46BDC6', '#7CB342', '#8E24AA',
  '#EF6C00', '#039BE5', '#D81B60', '#6D4C41', '#00ACC1', '#7E57C2', '#C0CA33', '#5C6BC0',
  '#F4511E', '#00897B', '#8D6E63', '#3949AB', '#43A047', '#FDD835', '#E53935', '#1E88E5',
  '#8E24AA', '#FB8C00', '#00838F', '#C2185B', '#9CCC65', '#FF7043', '#26A69A', '#AB47BC',
  '#EC407A', '#66BB6A', '#FFA726', '#29B6F6', '#FFCA28', '#26C6DA', '#9E9D24', '#5E35B1'
];

type InconsistenciaType = {
  motivo?: string;
  accion?: string;
  cantidad: number;
};

type GestionEscolarGraficsProps = {
  isAnimationActive?: boolean;
  inconsistencias: InconsistenciaType[];
};

type LabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  value?: number | string;
  percent?: number;
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
  percent,
}: LabelProps) => {
  if (
    cx == null ||
    cy == null ||
    midAngle == null ||
    innerRadius == null ||
    outerRadius == null ||
    value == null
  ) {
    return null;
  }

  if ((percent ?? 0) < 0.03) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {value}
    </text>
  );
};

function GestionEscolarGrafics({
  isAnimationActive = true,
  inconsistencias,
}: GestionEscolarGraficsProps) {
  const data = inconsistencias
    .map((item) => ({
      nombre: item.motivo ?? item.accion ?? '',
      cantidad: item.cantidad ?? 0,
    }))
    .filter((item) => item.nombre && item.nombre !== 'Total general');

  return (
    <div className="w-full flex flex-col lg:flex-row justify-center items-center gap-8">
      <div className="w-full lg:w-[520px] flex justify-center">
        <PieChart width={500} height={500}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={200}
            innerRadius={20}
            dataKey="cantidad"
            nameKey="nombre"
            label={renderCustomizedLabel}
            labelLine={false}
            isAnimationActive={isAnimationActive}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.nombre}-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </div>

      <div className="w-full lg:flex-1 justify-center items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-1">
          {data.map((item, index) => (
            <div
              key={`${item.nombre}-${index}`}
              className="flex items-start gap-3 rounded-lg p-1"
            >
              <div
                className="mt-1 h-4 w-4 rounded-sm shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 wrap-break-words">
                  {item.nombre}
                </p>
                <p className="text-xs text-gray-500">{item.cantidad}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GestionEscolarGrafics;