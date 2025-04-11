import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Flashcards from './components/Flashcards';
import Resources from './components/Resources';
import Feedback from './components/Feedback';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      {location.pathname !== '/' && <Sidebar darkMode={darkMode} />}

      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-colors duration-200 relative">
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 z-10"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/" element={<LoginPage darkMode={darkMode} />} />
            <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />} />
            <Route path="/flashcards" element={<Flashcards darkMode={darkMode} />} />
            <Route path="/resources" element={<Resources darkMode={darkMode} />} />
            <Route path="/feedback" element={<Feedback darkMode={darkMode} />} />
          </Routes>
        </main>
      </div>
    </div>
    
  );
}

function AppWrapper() {
  return (
    <Router>
      
      <App />
    </Router>
  );
}

export default AppWrapper;