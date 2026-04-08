import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import StudentDashboard from "./pages/StudentDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import ManagementDashboard from "./pages/ManagementDashboard";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/signup/:role" element={<SignUp />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/contractor" element={<ContractorDashboard />} />
        <Route path="/management" element={<ManagementDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;