// src/api/chitPlanApi.js
import api from "./axios";

const extract = (res) => res.data?.data ?? res.data;

export const chitPlanApi = {
  // Existing function mapped from your controller configuration
  getAllPlans: async (page = 0, size = 10) => {
    const res = await api.get("/chit-plans", { params: { page, size } });
    return extract(res);
  },

  // ✅ ADD THIS LINE: Backward compatibility alias to catch components calling .getAll()
  getAll: async (page = 0, size = 10) => {
    return chitPlanApi.getAllPlans(page, size);
  },

  // GET /chit-plans/{id}
  getById: async (id) => {
    const res = await api.get(`/chit-plans/${id}`);
    return extract(res);
  },

  // GET /chit-plans/available
  getAvailable: async () => {
    const res = await api.get("/chit-plans/available");
    return extract(res);
  },

  // GET /chit-plans/status/{status}
  getByStatus: async (status) => {
    const res = await api.get(`/chit-plans/status/${status}`);
    return extract(res);
  },

  // POST /chit-plans/create 
  // FIXED: Aligned with your .requestMatchers("/api/v1/chit-plans/create")
  create: async (payload) => {
    const res = await api.post("/chit-plans/create", payload);
    return extract(res);
  },


  update: async (id, payload) => {
    const res = await api.put(`/chit-plans/update/${id}`, payload);
    return extract(res);
  },


  updateStatus: async (id, status) => {
    const res = await api.patch(`/chit-plans/delete/${id}/status`, null, { params: { status } });
    return extract(res);
  },
};