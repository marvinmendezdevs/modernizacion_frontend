import Tutorship from "@/components/pages/Tutorship";
import useAuth from "@/hooks/useAuth.hooks";
import { Navigate } from "react-router";
import MonitorDashboard from "@/components/pages/MonitorDashboard";
function Home() {
  const { data: user } = useAuth();

  if (!user) return <Navigate to="/login" replace />

  if (user.role.name === 'Tutor' || user.role.name === 'Tutor (Supervisor)') return <Tutorship />

  if (user.role.name === 'Monitor (Gestión Escolar)') return <MonitorDashboard />

  return <p>Acceso denegado</p>
}

export default Home;