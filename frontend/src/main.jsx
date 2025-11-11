// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import App from './App.jsx';

// // 1. Import the new ThemeProvider
// import { ThemeProvider } from './context/ThemeContext.jsx';

// // 2. Import the new global theme.css and your original index.css
// import './styles/theme.css';
// import './index.css';

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <BrowserRouter>
//       {/* 3. Wrap your entire App in the ThemeProvider */}
//       <ThemeProvider>
//         {/* 4. Add the global background elements */}
//         <div className="clp-bg-grid" aria-hidden="true" />
//         <div className="clp-bg-glow clp-glow-a" aria-hidden="true" />
//         <div className="clp-bg-glow clp-glow-b" aria-hidden="true" />
        
//         <App />
//       </ThemeProvider>
//     </BrowserRouter>
//   </StrictMode>
// );


import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// 1. Import the ThemeProvider
import { ThemeProvider } from './context/ThemeContext.jsx';

// 2. Import the CSS files
import './styles/theme.css'; // <-- This fixes the "dark screen"
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 3. Wrap everything in the ThemeProvider */}
      <ThemeProvider>
        
        {/* 4. Add your global background elements back in */}
        {/* This will fix the GSAP warnings */}
        <div className="clp-bg-grid" aria-hidden="true" />
        
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);