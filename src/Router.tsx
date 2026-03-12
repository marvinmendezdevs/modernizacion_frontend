import { BrowserRouter, Routes, Route } from "react-router"
import Login from "./pages/Login"
import AppLayout from "./components/layouts/AppLayout"
import ProtectedRoute from "./components/layouts/ProtectedRoute"
import Home from "./pages/Home"
import Tutorship from "./pages/Tutorship"
import Diagnostic from "./pages/Diagnostic"
import Observations from "./pages/Observations"
import ObservationForm from "./components/pages/ObservationForm"
import Feedback from "./pages/Feedback"
import FeedBackCreate from "./components/pages/FeedBackCreate"
import FeedBackView from "./components/pages/FeedBackView"
import TutorshipInfoTutor from "./components/pages/TutorshipInfoTutor"
import Facilitadores from "./pages/Facilitadores"
import Monitores from "./pages/Monitores"
import AppRoleValidator from "./components/layouts/AppRoleValidator"
import MonitorOptimizationForm from "./pages/MonitorOptimizationForm"
import MonitorDashboard from "./components/pages/MonitorDashboard"
import SchoolUpdate from "./components/pages/SchoolUpdate"
import Remediation from "./components/pages/Remediation"
import ReinforcementForm from "./components/pages/ReinforcementForm"
import RemediationForm from "./components/pages/RemediationForm"
import BaseFormRemediation from "./components/pages/BaseFormRemediation"
import FacilitatorTeacherList from "./pages/FacilitatorTeacherList"
import FacilitadoresHome from "./pages/FacilitadoresHome"
import Dahsboard from "./pages/Dahsboard"
import TutorshipDashboard from "./components/pages/dashboard/TutorshipDashboard"
import SchoolManagementDashboard from "./components/pages/dashboard/school_management/SchoolManagementDashboard"
import SchoolsDashboard from "./components/pages/dashboard/SchoolsDashboard"
import AccesosDashboard from "./components/pages/dashboard/AccesosDashboard"
import SeccionesClasesDashboard from "./components/pages/dashboard/SeccionesClasesDashboard"

function Router() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Dahsboard />}>
          <Route index path="dashboard" element={<SchoolsDashboard />} />
          <Route path="/dashboard/accesos" element={<AccesosDashboard />} />
          <Route path="dashboard/tutoria" element={<TutorshipDashboard />} />
          <Route path="dashboard/gestion-escolar" element={<SchoolManagementDashboard />} />
          <Route path="dashboard/secciones" element={<SeccionesClasesDashboard />} />

        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />

            {/* Tutoria */}
            <Route element={<AppRoleValidator allowedRoles={["Tutor (Supervisor)", "Tutor"]} />}>
              <Route path="/tutoria" element={<Tutorship />} />
              <Route path="/diagnostico/:teacher/:section" element={<Diagnostic />} />
              <Route path="/observaciones/:teacherDui" element={<Observations />} />
              <Route path="/observaciones/:teacherId/:sectionId" element={<ObservationForm />} />
              <Route path="/retroalimentacion/:observationId" element={<Feedback />} />
              <Route path="/retroalimentacion/:idFeedBack/view" element={<FeedBackView />} />
              <Route path="/retroalimentacion/:observationId/create" element={<FeedBackCreate />} />
              <Route path="/tutoria/tutor/:username" element={<TutorshipInfoTutor />} />
            </Route>

            {/* Gestion Escolar */}
            <Route path="/monitores" element={<AppRoleValidator allowedRoles={["Monitor (Gestión Escolar)"]} />}>
              <Route index element={<Monitores />} />
              <Route path="dashboard" element={<MonitorDashboard />} />
              <Route path="formulario/:schoolCode/optimizacion" element={<MonitorOptimizationForm />} />
            </Route>

            <Route path="/schools" element={<AppRoleValidator allowedRoles={["Monitor (Gestión Escolar)"]} />}>
              <Route path=":schoolCode/update" element={<SchoolUpdate />} />
              <Route path=":schoolCode/remediation" element={<Remediation />} />
              <Route path="general/form" element={<BaseFormRemediation />} />
              <Route path="reinforcement/form" element={<ReinforcementForm />} />
              <Route path="remediation/form" element={<RemediationForm />} />
            </Route>

            <Route path="/facilitadores" element={<AppRoleValidator allowedRoles={["Facilitador (Gestión Escolar)"]} />}>
              <Route element={<FacilitadoresHome />} />
              <Route index element={<Facilitadores />} />
              <Route path=":schoolCode/escuela" element={<FacilitatorTeacherList />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router
