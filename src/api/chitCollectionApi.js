// src/api/chitCollectionApi.js

import api from "./axios";


const extract = (res) => res.data?.data ?? res.data;

export const chitCollectionApi = {



    enrollCustomer: async (enrollmentRequest) => {

        const response = await api.post("/enrollments", enrollmentRequest);
        return extract(response);
    },

    getEnrollmentById: async (id) => {

        const response = await api.get(`/enrollments/${id}`);
        return extract(response);
    },

    getAllEnrollments: async (page = 0, size = 10) => {

        const response = await api.get("/enrollments", {
            params: { page, size },
        });
        return extract(response);
    },

    getEnrollmentsByCustomer: async (customerId) => {

        const response = await api.get(`/enrollments/customer/${customerId}`);
        return extract(response);
    },

    getEnrollmentsByPlan: async (planId) => {

        const response = await api.get(`/enrollments/plan/${planId}`);
        return extract(response);
    },



    createCollectionEntry: async (collectionEntryRequest) => {

        const response = await api.post("/collections", collectionEntryRequest);
        return extract(response);
    },

    getCollectionEntryById: async (id) => {

        const response = await api.get(`/collections/${id}`);
        return extract(response);
    },

    getCollectionHistoryByEnrollment: async (enrollmentId) => {

        const response = await api.get(`/collections/enrollment/${enrollmentId}`);
        return extract(response);
    },

    getCollectionHistoryByCustomer: async (customerId) => {

        const response = await api.get(`/collections/customer/${customerId}`);
        return extract(response);
    },


    getPendingCollections: async (customerId) => {

        const response = await api.get(`/collections/pending/customer/${customerId}`);
        return extract(response);
    },


    getOverdueCollections: async () => {

        const response = await api.get("/collections/overdue");
        return extract(response);
    },
};