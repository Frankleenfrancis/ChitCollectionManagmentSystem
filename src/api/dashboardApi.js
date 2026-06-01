// src/api/dashboardApi.js
import api from "./axios";

export const dashboardApi = {
  getReport: async () => {
    const res = await api.get("/dashboard");

    console.log("Dashboard API Response:", res.data);

    return res.data.data;
  },

  getDashboard: async () => {
    const response =
      await api.get("/customers/dashboard");

    return response.data;
  }

};