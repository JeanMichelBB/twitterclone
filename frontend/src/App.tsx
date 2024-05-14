// src/App.tsx
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
import Footer from './components/Footer/Footer';
import User from './UserModel';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<User>({} as User);
  

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
            setUser(userData);
            console.log('User data:', userData);
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
              <Routes>
                {/* Layout with children for Home and Profile pages */}
                <Route
                  path="/"
                  element={
                    <Layout
                      username={username}
                      leftChild={<Home />} // Render Home component in the left section
                      rightChild={<Footer />} // Empty div in the right section
                    />
                  }
                />
                <Route 
                path="/messages"
                 element={ 
                  <Layout
                  username={username}
                  leftChild={<Messages user={user} />} // Render Messages component in the left section
                  // Empty div in the right section
                  rightChild={<div></div>}
                  />
                }
                />

                <Route 
                  path="/settings" 
                    element={ 
                      <Layout
                      username={username}
                      leftChild={<Settings />} // Render Settings component in the left section
                      rightChild={<div></div>} // Empty div in the right section
                      />
                    }
                />
                   
                <Route
                  path="/:username"
                  element={
                    <Layout
                      username={username}
                      leftChild={<Profile logUsername={username} />} // Render Profile component in the left section
                      rightChild={<Footer />} // Empty div in the right section
                    />
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
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
