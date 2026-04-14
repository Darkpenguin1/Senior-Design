import axios from "axios";

const api = axios.create({
  baseURL: "/api", //Springboot API either prod or local
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      ["token", "role", "userId", "email"].forEach((k) => localStorage.removeItem(k));
      if (!window.location.pathname.startsWith("/signin")) {
        window.location.assign("/signin");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
