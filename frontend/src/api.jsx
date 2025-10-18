import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // Laravel backend URL
  withCredentials: true,                // allows Sanctum cookies if needed
});

export default api;
