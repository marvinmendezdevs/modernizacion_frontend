import SectionDashboard from "./reinforcement/SectionDashboard";
import StudentDashboard from "./reinforcement/StudentDashboard";
import TeacherDashboard from "./reinforcement/TeacherDashboard";

type CategoryTab = "Diario" | "Acumulado";

function RefuerzoAccess({
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

export default RefuerzoAccess;