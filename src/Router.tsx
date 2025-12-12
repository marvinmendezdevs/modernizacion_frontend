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

function Router() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tutoria" element={<Tutorship />} />

            <Route path="/diagnostico/:teacher/:section" element={<Diagnostic />} />
            <Route path="/observaciones/:teacherDui" element={<Observations />} />
            <Route path="/observaciones/:teacherId/:sectionId" element={<ObservationForm />} />

            <Route path="/retroalimentacion/:observationId" element={<Feedback />} />
            <Route path="/retroalimentacion/:observationId/create" element={<FeedBackCreate />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router
