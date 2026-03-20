import { useNavbar } from "@/stores/index.store";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

function Dahsboard() {
  const isOpenNavBar = useNavbar((state) => state.isOpen);
  const toggleNavBar = useNavbar((state) => state.setIsOpen);
  const setClose = useNavbar((state) => state.setClose);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setClose();
  }, [pathname, setClose]);

  useEffect(() => {
    if (pathname === "/dashboard") {
      navigate("/dashboard", { replace: true });
    }
  }, [pathname, navigate]);

  return (
    <div className="bg-linear-to-br from-indigo-50 via-white to-indigo-50 h-screen overflow-hidden flex flex-col lg:grid lg:grid-cols-[200px_1fr]">
      
      {isOpenNavBar && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={setClose}
        />
      )}

      <aside
        className={[
          "flex flex-col gap-4 p-4 bg-linear-to-br from-indigo-50 via-white to-indigo-50",

          "fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50",
          "transition-transform duration-200 ease-out",
          isOpenNavBar ? "translate-x-0" : "-translate-x-full",

          "lg:static lg:inset-auto lg:z-auto",
          "lg:w-[200px] lg:max-w-none lg:translate-x-0",
          "lg:bg-none lg:transition-none",
        ].join(" ")}
      >
      <div className="flex justify-end lg:hidden">
        <button onClick={setClose} aria-label="Cerrar menú">
          <X />
        </button>
      </div>
        <Link
          className={`${
            pathname === "/dashboard"
              ? "bg-linear-to-br from-white via-indigo-50 to-white text-indigo-600"
              : ""
          } p-2 rounded-lg font-semibold`}
          to={"/dashboard"}
        >
          Secciones(clases)
        </Link>
        <Link
          className={`${
            pathname === "/dashboard/centros-educativos"
              ? "bg-linear-to-br from-white via-indigo-50 to-white text-indigo-600"
              : ""
          } p-2 rounded-lg font-semibold`}
          to={"/dashboard/centros-educativos"}
        >
          Centros Educativos
        </Link>

        <Link
          className={`${
            pathname === "/dashboard/tutoria"
              ? "bg-linear-to-br from-white via-indigo-50 to-white text-indigo-600"
              : ""
          } p-2 rounded-lg font-semibold`}
          to={"/dashboard/tutoria"}
        >
          Tutoría y formación
        </Link>

        <Link
          className={`${
            pathname === "/dashboard/gestion-escolar"
              ? "bg-linear-to-br from-white via-indigo-50 to-white text-indigo-600"
              : ""
          } p-2 rounded-lg font-semibold`}
          to={"/dashboard/gestion-escolar"}
        >
          Gestión escolar
        </Link>

        <Link
          className={`${
            pathname === "/dashboard/accesos"
              ? "bg-linear-to-br from-white via-indigo-50 to-white text-indigo-600"
              : ""
          } p-2 rounded-lg font-semibold`}
          to={"/dashboard/accesos"}
        >
          Accesos
        </Link>
      </aside>

      <div className="flex justify-end p-3 mb-3 lg:hidden">
        <button onClick={toggleNavBar} aria-label="Abrir menú">
          <Menu />
        </button>
      </div>

      <main className="flex-1 overflow-auto">
        <div className="w-11/12 max-w-7xl mx-auto py-3">
          <header className="flex flex-col mb-5 md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <LayoutDashboard size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Sistema de Gestión
              </span>
            </div>
          </header>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Dahsboard;
