import { apiSlice } from "../api";

type GetProductsParams = {
  cursor?: string;
  limit?: number;
  status?: string;
};

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (payload) => ({
        url: "/products",
        method: "POST",
        body: payload,
        withCredentials: true,
      }),
      invalidatesTags: ["Products"],
    }),
    addProductEvent: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/products/${id}/events`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Products"],
    }),
    verifyProduct: builder.query({
      query: (id) => ({
        url: `/products/${id}/verify`,
        method: "GET",
        withCredentials: true,
      }),
      providesTags: ["Products"],
    }),
    getProduct: builder.query({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
        withCredentials: true,
      }),
      providesTags: ["Products"],
    }),
    getProducts: builder.query({
      query: ({ cursor, limit, status }: GetProductsParams) => ({
        url: "/products",
        method: "GET",
        params: {
          cursor,
          limit,
          status,
        },
      }),
      providesTags: ["Products"],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useAddProductEventMutation,
  useVerifyProductQuery,
  useGetProductQuery,
  useGetProductsQuery,
} = productApi;
