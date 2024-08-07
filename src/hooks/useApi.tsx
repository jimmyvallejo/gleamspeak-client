import axios, { AxiosInstance } from "axios";
import { baseUrl } from "../utils/baseurl";
import { useNavigate } from "react-router-dom";

interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

export const useApi = (): AxiosInstance => {
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
  });

  let isRefreshing = false;
  let failedQueue: QueueItem[] = [];

  const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    
    failedQueue = [];
  };

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise<unknown>((resolve, reject) => {
            failedQueue.push({resolve, reject});
          }).then(() => {
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await api.post<{ token: string }>("/v1/refresh");
          isRefreshing = false;
          processQueue(null, refreshResponse.data.token);
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed, logging out");
          isRefreshing = false;
          processQueue(refreshError as Error, null);
          await api.post(`/v1/logout`);
          navigate("/login");
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};