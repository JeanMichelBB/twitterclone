// src/App.tsx
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './Layout';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './pages/Home/Home';
import MessageList from './pages/Messages/MessageList';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound/NotFound';
import Status from './pages/Status/Status';
import ComingSoon from './pages/ComingSoon/ComingSoon';
import Footer from './components/Footer/Footer';
import Search from './components/Search/Search';
import CookieBanner from './components/CookieBanner/CookieBanner';
import User from './UserModel';
import { apiUrl, getAuthHeader, handleUnauthorized } from './api';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';

// Global axios interceptor — auto-logout on 401 / 403
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<User>({} as User);
  const isMobile = useMediaQuery({ maxWidth: 767 });


  useEffect(() => {
    const checkAuthenticated = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${apiUrl}/protected`, {
            headers: { ...getAuthHeader() },
          });
          if (response.status === 200) {
            setIsAuthenticated(true);// userdata
            // Fetch username here
            const userDataResponse = await fetch(`${apiUrl}/userdata`, {
              headers: { ...getAuthHeader() },
            });
            const userData = await userDataResponse.json();
            setUsername(userData.username);
            setUser(userData);
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
      <CookieBanner />
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
                      user={user}
                      leftChild={<Home user={user} />} // Render Home component in the left section
                      rightChild={<Footer user={user} />} // Empty div in the right section
                    />
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <Layout
                      username={username}
                      user={user}
                      leftChild={<MessageList user={user} />} // Render MessageList component in the left section
                      // Empty div in the right section
                      rightChild={
                        <div>
                          {isMobile ? (
                          <Footer user={user} />
                        ) : (
                          <div></div>
                        )}
                        </div>
                      }
                    />
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <Layout
                      username={username}
                      user={user}
                      leftChild={<Settings user={user} />} // Corrected to pass user prop as lowercase
                      rightChild={<div>
                        {isMobile ? (
                        <Footer user={user} />
                      ) : (
                        <div></div>
                      )}
                      </div>
                      } // Empty div in the right section
                    />
                  }
                />

                <Route
                  path="/:username"
                  element={
                    <Layout
                      username={username}
                      user={user}
                      leftChild={<Profile logUsername={username} user={user} />} // Render Profile component in the left section
                      rightChild={<Footer user={user} />} // Empty div in the right section
                    />
                  }
                />
                <Route
                  path="search"
                  element={
                    <Layout
                      username={username}
                      user={user}
                      leftChild={<Search />} // Render Search component in the left section
                      rightChild={<Footer user={user} />} // Empty div in the right section
                    />
                  }
                />
                <Route
                  path="/status/:tweetId"
                  element={
                    <Layout
                      username={username}
                      user={user}
                      leftChild={<Status user={user} />}
                      rightChild={<Footer user={user} />}
                    />
                  }
                />
                {[
                    { path: '/explore', name: 'Explore' },
                    { path: '/notifications', name: 'Notifications' },
                    { path: '/grok', name: 'Grok' },
                    { path: '/lists', name: 'Lists' },
                    { path: '/bookmarks', name: 'Bookmarks' },
                    { path: '/communities', name: 'Communities' },
                    { path: '/premium', name: 'Premium' },
                ].map(({ path, name }) => (
                    <Route
                        key={path}
                        path={path}
                        element={
                            <Layout
                                username={username}
                                user={user}
                                leftChild={<ComingSoon pageName={name} />}
                                rightChild={<Footer user={user} />}
                            />
                        }
                    />
                ))}
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
