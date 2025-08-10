import axios from "axios";
import { getToken } from "./auth";

const API_BASE = "http://localhost:8000/"; // Change as needed

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;