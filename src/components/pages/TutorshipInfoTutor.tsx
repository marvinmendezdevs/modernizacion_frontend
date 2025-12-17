import { useQuery } from "@tanstack/react-query"
import { getTutorshipInfo } from "@/services/tutorship.services"
import { Link, useParams } from "react-router"
import { User, Phone, IdCard, Mail, Building2, MapPin, ArrowLeft, NotepadText, Eye, MessageSquare } from "lucide-react"

function TutorshipInfoTutor() {
    const { username } = useParams();
    const { isLoading, isError, data } = useQuery({
        queryKey: ["tutorship-info"],
        queryFn: () => getTutorshipInfo(username as string),
        retry: false,
        refetchOnWindowFocus: false,
    })

    const [nameSp, lastNameSp] = username?.split("-") ?? [];
    const diagnosticoCount = (data?.responses ?? []).reduce((acc: number, item: any) => item.instrumentId === 1 ? acc + 1 : acc, 0);
    const observacionCount = (data?.responses ?? []).reduce((acc: number, item: any) => item.instrumentId === 2 ? acc + 1 : acc, 0);

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

    if (!data) return (
        <>
            <Link to="/tutoria" className="flex items-center justify-end gap-2">
                <ArrowLeft className="size-5 text-blue-600" />
                Regresar
            </Link>
            <p className="text-2xl font-bold my-5">Información del tutor</p>
            <div className="flex flex-col md:flex-row items-center gap-6 mb-5 border-b border-gray-200 pb-10">
                <div className="w-24 h-24 rounded-full border border-blue-300 bg-blue-100 flex justify-center items-center shadow">
                    <p className="uppercase flex gap-1 font-bold text-blue-600 text-2xl">{nameSp?.[0] + lastNameSp?.[0]}</p>
                </div>
                <div>
                    <p className="text-xl font-semibold">{data?.name}</p>
                    <p className="text-xs font-semibold text-gray-500">Estatus: <span className="text-green-800 font-semibold">Verificado</span></p>
                    <p className="text-xs font-semibold text-gray-500">Rol: <span className="text-green-800 font-semibold">{data?.role.name}</span></p>
                </div>
            </div>
            <div className="flex flex-col justify-between gap-3 divide-y divide-gray-200 border-b border-gray-200 pb-5">
                <div className="flex flex-col md:flex-row flex-col justify-between pb-5">
                    <p className="font-semibold text-gray-500 flex items-center gap-2"><User className="size-5 text-blue-600" />Nombre Completo</p>
                    <p className="text-gray-600 font-semibold">{data?.name}</p>
                </div>
                <div className="flex flex-col md:flex-row flex-col justify-between pb-5">
                    <p className="font-semibold text-gray-500 flex items-center gap-2"><Phone className="size-5 text-blue-600" />Teléfono</p>
                    <p className="text-gray-600 font-semibold">{data?.telephone}</p>
                </div>
                <div className="flex flex-col md:flex-row flex-col justify-between pb-5">
                    <p className="font-semibold text-gray-500 flex items-center gap-2"><IdCard className="size-5 text-blue-600" />DUI</p>
                    <p className="text-gray-600 font-semibold">{data?.dui}</p>
                </div>
                <div className="flex flex-col md:flex-row flex-col justify-between pb-5">
                    <p className="font-semibold text-gray-500 flex items-center gap-2"><Mail className="size-5 text-blue-600" />Correo Electrónico</p>
                    <p className="text-gray-600 font-semibold">{data?.email}</p>
                </div>
                <div className="flex flex-col md:flex-row flex-col justify-between pb-5">
                    <p className="font-semibold text-gray-500 flex items-center gap-2"><Building2 className="size-5 text-blue-600" />Departamento</p>
                    <p className="text-gray-600 font-semibold">{data?.infoTutores?.districts?.department}</p>
                </div>
                <div className="flex flex-col md:flex-row flex-col justify-between pb-5">
                    <p className="font-semibold text-gray-500 flex items-center gap-2"><MapPin className="size-5 text-blue-600" />Distrito</p>
                    <p className="text-gray-600 font-semibold">{data?.infoTutores?.districts?.district}</p>
                </div>
            </div>
            <div className="flex flex-col items-center md:flex-row justify-center mt-10 gap-5">
                <div className="bg-gray-100 shadow-inner p-5 rounded-lg md:w-86 w-full flex flex-col items-center gap-2">
                    <NotepadText className="size-8 text-blue-600" />
                    <p className="font-bold text-2xl">{diagnosticoCount}</p>
                    <p className="flex flex-col justify-center items-center"><span className="font-semibold">Diagnósticos</span>Realizados</p>
                </div>
                <div className="bg-gray-100 shadow-inner p-5 rounded-lg md:w-86 w-full flex flex-col justify-center items-center gap-2">
                    <Eye className="size-8 text-blue-600" />
                    <p className="font-bold text-2xl">{observacionCount}</p>
                    <p className="flex flex-col justify-center items-center"><span className="font-semibold">Observaciones</span>Registradas</p>
                </div>
                <div className="bg-gray-100 shadow-inner p-5 rounded-lg md:w-86 w-full flex flex-col justify-center items-center gap-2">
                    <MessageSquare className="size-8 text-blue-600" />
                    <p className="font-bold text-2xl">{data?.coachingSessions?.length ?? 0}</p>
                    <p className="flex flex-col justify-center items-center"><span className="font-semibold">Retroalimentaciones</span>Emitidas</p>
                </div>
            </div>
        </>
    )
}

export default TutorshipInfoTutor