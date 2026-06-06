import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        try {
            const savedUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (savedUser && token) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error("Failed to restore user:", error);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    }, []);

  
    const login = async (username, password) => {
        try {
            setLoading(true);

            const response = await authApi.login(username, password);
            const data = response?.data ?? response;

            const userData = {
                userId: data.userId,
                username: data.username,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                role: data.role,
                customerId: data.customerId ?? null,
            };

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(userData));

            setUser(userData);

            return userData;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("customerId"); // ✅ must be here
        setUser(null);
    };


    const isAdmin = user?.role === "ADMIN";
    const isAgent = user?.role === "AGENT";
    const isCustomer = user?.role === "CUSTOMER";
    const isUser = user?.role === "USER";

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login,
                logout,
                loading,
                isAdmin,
                isAgent,
                isCustomer,
                isUser,
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