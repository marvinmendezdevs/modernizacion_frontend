import type { TutorCountType } from "@/types/auth.types";
import { Funnel } from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Link } from "react-router";

type TutorshipInfoTutoresProps = {
  tutor: TutorCountType[];
  meta: {
    page: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
  setPage: Dispatch<SetStateAction<number>>;
}

function TutorshipInfoTutores({ tutor, meta, setPage }: TutorshipInfoTutoresProps) {
        const getTodayDate = () => new Date().toLocaleDateString('sv-SE');
        const [today, setToday] = useState(getTodayDate());

        const data = useMemo(() => {
          return tutor.map((t) => {
            const sesionesHoy = t.virtualSesions.filter(
              (s) => s.date.slice(0, 10) === today
            );

            return {
              ...t,

              enlacesVirtual: {
                recording: sesionesHoy.filter((s) => s.recording?.trim() !== "").length,
                transcription: sesionesHoy.filter((s) => s.transcription?.trim() !== "").length,
                attendance: sesionesHoy.filter((s) => s.attendance?.trim() !== "").length,
                quizz: sesionesHoy.filter((s) => s.quizz?.trim() !== "").length,
              }
            };
          });
        }, [tutor, today]);



        console.log(data);

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-indigo-600 font-bold my-5">Tutores {String(tutor[0].infoTutores.type) === "PRESENCIAL" ? "Presenciales" : "Virtuales"}</p>
        <div className="flex items-center gap-2">
          <Funnel className="size-5 text-gray-700"/>
          <p className="text-gray-600">Filtrar</p>
          <input className="p-2 bg-white border border-gray-200 rounded-lg" type="date" value={today} onChange={ e => setToday(e.target.value) } />
        </div>
      </div>

      <div className="overflow-x-auto ">
        <table className="w-full table-auto">
          <thead
            className="bg-gray-50">
            <tr>
              <th className="w-76 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">TUTOR</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">TELÉFONO</th>
              {String(tutor[0].infoTutores.type) === "VIRTUAL" ? (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GRABACIÓN</th>
              ):(
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">DISTRITO</th>
              )}
              {String(tutor[0].infoTutores.type) === "VIRTUAL" ? (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">TRANSCRIPCIÓN</th>
              ):(
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">DIAGNÓSTICO</th>
              )}
              {String(tutor[0].infoTutores.type) === "VIRTUAL" ? (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ASISTENCIA</th>
              ):(
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">OBSERVACIONES</th>
              )}
              {String(tutor[0].infoTutores.type) === "VIRTUAL" ? (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">QUIZZ</th>
              ):(
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">RETROALIMENTACIONES</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((tutor, index) => (
              <tr key={index}>
                <td className="w-76 px-4 py-4 whitespace-nowrap flex flex-col"><Link to={`/tutoria/tutor/${tutor.username}`} className="flex flex-col"><span className="text-xs font-medium text-gray-900">{tutor.name}</span><span className="text-xs text-gray-500">{tutor.email}</span></Link></td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.telephone}</td>
                {String(tutor.infoTutores.type) === "VIRTUAL" ? (
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.enlacesVirtual.recording}</td>
                ):(
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.infoTutores.districts?.district ?? "-"}</td>
                )}
                {String(tutor.infoTutores.type) === "VIRTUAL" ? (
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.enlacesVirtual.transcription}</td>
                ):(
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.countDiagnostico}</td>
                )}
                {String(tutor.infoTutores.type) === "VIRTUAL" ? (
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.enlacesVirtual.attendance}</td>
                ):(
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.countObservaciones}</td>
                )}
                {String(tutor.infoTutores.type) === "VIRTUAL" ? (
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.enlacesVirtual.quizz}</td>
                ):(
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.countRetroalimentaciones}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-5">
        {meta.hasPreviousPage === false ? (
          <button className="bg-indigo-400 text-white px-3 py-1 rounded cursor-not-allowed" >Anterior</button>
        ) : (
          <button className="bg-indigo-600 text-white px-3 py-1 rounded cursor-pointer" onClick={() => setPage(prev => prev - 1)}>Anterior</button>
        )}
        {meta.hasNextPage === false ? (
          <button className="bg-indigo-400 text-white px-3 py-1 rounded cursor-not-allowed" >Siguiente</button>
        ) : (
          <button className="bg-indigo-600 text-white px-3 py-1 rounded cursor-pointer" onClick={() => setPage(prev => prev + 1)}>Siguiente</button>
        )}
      </div>
    </>
  )
}

export default TutorshipInfoTutores