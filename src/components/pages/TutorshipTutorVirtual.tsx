import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Funnel, Captions, Video, PencilLine, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { getTutorshipInfo } from "@/services/tutorship.services";
import { useQuery } from "@tanstack/react-query";

import useAuth from "@/hooks/useAuth.hooks";

const HOURS = Array.from({ length: 13 }, (_, i) => 7 + i);
function InicioSemana(date: string | number | Date, weekStartsOnMonday = true) {
    const d = new Date(date);
    const day = d.getDay();
    let diff;

    if (weekStartsOnMonday) {
        diff = (day === 0 ? -6 : 1) - day;
    } else {
        diff = -day;
    }

    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date: string | number | Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function formatHour(hour: number) {
    return `${hour.toString().padStart(2, "0")}:00`;
}

function formatWeekRange(start: Date) {
    const end = addDays(start, 6);
    const baseOpts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };

    const startStr = start.toLocaleDateString("es-ES", baseOpts);
    const endStr = end.toLocaleDateString("es-ES", {
        ...baseOpts,
        year: start.getFullYear() !== end.getFullYear() ? "numeric" : undefined,
    });

    return `${startStr} - ${endStr}`;
}

function TutorshipTutorVirtual({
    initialDate = new Date(),
    onSlotClick,
}: { initialDate?: Date | string | number, onSlotClick?: (date: Date, hour: number) => void }) {
    const { data: user } = useAuth();
    const { data } = useQuery({
        queryKey: ["tutorship-info", user?.username],
        queryFn: () => getTutorshipInfo(user?.username || ""),
        retry: false,
        refetchOnWindowFocus: false,
        enabled: !!user?.username,
    });

    const eventsCalendar = data || [];
    const [currentWeekStart, setCurrentWeekStart] = useState(
        InicioSemana(initialDate)
    );

    const days = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
        [currentWeekStart]
    );

    const handlePrevWeek = () => {
        setCurrentWeekStart((prev) => addDays(prev, -7));
    };

    const handleNextWeek = () => {
        setCurrentWeekStart((prev) => addDays(prev, 7));
    };

    const handleToday = () => {
        setCurrentWeekStart(InicioSemana(new Date()));
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            today.getFullYear() === date.getFullYear() &&
            today.getMonth() === date.getMonth() &&
            today.getDate() === date.getDate()
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4 gap-2">
                <h2 className="text-2xl text-indigo-700 font-bold mb-4">Calendario Semanal</h2>
                <Link to="/tutorias" className="px-3 py-1 rounded-md border border-gray-200 bg-white text-sm hover:bg-gray-100 shadow-inner cursor-pointer">
                    Volver
                </Link>
            </div>
            <div className="flex items-center justify-between mb-4 gap-2">
                <div className="flex gap-1">
                    <button
                        onClick={handlePrevWeek}
                        className="p-2 rounded-full border border-gray-200 bg-white text-sm hover:bg-gray-100 cursor-pointer"
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        onClick={handleToday}
                        className="px-5 py-1 rounded-lg border border-gray-200 bg-indigo-100 text-indigo-700 text-sm hover:bg-indigo-200 cursor-pointer"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={handleNextWeek}
                        className="p-2 rounded-full border border-gray-200 bg-white text-sm hover:bg-gray-100 cursor-pointer"
                    >
                        <ChevronRight />
                    </button>
                </div>
                <div className="text-sm md:text-base font-semibold text-gray-700 bg-gray-50 shadow-inner border border-gray-200 rounded-lg px-3 py-1">
                    {formatWeekRange(currentWeekStart)}
                </div>
            </div>
            <div>
                <div className="flex items-center gap-1 mb-5">
                    <Funnel className="size-3" />
                    <p>Filtros</p>
                    <button type="button" value="Todos" className="text-xs px-3 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 shadow-inner cursor-pointer">
                        Todos
                    </button>
                    <button type="button" value="Lenguaje" className="text-xs px-3 py-1 rounded-md border border-gray-200 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-inner cursor-pointer">
                        Lenguaje
                    </button>
                    <button type="button" value="Matemática" className="text-xs px-3 py-1 rounded-md border border-gray-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-inner cursor-pointer">
                        Matemática
                    </button>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden text-xs md:text-sm">
                <div className="max-h-[600px] overflow-y-auto">
                    <div className="grid grid-cols-8 bg-gray-50 sticky top-0 border-b border-gray-200">
                        <div className="h-12 flex items-center justify-center border-r border-gray-200 font-medium">
                            Hora
                        </div>
                        {days.map((day) => (
                            <div
                                key={day.toISOString()}
                                className={`h-12 flex flex-col items-center justify-center border-r border-gray-200 ${isToday(day) ? "bg-indigo-50 text-indigo-700 font-semibold" : ""
                                    }`}
                            >
                                <span className="uppercase tracking-wide text-[10px] md:text-xs">
                                    {day.toLocaleDateString("es-ES", { weekday: "short" })}
                                </span>
                                <span className="text-sm md:text-base">
                                    {day.getDate()}
                                </span>
                            </div>
                        ))}
                    </div>

                    {HOURS.map((hour) => (
                        <div key={hour} className="grid grid-cols-8">
                            <div className="h-15 flex items-center justify-center border-r border-b border-gray-200 bg-gray-50 text-[11px] md:text-xs">
                                {formatHour(hour)}
                            </div>

                            {days.map((day) => {
                                const key = `${day.toISOString().slice(0, 12)}-${hour}`;
                                return (
                                    <div
                                        key={key}
                                        onClick={() => onSlotClick && onSlotClick(day, hour)}
                                        className="h-15 border-r border-b border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors"
                                    >
                                        {eventsCalendar.map((event: any) => (
                                            event.date === day.toLocaleDateString("en-CA") && event.time === hour && (
                                                <div key={event.id} className={`flex flex-col justify-evenly items-center ${event.subject === 'Matemática' ? 'text-indigo-700 bg-indigo-50 border-l-2 border-indigo-500' : 'text-orange-700 bg-orange-50 border-l-2 border-orange-500'} h-full`}>
                                                    <div className={`flex justify-between items-center text-[10px] p-1 rounded overflow-hidden leading-tight font-medium w-full`}>
                                                        <div>
                                                            <p>{event.subject}</p>
                                                        </div>
                                                        {/* <button onClick={() => handleEditVirtual(event.id)}>
                                                            <List className="size-3 font-bold text-black cursor-pointer" />
                                                        </button> */}
                                                    </div>
                                                    {event.video && event.meet && event.transcript && event.attendance && (
                                                        <div className="flex gap-2 justify-center items-center">
                                                            <a href={event.meet} target="_blank">
                                                                <Video className="size-4 font-bold text-black cursor-pointer text-gray-500 hover:text-gray-700" />
                                                            </a>
                                                            <a href={event.transcript} target="_blank">
                                                                <Captions className="size-4 font-bold text-black cursor-pointer text-gray-500 hover:text-gray-700" />
                                                            </a>
                                                            <a href={event.attendance} target="_blank">
                                                                <UserCheck className="size-4 font-bold text-black cursor-pointer text-gray-500 hover:text-gray-700" />
                                                            </a>
                                                            <a href={event.quiz} target="_blank">
                                                                <PencilLine className="size-4 font-bold text-black cursor-pointer text-gray-500 hover:text-gray-700" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}

export default TutorshipTutorVirtual;
