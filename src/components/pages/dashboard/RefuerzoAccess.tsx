import SectionDashboard from "./reinforcement/SectionDashboard";
import StudentDashboard from "./reinforcement/StudentDashboard";
import TeacherDashboard from "./reinforcement/TeacherDashboard";

function RefuerzoAccess({
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

export default RefuerzoAccess
