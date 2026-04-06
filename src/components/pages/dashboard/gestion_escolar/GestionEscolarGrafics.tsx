import { Pie, PieChart, Sector, type PieLabelRenderProps, type PieSectorShapeProps } from 'recharts';

const RADIAN = Math.PI / 180;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const data = [
  { name: 'A', value: 400 },
  { name: 'B', value: 300 },
  { name: 'C', value: 300 },
  { name: 'D', value: 200 },
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null;
  }

  const ncx = Number(cx);
  const ncy = Number(cy);
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > ncx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

const MyCustomPie = (props: PieSectorShapeProps) => {
  const index = props.index ?? 0;
  return <Sector {...props} fill={COLORS[index % COLORS.length]} />;
};

function GestionEscolarGrafics({ isAnimationActive = true }: { isAnimationActive?: boolean }) {
  return (
    <PieChart style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', aspectRatio: 1 }} responsive>
      <Pie
        data={data}
        dataKey="value"
        labelLine={false}
        label={renderCustomizedLabel}
        isAnimationActive={isAnimationActive}
        shape={MyCustomPie}
      />
    </PieChart>
  );
}

export default GestionEscolarGrafics;