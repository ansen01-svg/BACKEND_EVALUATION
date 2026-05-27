import { apiSlice } from "../api";

export const partnersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<string[], void>({
      query: () => ({
        url: "/partners",
        method: "GET",
      }),
      transformResponse: (response: {
        status: boolean;
        message: string;
        data: string[];
      }) => response.data,
      providesTags: ["Partners"],
    }),
  }),
});

export const { useGetPartnersQuery } = partnersApi;
