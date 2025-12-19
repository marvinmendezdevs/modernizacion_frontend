import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Captions,
  PencilLine,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  List,
  Video,
} from "lucide-react";
import {
  getTutorshipInfoVirtual,
  updateVirtualSessionLinks,
} from "@/services/tutorship.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SideDrawer from "../ui/SideDrawer";
import { LinksSchema } from "@/schemas/instruments.schema";
import { useForm } from "react-hook-form";

interface VirtualTutorshipEvent {
  id: number;
  date: string;
  hour: string;
  subject: string;
  transcription?: string;
  attendance?: string;
  quizz?: string;
  recording?: string;
}

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

function formatHour(hour: number | string) {
  const hourStr = hour.toString();
  if (hourStr.includes(":")) return `${hourStr}:00`;
  return `${hourStr.padStart(2, "0")}:00:00`;
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
}: {
  initialDate?: Date | string | number;
  onSlotClick?: (date: Date, hour: number | string) => void;
}) {
  const queryClient = useQueryClient();

  const [creatingLinks, setCreatingLinks] = useState<number | null>(null);
  const [currentUtilitiesLink, setCurrentUtilitiesLink] = useState<LinksSchema | null>(null);

  const [currentWeekStart, setCurrentWeekStart] = useState(InicioSemana(initialDate));

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  );

  const handlePrevWeek = () => setCurrentWeekStart((prev) => addDays(prev, -7));
  const handleNextWeek = () => setCurrentWeekStart((prev) => addDays(prev, 7));
  const handleToday = () => setCurrentWeekStart(InicioSemana(new Date()));

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  const { isLoading, isError, data } = useQuery({
    queryKey: ["tutorship-info"],
    queryFn: () => getTutorshipInfoVirtual(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<LinksSchema, "id">>({
    defaultValues: {
      recording: "",
      transcription: "",
      attendance: "",
      quizz: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: LinksSchema) => updateVirtualSessionLinks(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tutorship-info"] });
      setCreatingLinks(null);
      setCurrentUtilitiesLink(null);
    },
  });

  const onSubmit = (formData: Omit<LinksSchema, "id">) => {
    if (!currentUtilitiesLink?.id) return;

    mutation.mutate({
      id: currentUtilitiesLink.id,
      ...formData,
    } as LinksSchema);
  };

  const handleCreatingLinks = (event: VirtualTutorshipEvent) => {
    const payload: LinksSchema = {
      id: event.id,
      recording: event.recording || "",
      transcription: event.transcription || "",
      attendance: event.attendance || "",
      quizz: event.quizz || "",
    };

    setCurrentUtilitiesLink(payload);

    reset({
      recording: payload.recording,
      transcription: payload.transcription,
      attendance: payload.attendance,
      quizz: payload.quizz,
    });

    setCreatingLinks(event.id);
  };

    if (isLoading) return (
        <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
            <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
            Cargando información de tutores...
        </p>
    );

    if (isError) return (
        <p className="text-xs text-red-600 text-center p-3">
            ¡Error inespertado! contacte con soporte.
        </p>
    );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-2xl text-indigo-700 font-bold mb-4">Calendario Semanal</h2>
        <Link
          to="/tutorias"
          className="px-3 py-1 rounded-md border border-gray-200 bg-white text-sm hover:bg-gray-100 shadow-inner cursor-pointer"
        >
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

      <div className="border border-gray-200 rounded-lg overflow-hidden text-xs md:text-sm">
        <div className="max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-8 bg-gray-50 sticky top-0 border-b border-gray-200">
            <div className="h-12 flex items-center justify-center border-r border-gray-200 font-medium">
              Hora
            </div>
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={`h-12 flex flex-col items-center justify-center border-r border-gray-200 ${
                  isToday(day) ? "bg-indigo-50 text-indigo-700 font-semibold" : ""
                }`}
              >
                <span className="uppercase tracking-wide text-[10px] md:text-xs">
                  {day.toLocaleDateString("es-ES", { weekday: "short" })}
                </span>
                <span className="text-sm md:text-base">{day.getDate()}</span>
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
                    {data.map((event: VirtualTutorshipEvent) => {
                      const [actualyHour] = event.hour.split(":");
                      const formattedDate = `${String(day.getDate()).padStart(2, "0")}-${String(
                        day.getMonth() + 1
                      ).padStart(2, "0")}-${day.getFullYear()}`;

                      const normalizeDate = (d: string) => d.replace(/\//g, "-");
                      const eventDate = normalizeDate(event.date);
                      const targetDate = normalizeDate(formattedDate);

                      return (
                        eventDate === targetDate &&
                        Number(actualyHour) === Number(hour) && (
                          <div
                            key={event.id}
                            className={`flex flex-col justify-evenly items-center ${
                              event.subject === "Matemática"
                                ? "text-indigo-700 bg-indigo-50 border-l-2 border-indigo-500"
                                : "text-orange-700 bg-orange-50 border-l-2 border-orange-500"
                            } h-full`}
                          >
                            <div className="flex justify-between items-center text-[10px] p-1 rounded overflow-hidden leading-tight font-medium w-full">
                              <div>
                                <p>{event.subject}</p>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreatingLinks(event);
                                }}
                              >
                                <List className="size-3 font-bold text-black cursor-pointer" />
                              </button>
                            </div>
                            { event.recording && event.transcription && event.attendance && event.quizz && (
                                <div className="flex gap-2 justify-center items-center">
                                    <div className="flex gap-2 justify-center items-center">
                                        <a href={event.recording} target="_blank" rel="noreferrer">
                                            <Video className="size-4 cursor-pointer text-gray-500 hover:text-gray-700" />
                                        </a>
                                    </div>
                                    <div className="flex gap-2 justify-center items-center">
                                        <a href={event.transcription} target="_blank" rel="noreferrer">
                                        <Captions className="size-4 cursor-pointer text-gray-500 hover:text-gray-700" />
                                        </a>
                                    </div>
                                    <div className="flex gap-2 justify-center items-center">
                                        <a href={event.attendance} target="_blank" rel="noreferrer">
                                        <UserCheck className="size-4 cursor-pointer text-gray-500 hover:text-gray-700" />
                                        </a>
                                    </div>
                                    <div className="flex gap-2 justify-center items-center">
                                        <a href={event.quizz} target="_blank" rel="noreferrer">
                                        <PencilLine className="size-4 cursor-pointer text-gray-500 hover:text-gray-700" />
                                        </a>
                                    </div>
                                </div>
                            )}
                          </div>
                        )
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {creatingLinks && (
        <SideDrawer setActive={setCreatingLinks}>
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4 text-indigo-700">Agregar Enlaces</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Grabación
                  <input
                    type="text"
                    className="text-sm text-gray-900 truncate border border-gray-200 my-2 rounded-lg p-2 w-full"
                    {...register("recording", {
                      required: true,
                      pattern: { value: /https:/, message: "Formato inválido" },
                    })}
                    placeholder="https://drive.google.com/file/d/abc123"
                  />
                </label>
                {errors.recording && (
                  <p className="text-red-600 text-xs mt-1">El campo Grabación es obligatorio</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Transcripción
                  <input
                    type="text"
                    className="text-sm text-gray-900 truncate border border-gray-200 my-2 rounded-lg p-2 w-full"
                    {...register("transcription", {
                      required: true,
                      pattern: { value: /https:/, message: "Formato inválido" },
                    })}
                    placeholder="https://drive.google.com/file/d/abc123"
                  />
                </label>
                {errors.transcription && (
                  <p className="text-red-600 text-xs mt-1">El campo Transcripción es obligatorio</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Asistencia</label>
                <input
                  type="text"
                  className="text-sm text-gray-900 truncate border border-gray-200 my-2 rounded-lg p-2 w-full"
                  {...register("attendance", {
                    required: true,
                    pattern: { value: /https:/, message: "Formato inválido" },
                  })}
                  placeholder="https://drive.google.com/file/d/abc123"
                />
                {errors.attendance && (
                  <p className="text-red-600 text-xs mt-1">El campo Asistencia es obligatorio</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quizz</label>
                <input
                  type="text"
                  className="text-sm text-gray-900 truncate border border-gray-200 my-2 rounded-lg p-2 w-full"
                  {...register("quizz", {
                    required: true,
                    pattern: { value: /https:/, message: "Formato inválido" },
                  })}
                  placeholder="https://drive.google.com/file/d/abc123"
                />
                {errors.quizz && <p className="text-red-600 text-xs mt-1">El campo Quiz es obligatorio</p>}
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {mutation.isPending ? "Guardando..." : "Guardar"}
              </button>

              {mutation.isError && (
                <p className="text-red-600 text-xs">
                  Error al guardar. Intenta de nuevo.
                </p>
              )}
            </form>
          </div>
        </SideDrawer>
      )}
    </div>
  );
}

export default TutorshipTutorVirtual;
