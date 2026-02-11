import CallSMDashboard from "./CallSMDashboard"
import { useState } from "react";

type DashboardTab = 'directores' | 'docentes';

function SchoolManagementDashboard() {

        const getTodayDate = () => new Date().toLocaleDateString('sv-SE');

    const [today, setToday] = useState(getTodayDate());

    const [page, setPage] = useState<DashboardTab>("directores");

    

  return (
    <>

        <div className="flex items-center justify-between mb-5 flex-col gap-3 md:flex-row">
                <div>
                    <p className="text-xl font-black">Registro de llamadas</p>
                    <p className="text-xs text-gray-600">Centro escolares del grupo 1, fase 2</p>
                </div>

                <div className="flex items-center gap-3">
                    <input className="p-2 bg-white border border-gray-200 rounded-lg" type="date" value={today} onChange={ e => setToday(e.target.value) } />
                    <div className="bg-white w-42 p-2 flex gap-3 justify-center rounded-lg text-xs border border-gray-200">
                        <button className={`${page === "directores" ? "bg-gray-100 font-bold" : ""} cursor-pointer px-2 p-1 rounded-lg`} onClick={() => setPage("directores")}>Directores</button>
                        <button className={`${page === "docentes" ? "bg-gray-100 font-bold" : ""} cursor-pointer px-"docentes" p-1 rounded-lg`} onClick={() => setPage("docentes")}>Docentes</button>
                    </div>
                </div>
            </div>


            <h2 className="text-xl font-black text-gray-600">Métricas de llamadas</h2>

        <CallSMDashboard
            today={today}
            page={ page }
        />
    </>
  )
}

export default SchoolManagementDashboard