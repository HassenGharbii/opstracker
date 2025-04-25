import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import TestObvious from './pages/Test';

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
          path="/test" 
          element={isAuthenticated ? <TestObvious /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/test" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
