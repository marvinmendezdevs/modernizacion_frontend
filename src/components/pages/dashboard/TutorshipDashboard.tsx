import { useState } from "react"
import { Calendar, Laptop, User } from "lucide-react";
import TutorshipPresencial from "./tutorship/TutorshipPresencial";
import TutorshipVirtual from "./tutorship/TutorshipVirtual";

type CategoryTab = "Presencial" | "Virtual";

function TutorshipDashboard() {

    const getTodayDate = () => new Date().toLocaleDateString('sv-SE');

    const [startDate, setStartDate] = useState(getTodayDate());
    const [endDate, setEndDate] = useState(getTodayDate());
    const [activeCategory, setActiveCategory] = useState<CategoryTab>("Presencial");
    

    return (
        <>
            <div className="w-full flex md:justify-end bg-white md:bg-transparent mb-8 rounded-2xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-md w-full bg-white border border-gray-200 shadow-sm">
                    {activeCategory !== "Presencial" && (
                    <div/>
                    )}
                    {activeCategory !== "Virtual" && (
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
                    )}
                    <div className="flex w-auto mx-auto md:mx-0 gap-3 justify-end bg-slate-100 p-1 rounded-xl border border-slate-200 md:w-auto">
                        <button
                            type="button"
                            onClick={() => setActiveCategory("Presencial")}
                            className={[
                            "flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition cursor-pointer",
                            activeCategory === "Presencial"
                                ? "bg-white text-indigo-700 shadow-sm"
                                : "text-slate-600 hover:text-slate-800",
                            ].join(" ")}
                        >
                            <User />
                            Presencial
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveCategory("Virtual")}
                            className={[
                            "flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition cursor-pointer",
                            activeCategory === "Virtual"
                                ? "bg-white text-indigo-700 shadow-sm"
                                : "text-slate-600 hover:text-slate-800",
                            ].join(" ")}
                        >
                            <Laptop />
                            Virtual
                        </button>
                    </div>
                </div>
            </div>
            {activeCategory === "Presencial" ? (
                <TutorshipPresencial
                    startDate={startDate}
                    endDate={endDate}
                    />
                ):(
                <TutorshipVirtual/>
            )}
        </>
    )
}

export default TutorshipDashboard