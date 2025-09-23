import axios from "axios";
import { deleteCookie, getCookie } from "cookies-next";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true, // This allows cookies to be sent
});

// Add token to all requests automatically
api.interceptors.request.use(
  (config) => {
    // Get token from cookie instead of localStorage
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // If it's a login or register request, don't redirect
    if (
      originalRequest?.url?.includes("/user/login") ||
      originalRequest?.url?.includes("/user/signup") 
    ) {
      return Promise.reject(error); // just let component handle it
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid - clear cookies
      deleteCookie('token');
      deleteCookie('userData');
      // Only redirect on client side
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Cookie utility functions
// function getCookie(name: string): string | null {
//   if (typeof document === 'undefined') return null; // Server-side check

//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) {
//     return parts.pop()?.split(';').shift() || null;
//   }
//   return null;
// }

// function setCookie(name: string, value: string, days: number = 1): void {
//   if (typeof document === 'undefined') return; // Server-side check

//   const expires = new Date();
//   expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
//   document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
// }

// function deleteCookie(name: string): void {
//   if (typeof document === 'undefined') return; // Server-side check

//   document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
// }

export default api;