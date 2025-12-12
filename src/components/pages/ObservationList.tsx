import { getObservations } from "@/services/tutorship.services";
import type { ResponseSectionSchema } from "@/types/intruments.types";
import { formatDate } from "@/utils/index.utils";
import { useQuery } from "@tanstack/react-query";
import {
  Building,
  Calendar,
  Clapperboard,
  Clock,
  FileText,
  ImagePlus,
  MapPin,
  MessageCirclePlus
} from "lucide-react";
import { Link } from "react-router";
import SideDrawer from "../ui/SideDrawer";
import { useState } from "react";
import ObservationFormMultimedia from "./ObservationFormMultimedia";

type ObservationListType = {
  teacherDui: string;
};

function ObservationList({ teacherDui }: ObservationListType) {
  const [creatingMultimedia, setCreatingMultimedia] = useState<number | null>(null);
  const [currentUtilitiesLink, setCurrentUtilitiesLink] = useState<ResponseSectionSchema['utilitiesLink'] | null>(null);

  const { data, isLoading, isError } = useQuery<ResponseSectionSchema[]>({
    queryKey: ["observations-teacher"],
    queryFn: () => getObservations(teacherDui),
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return (
      <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
        <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
        Cargando lista de docentes asignados...
      </p>
    );

  if (isError)
    return (
      <p className="text-xs text-red-600 text-center p-3">
        ¡Error inespertado! contacte con soporte.
      </p>
    );

  const handleCreatingMultimedia = (observation: ResponseSectionSchema) => {
    setCurrentUtilitiesLink(observation.utilitiesLink);
    setCreatingMultimedia(observation.id);
  }

  if (data)
    return (
      <>
        <section className="mt-3">
          <h3 className="font-bold">Lista de observaciones</h3>

          {data.length > 0 ? (
            <div className="space-y-3 mt-4">
              {data.map((observation) => (
                <div key={observation.id}>
                  <div>
                    <p className="font-semibold">
                      {observation.section.school.name}
                    </p>
                    <p className="text-xs text-gray-700 my-1 flex items-center gap-3">
                      <span className="bg-gray-200 border border-gray-300 py-0.5 px-1 rounded flex items-center gap-1">
                        <Building size={12} />
                        {observation.section.schoolCode}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(observation.submittedAt)}
                      </span>
                    </p>
                    <p className="flex items-center gap-3 text-gray-600 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {observation.section.grade}o.{" "}
                        {observation.section.track === "none"
                          ? ""
                          : observation.section.track}{" "}
                        {observation.section.subtrack === "none"
                          ? ""
                          : observation.section.track}{" "}
                        "{observation.section.sectionClass}"
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {observation.section.shift}
                      </span>
                    </p>
                  </div>

                  {observation.utilitiesLink && (
                    <div className="mt-2 flex items-center gap-3">
                      <a
                        href={observation.utilitiesLink.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500  text-xs flex items-center gap-1 p-1 rounded-lg hover:bg-indigo-100"
                      >
                        <Clapperboard size={12} /> Ver grabación
                      </a>
                      
                      <a
                        href={observation.utilitiesLink.transcription}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500  text-xs flex items-center gap-1 p-1 rounded-lg hover:bg-indigo-100"
                      >
                        <FileText size={12} /> Ver transcripción
                      </a>
                    </div>
                  )}

                  <div className="flex gap-3 items-center bg-gray-100 p-2 mt-3 text-indigo-700 text-sm">
                    <Link
                      className="py-1 px-3 rounded-lg flex items-center gap-1 hover:bg-gray-300/25"
                      to={`/retroalimentacion/${observation.id}`}
                    >
                      <MessageCirclePlus size={15} />
                      Retroalimentación
                    </Link>

                    <button
                      className="py-1 px-3 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-gray-300/25"
                      onClick={() => handleCreatingMultimedia(observation)}
                    >
                      <ImagePlus size={15} />
                      Editar multimedia
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-2 text-center text-sm">
              No hay observaciones aún. Comienza creando una
            </p>
          )}
        </section>

        {creatingMultimedia && (
          <SideDrawer setActive={setCreatingMultimedia}>
            <ObservationFormMultimedia
              creatingMultimedia={creatingMultimedia}
              currentUtilitiesLink={currentUtilitiesLink}
            />
          </SideDrawer>
        )}
      </>
    );
}

export default ObservationList;
