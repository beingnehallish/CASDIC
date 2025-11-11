// import { useEffect, useState } from "react";
// import axios from "axios";
// import TechnologiesPage from "../pages/employee/technologies.jsx";
// import DashboardPage from "../pages/employee/dashboard.jsx";
// import ProjectsPage from "../pages/employee/projects.jsx";
// import CompaniesPage from "../pages/employee/companies.jsx";
// import PatentsPage from "../pages/employee/patents.jsx";
// import PublicationsPage from "../pages/employee/publications.jsx";
// import EmployeesPage from "../pages/employee/employees.jsx"; 
// import ReportsPage from "../pages/employee/reports.jsx"; 
// import SettingsPage from "../pages/employee/settings.jsx"; 
// import "../styles/EmployeeDashboard.css"; // This CSS file will be updated

// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// import { useTheme } from "../context/ThemeContext"; // 1. Import the hook
// import { FaMoon, FaSun } from "react-icons/fa";

// export default function EmployeeDashboard() {
//   const token = localStorage.getItem("token");
//   const [activeTab, setActiveTab] = useState("Dashboard");

  
//   return (
//     <div className="empdashboard">
//       <aside className="empsidebar">
//         <h2>Employee Panel</h2>
//         <ul>
//           {[
//             "Dashboard",
//             "Technologies",
//             "Projects",
//             "Companies",
//             "Patents",
//             "Publications",
//             "Employees",
//             "Reports",
//             "Settings",
//           ].map((tab) => (
//             <li
//               key={tab}
//               className={activeTab === tab ? "active" : ""}
//               onClick={() => setActiveTab(tab)}
//             >
//               {tab}
//             </li>
//           ))}
//         </ul>
//         {/* 3. Add the toggle button */}
//         <button className="theme-toggle-sidebar" onClick={toggleTheme}>
//           {theme === "dark" ? "Light Mode" : "Dark Mode"}
//         </button>
//       </aside>

//       <main className="empmain-content">
//         {activeTab === "Dashboard" && <DashboardPage />}
//         {activeTab === "Technologies" && <TechnologiesPage />}
//         {activeTab === "Projects" && <ProjectsPage />}
//         {activeTab === "Companies" && <CompaniesPage />}
//         {activeTab === "Patents" && <PatentsPage />}
//         {activeTab === "Publications" && <PublicationsPage />}
//         {activeTab === "Employees" && <EmployeesPage />}
        
//         {/* --- Reports Tab (Unchanged) --- */}
//         {activeTab === "Reports" && <ReportsPage/>}

//         {/* --- NEW Settings Tab --- */}
//         {activeTab === "Settings" && <SettingsPage/>}
//         </main>
//         </div>
//   )
// }

import { useEffect, useState } from "react";
import axios from "axios";
import TechnologiesPage from "../pages/employee/technologies.jsx";
import DashboardPage from "../pages/employee/dashboard.jsx";
import ProjectsPage from "../pages/employee/projects.jsx";
import CompaniesPage from "../pages/employee/companies.jsx";
import PatentsPage from "../pages/employee/patents.jsx";
import PublicationsPage from "../pages/employee/publications.jsx";
import EmployeesPage from "../pages/employee/employees.jsx"; 
import ReportsPage from "../pages/employee/reports.jsx"; 
import SettingsPage from "../pages/employee/settings.jsx"; 
import "../styles/EmployeeDashboard.css"; // This CSS file will be updated

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useTheme } from "../context/ThemeContext"; // 1. Import the hook
import { FaMoon, FaSun } from "react-icons/fa";

export default function EmployeeDashboard() {
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("Dashboard");

  // --- THIS IS THE FIX ---
  // You imported the hook, but you need to *call* it
  // to get the theme and toggleTheme variables.
  const { theme, toggleTheme } = useTheme(); 
  // --- END OF FIX ---

  return (
    <div className="empdashboard">
      <aside className="empsidebar">
        <h2>Employee Panel</h2>
        <ul>
          {[
            "Dashboard",
            "Technologies",
            "Projects",
            "Companies",
            "Patents",
            "Publications",
            "Employees",
            "Reports",
            "Settings",
          ].map((tab) => (
            <li
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
        {/* 3. Add the toggle button */}
        <button className="theme-toggle-sidebar" onClick={toggleTheme}>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </aside>

      <main className="empmain-content">
        {activeTab === "Dashboard" && <DashboardPage />}
        {activeTab === "Technologies" && <TechnologiesPage />}
        {activeTab === "Projects" && <ProjectsPage />}
        {activeTab === "Companies" && <CompaniesPage />}
        {activeTab === "Patents" && <PatentsPage />}
        {activeTab === "Publications" && <PublicationsPage />}
        {activeTab === "Employees" && <EmployeesPage />}
        
        {/* --- Reports Tab (Unchanged) --- */}
        {activeTab === "Reports" && <ReportsPage/>}

        {/* --- NEW Settings Tab --- */}
        {activeTab === "Settings" && <SettingsPage/>}
        </main>
        </div>
  )
}