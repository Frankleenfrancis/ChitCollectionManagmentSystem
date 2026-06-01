// src/api/authApi.js
import api from "./axios";

export const authApi = {
  login: async (username, password) => {
    try {
      const res = await api.post("/auth/login", { username, password });
      return res.data; // Return the whole response or specific data
    } catch (err) {
      // Improved error handling
      if (err.response) {
        // The server responded with a status outside the 2xx range
        console.error("Server Error:", err.response.status, err.response.data);
      } else if (err.request) {
        // The request was made but no response was received
        console.error("Network Error: No response received from server");
      } else {
        console.error("Request Setup Error:", err.message);
      }
      throw err; // Re-throw to let the component handle the UI update
    }
  },



  registerCustomer: async (payload) => {
    const res = await api.post("/auth/register", payload);
    return res.data.data;
  },

  createUserByAdmin: async (payload) => {
    const res = await api.post("/admin/create-user", payload);
    return res.data.data;
  },

  getAllUsers: async (page = 0, size = 3, search = "") => {
    const res = await api.get("/auth/users", {
      params: {
        page,
        size,
        search,
      },
    });

    return res.data.data;
  },

  createUserByAdmin: async (payload) => {
    const res = await api.post("/auth/admin/create-user", payload);  // ← add /auth/
    return res.data.data;
  },

};

const handleLogin = async (username, password) => {
  try {
    const data = await authApi.login(username, password);
    // Success! Redirect or store the token
  } catch (err) {
    // Show an alert or set an error state here
    alert("Login failed. Please check your credentials.");
  }
};