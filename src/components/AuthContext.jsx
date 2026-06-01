import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  //LOGIN
  const login = async (username, password) => {
    setLoading(true);

    try {
      const res = await authApi.login(username, password);
      const data = res?.data ?? res;

      const token = data?.token;

      const userData = {
        userId: data?.userId,
        username: data?.username,
        fullName: data?.fullName,
        email: data?.email,
        phone: data?.phone,
        role: data?.role,
      };

      if (!token || !userData.userId) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

      return userData;

    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // ROLE HELPERS
  const isAdmin = user?.role === "ADMIN";
  const isAgent = user?.role === "AGENT";
  const isCustomer = user?.role === "CUSTOMER";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,

        // roles
        isAdmin,
        isAgent,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};