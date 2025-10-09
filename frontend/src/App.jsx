import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import RegisterPage from "./pages/RegisterPage";
import AuthPage from "./pages/AuthPage";
import DetailsPage from "./pages/DetailsPage";
import "./App.css";   // ✅ import your CSS separately

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />     
        <Route path="/login" element={<LoginPage />} />  
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/details/:type/:id" element={<DetailsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
