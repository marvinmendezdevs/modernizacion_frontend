import type { DashboardRecord } from '@/types/dashboard.types';
import { formatNumber } from '@/utils/index.utils';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
);

export type teacherDataProps = {
    teacherData: DashboardRecord[]
    title: string
}

/* type GeneralInformationType = teacherDataProps & {
    filterByDate: (date: string) => void
} */


function GeneralInformation({ teacherData, title }: teacherDataProps) {
    const newTeacherData = teacherData.filter((item) => item.group !== 3)
    // const currentDate = teacherData[0].dateReported;

    const [, , type] = title.split(" ");
    const sumTotal = newTeacherData.map(item => item.total);
    const sumAcess = newTeacherData.map(item => item.access);
    const sumDemo = newTeacherData.map(item => item.demo);

    const options = {
  responsive: true,
  maintainAspectRatio: false,
  // 1. Evita que las barras toquen los bordes laterales
  layout: {
    padding: {
      top: 5,    // Espacio extra arriba para los números
      right: 20,
      left: 10,
      bottom: 10
    }
  },
  // 2. Ajuste de ancho de barras para que se vean agrupadas
  barPercentage: 0.8,      // Ancho de la barra individual
  categoryPercentage: 0.6, // Espacio del grupo (ajusta para separar más los grupos)
  
  plugins: {
    datalabels: {
      anchor: 'end' as const,
      align: 'top' as const,
      offset: 8,           // Separación entre el número y la barra
      color: '#1e293b',    // Color oscuro para legibilidad
      font: {
        size: 13,
        weight: 700 as const,
      },
      // Formateador por si quieres añadir separador de miles
      formatter: (value: number) => value.toLocaleString(),
    },
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'rect', // Hace que el icono sea un cuadrado como en la imagen
        padding: 25,
        color: '#64748b',
        font: {
          size: 12,
          weight: 500 as const
        }
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#1e293b',
      padding: 12,
      borderRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        display: false, // Sin líneas verticales
      },
      border: {
        display: false, // Quita la línea del eje
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 12,
        },
      },
    },
    y: {
      // 3. LA CLAVE: Añade un margen porcentual automático al tope del eje
      grace: '15%', 
      beginAtZero: true,
      border: {
        display: false,
      },
      grid: {
        color: '#f1f5f9',
        drawTicks: false,
      },
      ticks: {
        color: '#94a3b8',
        stepSize: 600,
        padding: 15,
        font: {
          size: 11,
        },
      },
    },
  },
};

    const data = {
        // ESTOS SON TUS ITEMS (Eje X)
        labels: newTeacherData.map(item => `Grupo ${item.group}`),

        // AQUÍ ESTÁN LAS 3 BARRAS POR CADA ITEM
        datasets: [
            {
                label: `TOTAL ${type.toUpperCase()}`, // Barra 1
                data: sumTotal,       // Valores para cada escuela
                backgroundColor: 'rgba(53, 162, 235, 0.7)', // Azul
            },
            {
                label: `${type.toUpperCase()} CON ACCESO`, // Barra 2
                data: sumAcess,       // Valores para cada escuela
                backgroundColor: 'rgba(75, 192, 192, 0.7)', // Verde azulado
            },
            {
                label: `${type.toUpperCase()} DEMO`,      // Barra 3
                data: sumDemo,        // Valores para cada escuela
                backgroundColor: 'rgba(255, 99, 132, 0.7)', // Rojo/Rosado
            },
        ],
    };

    return (
        <div className="bg-white p-5 border border-gray-200 rounded-lg my-5">
            <div>
                <h2 className="font-bold text-slate-600 uppercase">{title}</h2>

                {/* <input type="date" value={currentDate} onChange={e => filterByDate(e.target.value)} /> */}
            </div>

            <div className="grid gap-5 mt-3 items-center lg:grid-cols-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Grupo</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acceso</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Demo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {newTeacherData.map((row) => (
                                <tr key={row.group} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                        Grupo {row.group}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-slate-600 font-medium">{formatNumber(row.total)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                            {formatNumber(row.access)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                            {formatNumber(row.demo)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot className="border-t-2">
                            <tr className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                    Total
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-slate-600 font-medium">{formatNumber(sumTotal.reduce((acc, item) => acc + item, 0))}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                        {formatNumber(sumAcess.reduce((acc, item) => acc + item, 0))}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                        {formatNumber(sumDemo.reduce((acc, item) => acc + item, 0))}
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="overflow-x-auto h-full">
                    <Bar options={options} data={data} />
                </div>
            </div>
        </div>
    )
}

export default GeneralInformation