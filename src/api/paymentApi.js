import api from "./axios";


const handleResponse = (response) => {

    return response.data?.data !== undefined ? response.data.data : response.data;
};
export const paymentApi = {

    recordPayment: async (paymentRequest) => {
        const response = await api.post("/payments", paymentRequest);
        return handleResponse(response);
    },

    getReceiptByNumber: async (receiptNumber) => {
        const response = await api.get(`/payments/receipt/${receiptNumber}`);
        return handleResponse(response);
    },


    getReceiptById: async (id) => {
        const response = await api.get(`/payments/${id}`);
        return handleResponse(response);
    },


    getPaymentsByCustomer: async (customerId, page = 0, size = 10) => {
        const response = await api.get(`/payments/customer/${customerId}`, {
            params: { page, size },
        });
        return handleResponse(response);
    },


    getPaymentReport: async (startDate, endDate) => {
        const response = await api.get("/api/v1/payments/report", {
            params: { start: startDate, end: endDate },
        });
        return handleResponse(response);
    },
};