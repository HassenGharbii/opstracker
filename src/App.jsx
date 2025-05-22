import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import TestObvious from './pages/AlarmsPage';
import RadioPage from './pages/RadioPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('obviousToken'));

  useEffect(() => {
    // Update authentication status when the token changes in localStorage
    const token = localStorage.getItem('obviousToken');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        
        
      <Route 
  path="/login" 
  element={<Login setIsAuthenticated={setIsAuthenticated} />} 
/>

        <Route 
          path="/alarms" 
          element={isAuthenticated ? <TestObvious /> : <Navigate to="/login" />} 
        />
         <Route 
          path="/radios" 
          element={isAuthenticated ? <RadioPage /> : <Navigate to="/login" />} 
        />
        
      </Routes>
    </Router>
  );
}

export default App;
