import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_ROUTE,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("token: ",token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;