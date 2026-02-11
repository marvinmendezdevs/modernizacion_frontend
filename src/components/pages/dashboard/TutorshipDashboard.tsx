import { useState } from "react"
import GeneralInfo from "./tutorship/GeneralInfo"
import { Calendar } from "lucide-react";

function TutorshipDashboard() {

    const getTodayDate = () => new Date().toLocaleDateString('sv-SE');

    const [startDate, setStartDate] = useState(getTodayDate());
    const [endDate, setEndDate] = useState(getTodayDate());

    return (
        <>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-wrap items-center justify-end gap-4">
                <p className="text-gray-600 text-sm">Desde</p>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    <Calendar size={16} className="text-slate-400" />
                    <input className="bg-transparent text-sm text-slate-600 outline-none" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} id="start" />
                </div>
                <p className="text-gray-600 text-sm">Hasta</p>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    <Calendar size={16} className="text-slate-400" />
                    <input className="bg-transparent text-sm text-slate-600 outline-none" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} id="end" />
                </div>
            </div>

            <GeneralInfo
                startDate={startDate}
                endDate={endDate}
            />
        </>
    )
}

export default TutorshipDashboard