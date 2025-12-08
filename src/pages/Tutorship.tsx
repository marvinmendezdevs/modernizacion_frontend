import TutorshipTutor from "@/components/pages/TutorshipTutor";
import useAuth from "@/hooks/useAuth.hooks"
import { Navigate } from "react-router";

function Tutorship() {

    const { data: user } = useAuth();

    if(!user) return <Navigate replace to="/login" />

    if(user.role.name === 'Tutor') return <TutorshipTutor />

    return <p>Acceso denegado</p>
}

export default Tutorship