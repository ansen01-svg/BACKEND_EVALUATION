import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";
axios.defaults.withCredentials = true;
export const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string }) =>
  async ({
    url,
    method,
    body: data,
    params,
  }: {
    url: string;
    method: string;
    body?: unknown;
    params?: Record<string, unknown>;
  }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        withCredentials: true,
      });
      return { data: result.data };
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data || axiosError.message,
        },
      };
    }
  };

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}`,
  }),
  tagTypes: ["App", "User"],
  endpoints: () => ({}),
  refetchOnReconnect: true,
});
