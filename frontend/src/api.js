import axios from "axios";

const api = axios.create({
  baseURL: "/api", //Springboot API either prod or local 
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or wherever you store it
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;