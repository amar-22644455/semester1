import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on initial load
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      //Headers are used to send additional information about the request to the server.
      //In this case, the Authorization header is used to send a JWT token to authenticate the user.
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setCurrentUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await response.json();
    if (response.ok) {
      setCurrentUser(data.user);
      navigate('/');
    }
    return data;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setCurrentUser(null);
    navigate('/LoginXP');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };
  // The AuthContext.Provider component is used to wrap the children components and provide them with access to the authentication context. The value prop of the provider is set to an object that contains the currentUser, login, logout, and loading state. If the loading state is true, a loading spinner is displayed; otherwise, the children components are rendered.
  return (
    <AuthContext.Provider value={value}>
    {loading ? <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div> : children}
  </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}