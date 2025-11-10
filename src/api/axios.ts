// src/api/axios.ts
import axios from "axios";
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";


// Base URL from environment
const baseURL = import.meta.env.VITE_API_URL || "https://localhost:7034";

const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true, // ready for cookies or auth
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptors
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add headers or tokens later here
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;
