import { User } from "@/types/user.type";
import { apiSlice } from "../api";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (payload) => {
        return {
          url: `/auth/login`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["App"],
    }),
    getUser: builder.query<User, void>({
      query: () => ({
        url: "/auth/account",
        method: "GET",
      }),
      transformResponse: (response: {
        status: boolean;
        data: {
          user: User;
        };
      }) => response.data.user,
      providesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: `/auth/logout`,
        method: "POST",
        withCredentials: true,
      }),
      invalidatesTags: ["App", "User"],
    }),
  }),
});

export const { useLoginMutation, useGetUserQuery, useLogoutMutation } = authApi;
