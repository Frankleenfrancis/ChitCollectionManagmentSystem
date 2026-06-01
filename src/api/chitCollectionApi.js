import api from "./axios";

// Safely extracts nested data nodes or drops back to standard Axios responses
const extract = (res) => res.data?.data ?? res.data;

export const chitCollectionApi = {

    // --- ENROLLMENTS OPERATIONS ---

    enrollCustomer: async (enrollmentRequest) => {
        // FIXED: Changed from "/api/v1/enrollments" to "/enrollments"
        const response = await api.post("/enrollments", enrollmentRequest);
        return extract(response);
    },

    getEnrollmentById: async (id) => {
        // FIXED: Changed from `/api/v1/enrollments/${id}` to `/enrollments/${id}`
        const response = await api.get(`/enrollments/${id}`);
        return extract(response);
    },

    getAllEnrollments: async (page = 0, size = 10) => {
        // FIXED: Changed from "/api/v1/enrollments" to "/enrollments"
        const response = await api.get("/enrollments", {
            params: { page, size },
        });
        return extract(response);
    },

    getEnrollmentsByCustomer: async (customerId) => {
        // FIXED: Changed from `/api/v1/enrollments/customer/${customerId}` to `/enrollments/customer/${customerId}`
        const response = await api.get(`/enrollments/customer/${customerId}`);
        return extract(response);
    },

    getEnrollmentsByPlan: async (planId) => {
        // FIXED: Changed from `/api/v1/enrollments/plan/${planId}` to `/enrollments/plan/${planId}`
        const response = await api.get(`/enrollments/plan/${planId}`);
        return extract(response);
    },

    // --- COLLECTIONS TRACKING LEDGER ---

    /**
     * Pushes a new collection record entry targeting an active subscription setup.
     */
    createCollectionEntry: async (collectionEntryRequest) => {
        // FIXED: Changed from "/api/v1/collections" to "/collections"
        const response = await api.post("/collections", collectionEntryRequest);
        return extract(response);
    },

    getCollectionEntryById: async (id) => {
        // FIXED: Changed from `/api/v1/collections/${id}` to `/collections/${id}`
        const response = await api.get(`/collections/${id}`);
        return extract(response);
    },

    getCollectionHistoryByEnrollment: async (enrollmentId) => {
        // FIXED: Changed from `/api/v1/collections/enrollment/${enrollmentId}` to `/collections/enrollment/${enrollmentId}`
        const response = await api.get(`/collections/enrollment/${enrollmentId}`);
        return extract(response);
    },

    getCollectionHistoryByCustomer: async (customerId) => {
        // FIXED: Changed from `/api/v1/collections/customer/${customerId}` to `/collections/customer/${customerId}`
        const response = await api.get(`/collections/customer/${customerId}`);
        return extract(response);
    },

    /**
     * Pulls data rows representing items that need collection actions immediately.
     */
    getPendingCollections: async (customerId) => {
        // FIXED: Changed from `/api/v1/collections/pending/customer/${customerId}` to `/collections/pending/customer/${customerId}`
        const response = await api.get(`/collections/pending/customer/${customerId}`);
        return extract(response);
    },

    /**
     * Grabs a comprehensive list detailing missed deadlines across active chit loops.
     */
    getOverdueCollections: async () => {
        // FIXED: Changed from "/api/v1/collections/overdue" to "/collections/overdue"
        const response = await api.get("/collections/overdue");
        return extract(response);
    },
};