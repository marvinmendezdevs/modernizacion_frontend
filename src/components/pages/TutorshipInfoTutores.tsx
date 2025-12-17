import type { TutorCountType } from "@/types/auth.types";
import type { Dispatch, SetStateAction } from "react";
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

  console.log(tutor)

  return (
    <>
      <p className="text-indigo-600 font-bold my-5">Tutores {String(tutor[0].infoTutores.type) === "PRESENCIAL" ? "Presenciales" : "Virtuales"}</p>
      <div className="overflow-x-auto ">
        <table className="w-full table-auto">
          <thead
            className="bg-gray-50">
            <tr>
              <th className="w-76 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">TUTOR</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TELÉFONO</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">DISTRITO</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">DIAGNÓSTICO</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">OBSERVACIONES</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">RETROALIMENTACIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tutor.map((tutor, index) => (
              <tr key={index}>
                <td className="w-76 px-4 py-4 whitespace-nowrap flex flex-col"><Link to={`/tutoria/tutor/${tutor.username}`} className="flex flex-col"><span className="text-xs font-medium text-gray-900">{tutor.name}</span><span className="text-xs text-gray-500">{tutor.email}</span></Link></td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.telephone}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.infoTutores.districts?.district ?? "-"}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.countDiagnostico}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.countObservaciones}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{tutor.countRetroalimentaciones}</td>
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