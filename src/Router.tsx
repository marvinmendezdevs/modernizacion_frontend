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
import Facilitadores from "./components/pages/Facilitadores"
import Monitores from "./pages/Monitores"
import AppRoleValidator from "./components/layouts/AppRoleValidator"
import MonitorOptimizationForm from "./pages/MonitorOptimizationForm"
import SchoolUpdate from "./components/pages/SchoolUpdate"

function Router() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
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
              <Route path="formulario/:schoolCode/optimizacion" element={<MonitorOptimizationForm />} />
            </Route>
            
            <Route path="/schools" element={<AppRoleValidator allowedRoles={["Monitor (Gestión Escolar)"]} />}>
              <Route path=":schoolCode/update" element={<SchoolUpdate />} />
            </Route>

            <Route path="/facilitadores" element={<Facilitadores />} />


          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router
