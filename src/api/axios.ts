import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://localhost:7034";

const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);


// RESPONSE INTERCEPTOR (Token Refresh Logic)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Handle expired token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          "https://localhost:7023/api/User/refresh-token",
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.access_token;

        if (newAccessToken) {
          localStorage.setItem("access_token", newAccessToken);
          api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest); // retry the request
        }
      } catch (refreshError) {
        // Refresh failed — clear tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        // Optionally redirect to login page
        // window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

   
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
