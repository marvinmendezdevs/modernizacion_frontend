import {
  BookOpenCheck,
  Calendar,
  Captions,
  FileVideoCamera,
  Funnel,
  Laptop,
  ListCheck,
  Video,
} from "lucide-react";
import StatCard from "../StatCard";
import { useQuery } from "@tanstack/react-query";
import { getDataPublic } from "@/services/tutorship.services";
import type { VirtualSessionType } from "@/types/auth.types";
import { useMemo, useState } from "react";

type QueryResponse = {
  virtualSessions: VirtualSessionType[];
};

type SubjectFilter = "Todos" | "Lenguaje" | "Matemática";

function formatDate(date: Date) {
  return date.toLocaleDateString("sv-SE");
}

function getWeekStringFromDate(date: Date) {
  const tempDate = new Date(date);
  tempDate.setHours(0, 0, 0, 0);

  const day = tempDate.getDay() || 7;
  tempDate.setDate(tempDate.getDate() + 4 - day);

  const yearStart = new Date(tempDate.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return `${tempDate.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getStartAndEndFromWeek(weekValue: string) {
  const [yearPart, weekPart] = weekValue.split("-W");

  const year = Number(yearPart);
  const week = Number(weekPart);

  const firstDayOfYear = new Date(year, 0, 1);
  const dayOffset = firstDayOfYear.getDay() || 7;

  const monday = new Date(firstDayOfYear);
  monday.setDate(firstDayOfYear.getDate() + (week - 1) * 7 - (dayOffset - 1));

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: formatDate(monday),
    endDate: formatDate(sunday),
  };
}

function TutorshipVirtual() {
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>("Todos");
  const [selectedWeek, setSelectedWeek] = useState<string>(
    getWeekStringFromDate(new Date())
  );

  const { startDate, endDate } = useMemo(() => {
    return getStartAndEndFromWeek(selectedWeek);
  }, [selectedWeek]);

  const { isLoading, isError, data } = useQuery<QueryResponse>({
    queryKey: ["general-tutoria", startDate, endDate],
    queryFn: () => getDataPublic(startDate, endDate),
  });

  const virtualSesions = data?.virtualSessions ?? [];

  const filteredSessions = useMemo(() => {
    if (subjectFilter === "Todos") return virtualSesions;

    return virtualSesions.filter(
      (item) => item.subject?.trim() === subjectFilter
    );
  }, [virtualSesions, subjectFilter]);

  const totals = useMemo(() => {
    return filteredSessions.reduce(
      (acc, item) => {
        if (item.meet?.trim()) acc.meet += 1;
        if (item.recording?.trim()) acc.recording += 1;
        if (item.transcription?.trim()) acc.transcription += 1;
        if (item.attendance?.trim()) acc.attendance += 1;
        if (item.quizz?.trim()) acc.quizz += 1;

        return acc;
      },
      {
        meet: 0,
        recording: 0,
        transcription: 0,
        attendance: 0,
        quizz: 0,
      }
    );
  }, [filteredSessions]);

  if (isLoading) {
    return (
      <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
        <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
        Cargando información...
      </p>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-xs text-red-600 text-center p-3">
        ¡Error inesperado! contacte con soporte.
      </p>
    );
  }

  return (
    <>
      <div className="flex justify-between bg-white p-4 border border-gray-200 shadow-sm rounded-lg mb-3">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full md:w-[220px]">
          <Calendar size={16} className="text-slate-400" />
          <input
            className="bg-transparent text-sm text-slate-600 outline-none w-full"
            type="week"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 text-gray-600">
          <p className="flex justify-center items-center gap-1">
            <Funnel size={16} />
            Filtrar
          </p>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value as SubjectFilter)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Todos">Todos</option>
            <option value="Lenguaje">Lenguaje</option>
            <option value="Matemática">Matemática</option>
          </select>
        </div>
      </div>

      <div className="mb-3 text-sm text-slate-500">
        Rango consultado: <strong>{startDate}</strong> al <strong>{endDate}</strong>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Tutorías virtuales"
          icon={Laptop}
          color="blue"
          value={filteredSessions.length}
        />
        <StatCard title="Meet" icon={Video} color="emerald" value={totals.meet} />
        <StatCard
          title="Grabación"
          icon={FileVideoCamera}
          color="emerald"
          value={totals.recording}
        />
        <StatCard
          title="Transcripción"
          icon={Captions}
          color="blue"
          value={totals.transcription}
        />
        <StatCard
          title="Asistencia"
          icon={ListCheck}
          color="blue"
          value={totals.attendance}
        />
        <StatCard
          title="Controles de lectura"
          icon={BookOpenCheck}
          color="blue"
          value={totals.quizz}
        />
      </div>
    </>
  );
}

export default TutorshipVirtual;