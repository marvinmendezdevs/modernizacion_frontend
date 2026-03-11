import SectionDashboard from "./remediation/SectionDashboard";
import StudentDashboard from "./remediation/StudentDashboard";
import TeacherDashboard from "./remediation/TeacherDashboard";

type CategoryTab = "Diario" | "Acumulado";

function RemediacionAccess({
  startDate,
  endDate,
  activeGroup,
  activeCategory,
}: {
  startDate: string;
  endDate: string;
  activeGroup: 1 | 2;
  activeCategory: CategoryTab;
}) {
  return (
    <div>
      <TeacherDashboard
        startDate={startDate}
        endDate={endDate}
        activeGroup={activeGroup}
        activeCategory={activeCategory}
      />
      <StudentDashboard
        startDate={startDate}
        endDate={endDate}
        activeGroup={activeGroup}
        activeCategory={activeCategory}
      />
      <SectionDashboard
        startDate={startDate}
        endDate={endDate}
        activeGroup={activeGroup}
        activeCategory={activeCategory}
      />
    </div>
  );
}

export default RemediacionAccess;