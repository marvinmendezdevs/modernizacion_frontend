import { useState } from "react"
import GeneralInfo from "./tutorship/GeneralInfo"
import { Calendar } from "lucide-react";

function TutorshipDashboard() {

    const getTodayDate = () => new Date().toLocaleDateString('sv-SE');

    const [startDate, setStartDate] = useState(getTodayDate());
    const [endDate, setEndDate] = useState(getTodayDate());

    return (
        <>
            <div className="w-full flex md:justify-end bg-white md:bg-transparent mb-8 rounded-2xl">
                <div className="w-full p-3 md:w-auto rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-end gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto bg-white ">
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