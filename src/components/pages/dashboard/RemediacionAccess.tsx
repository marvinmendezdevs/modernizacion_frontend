import SectionDashboard from "./remediation/SectionDashboard";
import StudentDashboard from "./remediation/StudentDashboard";
import TeacherDashboard from "./remediation/TeacherDashboard";

function RemediacionAccess({
  startDate,
  endDate,
  activeGroup,
}: {
  startDate: string;
  endDate: string;
  activeGroup: 1 | 2;
}) {
  return (
    <div>
          <TeacherDashboard startDate={startDate} endDate={endDate} activeGroup={activeGroup}/>
          <StudentDashboard startDate={startDate} endDate={endDate} activeGroup={activeGroup}/>
          <SectionDashboard startDate={startDate} endDate={endDate} activeGroup={activeGroup}/>
    </div>
  )
}

export default RemediacionAccess
