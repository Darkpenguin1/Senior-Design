import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import StudentDashboard from "./pages/StudentDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import ManagementDashboard from "./pages/ManagementDashboard";
import ApiTesting from "./pages/ApiTesting";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/contractor" element={<ContractorDashboard />} />
        <Route path="/management" element={<ManagementDashboard />} />
        <Route path="/api-testing" element={<ApiTesting />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;