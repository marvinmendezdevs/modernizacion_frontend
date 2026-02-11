import { useNavbar } from "@/stores/index.store";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";

function Dahsboard() {
    const isOpenNavBar = useNavbar(state => state.isOpen)
    const toggleNavBar = useNavbar(state => state.setIsOpen)
    const setClose = useNavbar(state => state.setClose)

    const { pathname } = useLocation();

    useEffect(() => {
        setClose()
    }, [pathname, setClose])

    return (
        <div className="bg-linear-to-br from-indigo-50 via-white to-indigo-50 h-screen overflow-hidden flex flex-col lg:grid lg:grid-cols-[200px_1fr]">
            <aside className={`fixed inset-0 flex flex-col gap-4 p-4 bg-linear-to-br from-indigo-50 via-white to-indigo-50 transition lg:bg-none lg:static lg:translate-0 ${isOpenNavBar ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex justify-end lg:hidden">
                    <button onClick={toggleNavBar}>
                        <X />
                    </button>
                </div>
                <Link className={`${pathname === "/dashboard/centros-escolares" ? "bg-linear-to-br from-white via-indigo-50 to-white text-indigo-600" : ""} p-2 rounded-lg font-semibold`} to={"/dashboard/centros-escolares"}>
                    Centros Educativos
                </Link>
                <Link className={`${pathname === "/dashboard" ? "bg-linear-to-br from-white via-indigo-50 to-white text-indigo-600" : ""} p-2 rounded-lg font-semibold`} to={"/dashboard"}>
                    Docentes
                </Link>
                <Link className={`${pathname === "/dashboard/secciones" ? "bg-linear-to-br from-white via-indigo-50 to-white text-indigo-600" : ""} p-2 rounded-lg font-semibold`} to={"/dashboard/secciones"}>
                    Secciones
                </Link>
                <Link className={`${pathname === "/dashboard/estudiantes" ? "bg-linear-to-br from-white via-indigo-50 to-white text-indigo-600" : ""} p-2 rounded-lg font-semibold`} to={"/dashboard/estudiantes"}>
                    Estudiantes
                </Link>
                <Link className={`${pathname === "/dashboard/tutoria" ? "bg-linear-to-br from-white via-indigo-50 to-white text-indigo-600" : ""} p-2 rounded-lg font-semibold`} to={"/dashboard/tutoria"}>
                    Tutoría y formación
                </Link>
                <Link className={`${pathname === "/dashboard/gestion-escolar" ? "bg-linear-to-br from-white via-indigo-50 to-white text-indigo-600" : ""} p-2 rounded-lg font-semibold`} to={"/dashboard/gestion-escolar"}>
                    Gestión escolar
                </Link>
            </aside>

            <div className="flex justify-end p-3 mb-3 lg:hidden">
                <button onClick={toggleNavBar}>
                    <Menu />
                </button>
            </div>
            <main className="flex-1 overflow-auto">
                <div className="w-11/12 max-w-7xl mx-auto py-3">
                    <header className="flex flex-col mb-5 md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <LayoutDashboard size={20} />
                            <span className="text-sm font-semibold uppercase tracking-wider">Sistema de Gestión</span>
                        </div>
                    </header>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Dahsboard