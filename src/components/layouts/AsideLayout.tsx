import Env from "@/utils/index.utils";
import { GraduationCap, LayoutDashboard, LogOut } from "lucide-react";
import SidebarItem from "./SidebarItem";
import { useActiveNavItem, useNavbar } from "@/stores/index.store";
import { useNavigate } from "react-router";
import useAuth from "@/hooks/useAuth.hooks";
import NavLinksVerificator from "./NavLinksVerificator";


function AsideLayout() {
  const { data: user } = useAuth();

  const isOpen = useNavbar((state) => state.isOpen);
  const activeTab = useActiveNavItem((state) => state.tab);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("AUTH_TOKEN");
    navigate("/login");
  };

  if (user) return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="p-2 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900">{Env.VITE_APP_NAME}</span>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Principal
          </p>

          <div>
            <SidebarItem
              icon={<LayoutDashboard />}
              label="Inicio"
              active={activeTab === "/"}
              path="/"
            />
            {/* <NavLinksVerificator allowedRoles={["Tutor", "Tutor (Supervisor)"]} userRole={user.role.name}>
              <SidebarItem
                icon={<GraduationCap />}
                label="Tutoría"
                active={activeTab === "/tutoria"}
                path="tutoria"
              />
            </NavLinksVerificator> */}

            {/* <NavLinksVerificator allowedRoles={["Monitor (Gestión Escolar)"]} userRole={user.role.name}>
              <SidebarItem
                icon={<HatGlasses />}
                label="Monitoreo"
                active={activeTab === "/monitores"}
                path="monitores"
              />
            </NavLinksVerificator> */}
          </div>

          {/* <NavLinksVerificator allowedRoles={["Facilitador (Gestión Escolar)"]} userRole={user.role.name}>
            <SidebarItem
              icon={<GraduationCap />}
              label="Centros Escolares"
              active={activeTab === "/facilitadores"}
              path="facilitadores"
            />
          </NavLinksVerificator> */}

          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8">
            Administración
          </p>
          <NavLinksVerificator allowedRoles={["Administrador"]} userRole={user.role.name}>
            <SidebarItem
              icon={<GraduationCap />}
              label="Dashboard"
              active={activeTab === "/dashboard/update"}
              path="dashboard/update"
            />
          </NavLinksVerificator>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AsideLayout;
