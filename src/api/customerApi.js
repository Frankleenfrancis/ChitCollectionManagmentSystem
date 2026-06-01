// src/api/customerApi.js
import api from "./axios";

export const customerApi = {
  getAll: async (page = 0, size = 10, sortBy = "createdAt", direction = "desc") => {
    const res = await api.get("/customers", {
      params: { page, size, sortBy, direction },
    });
    return res.data.data;
  },

  getById: async (id) => {
    const res = await api.get(`/customers/${id}`);
    return res.data.data;
  },

  getByPhone: async (phone) => {
    const res = await api.get(`/customers/phone/${phone}`);
    return res.data.data;
  },

  search: async (keyword, page = 0, size = 10) => {
    const res = await api.get("/customers/search", {
      params: { keyword, page, size },
    });
    return res.data.data;
  },

  create: async (payload) => {
    const res = await api.post("/customers", payload);
    return res.data.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/customers/${id}`, payload);
    return res.data?.data || res.data;
  },

  deactivate: async (id) => {
    const res = await api.delete(`/customers/${id}`);
    return res.data.data;
  },

  createUserForCustomer: async (id) => {
    const res = await api.post(`/customers/${id}/create-user`);
    return res.data.data;
  },

  getMyProfile: async () => {
    const res = await api.get("/customers/my-profile");
    return res.data;
  },

  getDashboard: async () => {
    const res = await api.get("/customers/dashboard");
    return res.data.data;
  },
};