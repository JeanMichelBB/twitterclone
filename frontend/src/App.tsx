import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './Layout';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './pages/Home/Home';
import Messages from './pages/Messages/Messages';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound/NotFound';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const checkAuthenticated = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://127.0.0.1:8000/protected', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            setIsAuthenticated(true);
            // Fetch username here
            const userDataResponse = await fetch('http://127.0.0.1:8000/userdata', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const userData = await userDataResponse.json();
            setUsername(userData.username);
          }
        }
      } catch (err) {
        console.error('Authentication error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthenticated();
  }, []);

  if (loading) {
    // Render loading indicator while checking authentication status
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Login, Signup) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout username={username}> {/* Pass username to the Layout component */}
                <Routes>
                  <Route index element={<Home />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/:username" element={<Profile logUsername={username} />} /> {/* Profile route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
