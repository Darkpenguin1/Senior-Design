import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import AuthForm from "./pages/AuthForm";
import StudentDashboard from "./pages/StudentDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import ManagementDashboard from "./pages/ManagementDashboard";

const ProtectedRoute = ({ role, children }) => {
  const storedRole = localStorage.getItem("role");
  if (storedRole !== role) return <Navigate to="/signin" replace />;
  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/contractor" element={<ContractorDashboard />} />
        <Route path="/management" element={<ManagementDashboard />} />
        <Route path="/student/tickets" element={<StudentTickets />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;