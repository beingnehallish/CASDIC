// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import LandingPage from "./pages/LandingPage";
// import LoginPage from "./pages/LoginPage";
// import UserDashboard from "./pages/UserDashboard";
// import EmployeeDashboard from "./pages/EmployeeDashboard";
// import RegisterPage from "./pages/RegisterPage";
// import AuthPage from "./pages/AuthPage";
// import DetailsPage from "./pages/DetailsPage";
// import "./App.css";   // ✅ import your CSS separately

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<LandingPage />} />     
//         <Route path="/login" element={<LoginPage />} />  
//         <Route path="/auth" element={<AuthPage />} />
//         <Route path="/user" element={<UserDashboard />} />
//         <Route path="/employee" element={<EmployeeDashboard />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/details/:type/:id" element={<DetailsPage />} />
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// IMPORTANT: Import the theme hook
import { useTheme } from './context/ThemeContext.jsx'; 

// Import your pages (you might need to add .jsx if Vite complains)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import DetailsPage from './pages/DetailsPage';
import AuthPage from './pages/AuthPage'; // Added this from your file

// Main App component
function App() {
  // IMPORTANT: Get the current theme
  const { theme } = useTheme();

  return (
    // IMPORTANT: This div applies the 'light' or 'dark' class
    // This is the "necessary detail" that was missing
    <div className={`app-container ${theme}`}>
      
      {/* NO <BrowserRouter> here! 
        It's in main.jsx, which is correct.
      */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/user" element={<UserDashboard />} />
        
        {/* This route matches the URL from your earlier screenshot */}
        <Route path="/casdic_citizen" element={<UserDashboard />} />
        
        <Route path="/employee"                             element={<EmployeeDashboard />} />
        <Route path="/details/:type/:id" element={<DetailsPage />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;