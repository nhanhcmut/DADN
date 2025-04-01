import axios, { AxiosResponse } from 'axios';

export class BaseOperation {
    protected baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    protected async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        endpoint: string,
        payload?: any,
        token?: string
    ): Promise<{ success: boolean; message: string; data: T | null; status: number | null }> {
        try {
            const response: AxiosResponse = await axios({
                method,
                url: `${this.baseUrl}/${endpoint}`,
                ...(method === 'GET' ? { params: payload } : { data: payload }), // Use `params` for GET requests
                withCredentials: true,
                validateStatus: (status) => status >= 200 && status < 500, // Adjust valid status codes
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}), // Authorization header if token is present
                },
            });

            // Extract and return the response structure
            return {
                success: response.status >= 200 && response.status < 300, // Success for 2xx statuses
                message: response.data?.message || response.statusText,
                data: response.data || null,
                status: response.status,
            };
        } catch (error: any) {
            console.error("Error during request:", error);

            if (error.response) {
                return {
                    success: false,
                    message: error.response.data?.message || "Server error occurred.",
                    data: null,
                    status: error.response.status,
                };
            } else if (error.request) {
                return {
                    success: false,
                    message: "No response received from server. Please check your network.",
                    data: null,
                    status: null,
                };
            } else {
                return {
                    success: false,
                    message: error.message || "An unexpected error occurred.",
                    data: null,
                    status: null,
                };
            }
        }
    }
}
