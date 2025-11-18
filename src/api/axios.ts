import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/devices";

const api = axios.create({
  baseURL: baseURL,  
  withCredentials: true, 
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

   
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        
        await axios.post(
          "http://localhost:5000/auth/User/refresh-token",
          {},
          { withCredentials: true }
        );

        
        return api(originalRequest);
      } catch (err) {
        console.log("Refresh token failed, redirecting to Register");
        localStorage.removeItem("user");
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;