import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import Dahsboard from "./pages/Dahsboard"
import TutorshipDashboard from "./components/pages/dashboard/TutorshipDashboard"
import SchoolsDashboard from "./components/pages/dashboard/SchoolsDashboard"
import AccesosDashboard from "./components/pages/dashboard/AccesosDashboard"
import SeccionesClasesDashboard from "./components/pages/dashboard/SeccionesClasesDashboard"
import GestionEscolar from "./components/pages/dashboard/gestion_escolar/GestionEscolar"
import NoAccesos from "./components/pages/dashboard/no_accesos/NoAccesos"

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rutas permitidas del dashboard */}
        <Route element={<Dahsboard />}>
          <Route path="/dashboard" element={<SeccionesClasesDashboard />} />
          <Route
            path="/dashboard/centros-educativos"
            element={<SchoolsDashboard />}
          />
          <Route path="/dashboard/tutoria" element={<TutorshipDashboard />} />
          <Route
            path="/dashboard/gestion-escolar"
            element={<GestionEscolar />}
          />
          <Route path="/dashboard/no-accesos" element={<NoAccesos />} />
          <Route path="/dashboard/accesos" element={<AccesosDashboard />} />
        </Route>

        {/* Cualquier otra ruta redirige al dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router