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
    const newTeacherData = teacherData.filter((item) => item.group !== 3)

    const [, ,] = title.split(" ");
    const sumTotal = newTeacherData.map(item => item.total);
    const sumAcess = newTeacherData.map(item => item.access);
    const sumDemo = newTeacherData.map(item => item.demo);

    return (
        <div className="bg-white p-5 border border-gray-200 rounded-lg my-5">
            <div>
                <h2 className="font-bold text-slate-600 uppercase">{title}</h2>

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
            </div>
        </div>
    )
}

export default GeneralInformation