import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import AuthForm from "./pages/AuthForm";
import SignUp from "./pages/SignUp"; // 1. Ensure this import is finished
import StudentDashboard from "./pages/StudentDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import ManagementDashboard from "./pages/ManagementDashboard";
import ApiTesting from "./pages/ApiTesting";
import "./App.css";

// The Gatekeeper logic
const ProtectedRoute = ({ role, children }) => {
  const storedRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  
  // If no token or wrong role, bounce to signin
  if (!token || storedRole !== role) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES - No protection needed */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signin/:role" element={<AuthForm />} />
        <Route path="/signup" element={<SignUp />} /> {/* 2. Added the SignUp route here */}
        <Route path="/api-testing" element={<ApiTesting />} />

        {/* PROTECTED ROUTES - Role based */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contractor"
          element={
            <ProtectedRoute role="contractor">
              <ContractorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management"
          element={
            <ProtectedRoute role="management">
              <ManagementDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: redirect unknown paths to signin */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;