import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, AuthTokenManager } from '../config/api';

// Create the main HTTP client instance
const httpClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// Request interceptor to add auth token
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await AuthTokenManager.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it
      await AuthTokenManager.removeToken();
      // You could also trigger a logout or redirect to login here
    }
    
    // Log errors in development
    if (__DEV__) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
      });
    }
    
    return Promise.reject(error);
  }
);

// Helper function for GET requests
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await httpClient.get<T>(url, config);
  return response.data;
};

// Helper function for POST requests
export const post = async <T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
  const response = await httpClient.post<T>(url, data, config);
  return response.data;
};

// Helper function for PUT requests
export const put = async <T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
  const response = await httpClient.put<T>(url, data, config);
  return response.data;
};

// Helper function for DELETE requests
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await httpClient.delete<T>(url, config);
  return response.data;
};

export default httpClient; 