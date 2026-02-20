import { Calendar } from "lucide-react";
import CallSMDashboard from "./CallSMDashboard"
import { useState } from "react";

type DashboardTab = 'directores' | 'docentes';

function SchoolManagementDashboard() {

    const getTodayDate = () => new Date().toLocaleDateString('sv-SE');

    const [startDate, setStartDate] = useState(getTodayDate());
    const [endDate, setEndDate] = useState(getTodayDate());

    const [page, setPage] = useState<DashboardTab>("directores");

  return (
    <>

        <div>
            <p className="text-xl font-black">Registro de llamadas</p>
            <p className="text-xs text-gray-600">Centro escolares del grupo 1, fase 2</p>
        </div>
        <div className="sticky top-0 z-10 backdrop-blur bg-white/90 border-b border-slate-200 rounded-md my-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-md shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="w-full md:w-auto">
                    <p className="text-gray-600 text-sm mb-1">Desde</p>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full md:w-[180px]">
                        <Calendar size={16} className="text-slate-400" />
                        <input
                        className="bg-transparent text-sm text-slate-600 outline-none w-full"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    </div>

                    <div className="w-full md:w-auto">
                    <p className="text-gray-600 text-sm mb-1">Hasta</p>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full md:w-[180px]">
                        <Calendar size={16} className="text-slate-400" />
                        <input
                        className="bg-transparent text-sm text-slate-600 outline-none w-full"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    </div>
                </div>
                <div className="bg-white p-2 flex w-auto mx-auto md:w-42 md:mx-0 gap-3 justify-end rounded-lg text-xs border border-gray-200">
                    <button className={`${page === "directores" ? "bg-gray-100 font-bold" : ""} cursor-pointer px-2 p-1 rounded-lg`} onClick={() => setPage("directores")}>Directores</button>
                    <button className={`${page === "docentes" ? "bg-gray-100 font-bold" : ""} cursor-pointer px-"docentes" p-1 rounded-lg`} onClick={() => setPage("docentes")}>Docentes</button>
                </div>
            </div>
        </div>

            <h2 className="text-xl font-black text-gray-600">Métricas de llamadas</h2>

        <CallSMDashboard
            startDate={startDate}
            endDate={endDate}
            page={ page }
        />
    </>
  )
}

export default SchoolManagementDashboard