import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Function to load user from localStorage
  const loadUser = () => {
    const token = localStorage.getItem("token");
  
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const currentTime = Date.now() / 1000;
  
        if (decodedUser.exp < currentTime) {
          logout();
        } else {
          const { userId, role } = decodedUser; // assuming these are in your token payload
          setCurrentUser({ userId, role });
        }
  
      } catch (error) {
        console.error("Invalid token", error);
        logout();
      }
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    loadUser(); // Load user when the component mounts

    // Listen for changes in localStorage (for login/logout sync across tabs)
    window.addEventListener("storage", loadUser);
    
    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
