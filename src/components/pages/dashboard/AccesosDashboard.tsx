import TeacherDashboard from "./TeacherDashboard"
import StudentDashboard from "./StudentDashboard"
import SectionDashboard from "./SectionDashboard"

function AccesosDashboard() {

  return (
    <div className="flex flex-col gap-3">
        <TeacherDashboard/>
        <StudentDashboard/> 
        <SectionDashboard/>
    </div>
  )
}

export default AccesosDashboard
