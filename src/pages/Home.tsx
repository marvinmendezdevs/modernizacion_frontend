import useAuth from "@/hooks/useAuth.hooks";
import { Navigate } from "react-router";
import Tutorship from "@/components/pages/Tutorship"

function Home() {
  const { data: user } = useAuth(); 

  if(!user) return <Navigate to="/login" replace />

  if(user.role.name === 'Tutor') return <Tutorship />

  return <p>Acceso denegado</p>
}

export default Home;