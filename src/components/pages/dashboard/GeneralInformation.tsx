import type { DashboardRecord } from '@/types/dashboard.types';
import { calculatePercentage, formatNumber } from '@/utils/index.utils';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
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

function GeneralInformation({ teacherData, title }: teacherDataProps) {

    const totals = teacherData.reduce(
        (acc, item) => {
            acc.total += item.total;
            acc.access += item.access;
            acc.demo += item.demo;
            return acc;
        },
        { total: 0, access: 0, demo: 0 }
    );

    const percentageAccess = calculatePercentage(totals.total, totals.access);
    const percentageDemo = calculatePercentage(totals.total, totals.demo);

    return (
        <div className="bg-white p-5 border border-gray-200 rounded-lg my-5">
            <div className='font-bold text-slate-600 uppercase'>
                <h2>{title}</h2>
            </div>

            <div className="gap-5 mt-3 items-center w-full">
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
                            {teacherData.map((row) => (
                                <tr key={row.group} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                    Grupo {row.group}
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <span className="text-slate-600 font-medium">
                                    {formatNumber(row.total)}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-center align-middle">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                        {formatNumber(row.access)}
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-700">
                                        ({calculatePercentage(row.total, row.access)}%)
                                    </span>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-center align-middle">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                        {formatNumber(row.demo)}
                                    </span>
                                    <span className="text-[10px] font-semibold text-amber-700">
                                        ({calculatePercentage(row.total, row.demo)}%)
                                    </span>
                                    </div>
                                </td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot className="border-t-2">
                            <tr className="hover:bg-slate-50/80 transition-colors group font-semibold">
                                <td className="px-6 py-4 text-slate-900 align-middle">
                                Total
                                </td>

                                <td className="px-6 py-4 text-center align-middle">
                                <span className="text-slate-600 font-medium">
                                    {formatNumber(totals.total)}
                                </span>
                                </td>

                                <td className="px-6 py-4 text-center align-middle">
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                    {formatNumber(totals.access)}
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-700">
                                    ({percentageAccess}%)
                                    </span>
                                </div>
                                </td>

                                <td className="px-6 py-4 text-center align-middle">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                        {formatNumber(totals.demo)}
                                        </span>
                                        <span className="text-[10px] font-semibold text-amber-700">
                                        ({percentageDemo}%)
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>

                    </table>
                </div>
            </div>
        </div>
    )
}

export default GeneralInformation;