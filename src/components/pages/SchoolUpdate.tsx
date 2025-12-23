import { getSchoolByCode } from "@/services/school.services";
import { useQuery } from "@tanstack/react-query";
import { School, User, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import type { SchoolInfo } from "@/types/schoolmanagement.type";

export type Subdirector = {
    name: string;
    email: string;
    telephone: string;
    dui: string;
    username?: string;
    password?: string;
};

type Step = 1 | 2 | 3;

function Stepper({ step }: { step: Step }) {
    const steps: Step[] = [1, 2, 3];

    const isCompleted = (s: Step) => s < step;
    const isActive = (s: Step) => s === step;

    return (
        <div className="w-full flex items-center justify-center py-6">
            <div className="w-full max-w-3xl flex items-center">
                {steps.map((s, idx) => (
                    <div key={s} className="flex items-center w-full">
                        <div
                            className={[
                                "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                                isCompleted(s) || isActive(s)
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white border-2 border-gray-300 text-gray-300",
                            ].join(" ")}
                        >
                            {s}
                        </div>

                        {idx < steps.length - 1 && (
                            <div className="flex-1 px-3">
                                <div
                                    className={[
                                        "h-1 rounded-full w-full transition-all duration-300",
                                        step > s ? "bg-indigo-600" : "bg-gray-200",
                                    ].join(" ")}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function SchoolUpdate() {
    const { schoolCode } = useParams();

    const { isLoading, isError, data: school } = useQuery({
        queryKey: ["school", schoolCode],
        queryFn: () => {
            if (!schoolCode) throw Error("404: Escuela no encontrada");
            return getSchoolByCode(schoolCode);
        },
        enabled: !!schoolCode,
    });

    const [step, setStep] = useState<Step>(1);

    const [form, setForm] = useState<SchoolInfo>({
        code: "",
        name: "",
        address: "",
        directorName: "",
        directorPhone: "",
    });

    const [subdirector, setSubdirector] = useState<Subdirector>({
        name: "",
        email: "",
        telephone: "",
        dui: "",
        username: "",
        password: "",
    });

    // ✅ Obligamos a elegir "Sí" o "No"
    const [wantsSubdirector, setWantsSubdirector] = useState<boolean | null>(null);

    useEffect(() => {
        if (!school) return;

        setForm({
            code: school.code ?? "",
            name: school.name ?? "",
            address: school.address ?? "",
            directorName: school.directorName ?? "",
            directorPhone: school.directorPhone ?? "",
        });

        // Si quisieras precargar subdirector, aquí lo harías y también setWantsSubdirector(true)
    }, [school]);

    const updateField = (key: keyof SchoolInfo, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const updateSubdirector = (key: keyof Subdirector, value: string) => {
        setSubdirector((prev) => ({ ...prev, [key]: value }));
    };

    const resetSubdirector = () => {
        setSubdirector({
            name: "",
            email: "",
            telephone: "",
            dui: "",
            username: "",
            password: "",
        });
    };

    const step1Valid = useMemo(() => {
        return (
            form?.code?.trim() !== "" &&
            form?.name?.trim() !== "" &&
            form?.address?.trim() !== ""
        );
    }, [form?.code, form?.name, form?.address]);

    const step2Valid = useMemo(() => {
        return form?.directorName?.trim() !== "" && form?.directorPhone?.trim() !== "";
    }, [form?.directorName, form?.directorPhone]);

    const step3Valid = useMemo(() => {
        if (wantsSubdirector === null) return false;
        if (wantsSubdirector === false) return true;
        return (
            subdirector.name.trim() !== "" &&
            subdirector.email.trim() !== "" &&
            subdirector.telephone.trim() !== "" &&
            subdirector.dui.trim() !== ""
        );
    }, [
        wantsSubdirector,
        subdirector.name,
        subdirector.email,
        subdirector.telephone,
        subdirector.dui,
    ]);

    const canGoNext = useMemo(() => {
        if (step === 1) return step1Valid;
        if (step === 2) return step2Valid;
        if (step === 3) return step3Valid;
        return false;
    }, [step, step1Valid, step2Valid, step3Valid]);

    const goNext = () => {
        if (!canGoNext) return;
        setStep((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 3));
    };

    const goBack = () => {
        setStep((prev) => (prev === 3 ? 2 : prev === 2 ? 1 : 1));
    };

    if (isLoading) {
        return (
            <p className="text-xs text-slate-800 flex justify-center items-center gap-1 p-3">
                <span className="h-5 w-5 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>
                Cargando lista de docentes asignados...
            </p>
        );
    }

    if (isError || !schoolCode || !school) {
        return (
            <p className="text-xs text-red-600 text-center p-3">
                ¡Error inesperado! contacte con soporte.
            </p>
        );
    }

    console.log(school);

    return (
        <>
            <div>
                <h2 className="text-lg font-black text-indigo-600">Datos del centro escolar</h2>
                <p className="text-sm text-slate-600">Actualiza los datos del centro escolar</p>
            </div>

            <Stepper step={step} />

            <div className="border border-gray-200 rounded-lg p-4 shadow-inner">
                <form onSubmit={(e) => e.preventDefault()}>
                    {/* PASO 1 */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <School className="size-6 text-indigo-600" />
                                <h2 className="font-semibold text-xl">1. Datos del centro escolar</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-slate-600" htmlFor="code">Código</label>
                                    <input
                                        className="border border-gray-200 rounded-lg p-2 w-full"
                                        type="text"
                                        id="code"
                                        value={form.code}
                                        onChange={(e) => updateField("code", e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-slate-600" htmlFor="name">Nombre del Centro Educativo</label>
                                    <input
                                        className="border border-gray-200 rounded-lg p-2 w-full"
                                        type="text"
                                        id="name"
                                        value={form.name}
                                        onChange={(e) => updateField("name", e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-sm text-slate-600" htmlFor="address">Dirección</label>
                                    <input
                                        className="border border-gray-200 rounded-lg p-2 w-full"
                                        type="text"
                                        id="address"
                                        value={form.address}
                                        onChange={(e) => updateField("address", e.target.value)}
                                    />
                                </div>
                            </div>

                            {!step1Valid && (
                                <p className="text-xs text-amber-600">Completa Código, Nombre y Dirección para continuar.</p>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <User className="size-6 text-indigo-600" />
                                <h2 className="font-semibold text-xl">2. Datos del director(a)</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-slate-600" htmlFor="directorName">Nombre del director(a)</label>
                                    <input
                                        className="border border-gray-200 rounded-lg p-2 w-full"
                                        type="text"
                                        id="directorName"
                                        value={form.directorName}
                                        onChange={(e) => updateField("directorName", e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-slate-600" htmlFor="directorPhone">Teléfono</label>
                                    <input
                                        className="border border-gray-200 rounded-lg p-2 w-full"
                                        type="text"
                                        id="directorPhone"
                                        value={form.directorPhone}
                                        onChange={(e) => updateField("directorPhone", e.target.value)}
                                    />
                                </div>
                            </div>

                            {!step2Valid && (
                                <p className="text-xs text-amber-600">Completa los datos del director(a) para continuar.</p>
                            )}
                        </div>
                    )}

                    {/* PASO 3 */}
                    {step === 3 && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <UserPlus className="size-6 text-indigo-600" />
                                <h2 className="font-semibold text-xl">3. Datos del subdirector(a)</h2>
                            </div>

                            {/* ✅ SIEMPRE mostrar botones */}
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p className="text-center font-semibold">¿Deseas registrar un subdirector en este momento?</p>
                                <div className="flex flex-col md:flex-row justify-center gap-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setWantsSubdirector(true)}
                                        className={`px-4 py-2 rounded-lg cursor-pointer ${wantsSubdirector === true ? "bg-indigo-600 text-white" : "bg-white text-gray-600"
                                            }`}
                                    >
                                        Sí, agregar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWantsSubdirector(false);
                                            resetSubdirector();
                                        }}
                                        className={`px-4 py-2 rounded-lg cursor-pointer ${wantsSubdirector === false ? "bg-gray-800 text-white" : "bg-white text-gray-600"
                                            }`}
                                    >
                                        No, por ahora
                                    </button>
                                </div>
                            </div>

                            {wantsSubdirector === true && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-slate-600" htmlFor="sub_name">Nombre</label>
                                        <input
                                            className="border border-gray-200 rounded-lg p-2 w-full"
                                            type="text"
                                            id="sub_name"
                                            value={subdirector.name}
                                            onChange={(e) => updateSubdirector("name", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-slate-600" htmlFor="sub_email">Email</label>
                                        <input
                                            className="border border-gray-200 rounded-lg p-2 w-full"
                                            type="email"
                                            id="sub_email"
                                            value={subdirector.email}
                                            onChange={(e) => updateSubdirector("email", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-slate-600" htmlFor="sub_tel">Teléfono</label>
                                        <input
                                            className="border border-gray-200 rounded-lg p-2 w-full"
                                            type="text"
                                            id="sub_tel"
                                            value={subdirector.telephone}
                                            onChange={(e) => updateSubdirector("telephone", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-slate-600" htmlFor="sub_dui">DUI</label>
                                        <input
                                            className="border border-gray-200 rounded-lg p-2 w-full"
                                            type="text"
                                            id="sub_dui"
                                            value={subdirector.dui}
                                            onChange={(e) => updateSubdirector("dui", e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {wantsSubdirector === null && (
                                <p className="text-xs text-amber-600">
                                    Selecciona “Sí, agregar” o “No, por ahora” para continuar.
                                </p>
                            )}

                            {wantsSubdirector === true && !step3Valid && (
                                <p className="text-xs text-amber-600">
                                    Completa Nombre, Email, Teléfono y DUI para continuar.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-8">
                        <button
                            type="button"
                            onClick={goBack}
                            disabled={step === 1}
                            className={`px-4 py-2 rounded-lg ${step === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border border-gray-200 text-gray-700"
                                }`}
                        >
                            Atrás
                        </button>

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={!canGoNext}
                                className={`px-4 py-2 rounded-lg ${canGoNext ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-indigo-200 text-white cursor-not-allowed"
                                    }`}
                            >
                                Siguiente
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!canGoNext}
                                className={`px-4 py-2 rounded-lg ${canGoNext ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-indigo-200 text-white cursor-not-allowed"
                                    }`}
                            >
                                Guardar cambios
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}

export default SchoolUpdate;
