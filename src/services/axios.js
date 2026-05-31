// src/services/axios.js

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  console.log("API Response Interceptor Initialized"),
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;