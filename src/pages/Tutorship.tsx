import TutorLeader from "@/components/pages/TutorLeader";
import TutorshipTutor from "@/components/pages/TutorshipTutor";
import useAuth from "@/hooks/useAuth.hooks"
import { Navigate } from "react-router";
import TutorshipTutorVirtual from "@/components/pages/TutorshipTutorVirtual";

function Tutorship() {

    const { data: user } = useAuth();

    if(!user) return <Navigate replace to="/login" />
    if(user.role.name === 'Tutor (Supervisor)') return <TutorLeader />
    if(user.infoTutores.type === 'VIRTUAL') {
        return <TutorshipTutorVirtual />
    }else{
        return <TutorshipTutor />
    }

    return <p>Acceso denegado</p>
}

export default Tutorship