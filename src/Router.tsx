import { BrowserRouter, Routes, Route } from "react-router"
import Login from "./pages/Login"
import AppLayout from "./components/layouts/AppLayout"
import ProtectedRoute from "./components/layouts/ProtectedRoute"
import Home from "./pages/Home"

function Router() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tutoria" element={<Home />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router
