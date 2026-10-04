import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react'

import { ApiError, apiFetchPage, type PageMeta } from '@/services/api'
import type {
  Cart,
  CustomerOrder,
  DeliveryAddress,
  Listing,
  ListingType,
  Seller,
  SellerType,
} from '@/types/catalog'
import { signOut } from './slices/auth-slice'
import { sessionEnded } from './slices/session-slice'

type Request = {
  path: string
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

type QueryError = { status: number; message: string }

/** Sends the signed-in user's token and maps `ApiError` into RTK Query's error shape. */
const baseQuery: BaseQueryFn<Request, unknown, QueryError, object, { meta?: PageMeta }> = async (
  { path, method, body },
  { getState, dispatch },
) => {
  const token = (getState() as { auth: { token: string | null } }).auth.token
  try {
    const { data, meta } = await apiFetchPage<unknown>(path, { method, body, token })
    return { data, meta: { meta } }
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 0
    if (status === 401 && token) {
      dispatch(sessionEnded('Your session has expired. Please sign in again.'))
      dispatch(signOut())
    }
    return { error: { status, message: e instanceof Error ? e.message : 'Something went wrong' } }
  }
}

function query(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value))
  })
  return search.toString()
}

export type ListingsArgs = {
  type: ListingType
  search?: string
  ownerId?: string
  limit?: number
}

export type Page<T> = { items: T[]; meta?: PageMeta }

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery,
  // Owner and admin endpoints are injected from owner-api.ts and admin-api.ts and share this cache.
  tagTypes: [
    'Cart',
    'Orders',
    'OwnerOrders',
    'OwnerListings',
    'OwnerStats',
    'AdminStats',
    'AdminOrders',
    'AdminUsers',
    'Businesses',
    'Settings',
    'DeliveryPartners',
    'Deliveries',
  ],
  endpoints: (build) => ({
    getListings: build.query<Page<Listing>, ListingsArgs>({
      query: ({ type, search, ownerId, limit = 50 }) => ({
        path: `/api/listings?${query({ type, search, ownerId, limit })}`,
      }),
      transformResponse: (items: Listing[], meta) => ({ items, meta: meta?.meta }),
    }),

    getSellers: build.query<Page<Seller>, { type: SellerType; search?: string; ownerId?: string }>({
      query: ({ type, search, ownerId }) => ({
        path: `/api/sellers?${query({ type, search, ownerId, limit: 50 })}`,
      }),
      transformResponse: (items: Seller[], meta) => ({ items, meta: meta?.meta }),
    }),

    getCart: build.query<Cart, void>({
      query: () => ({ path: '/api/cart' }),
      providesTags: ['Cart'],
    }),

    addToCart: build.mutation<Cart, { listingType: ListingType; listingId: string; quantity?: number }>({
      query: (body) => ({ path: '/api/cart', method: 'POST', body }),
      onQueryStarted: (_, api) => writeCart(api),
    }),

    /** A quantity of 0 removes the line. */
    setCartQuantity: build.mutation<Cart, { listingType: ListingType; listingId: string; quantity: number }>({
      query: (body) => ({ path: '/api/cart', method: 'PATCH', body }),
      onQueryStarted: (_, api) => writeCart(api),
    }),

    removeFromCart: build.mutation<Cart, { listingType: ListingType; listingId: string }>({
      query: ({ listingType, listingId }) => ({
        path: `/api/cart?${query({ type: listingType, listingId })}`,
        method: 'DELETE',
      }),
      onQueryStarted: (_, api) => writeCart(api),
    }),

    getOrders: build.query<CustomerOrder[], void>({
      query: () => ({ path: `/api/orders?${query({ limit: 50 })}` }),
      providesTags: ['Orders'],
    }),

    /** Totals are recomputed on the server from the cart; only the address is sent. */
    placeOrder: build.mutation<CustomerOrder, DeliveryAddress>({
      query: (deliveryAddress) => ({ path: '/api/orders', method: 'POST', body: { deliveryAddress } }),
      invalidatesTags: ['Cart', 'Orders'],
    }),
  }),
})

/** Every cart endpoint answers with the whole cart, so store it instead of refetching. */
async function writeCart(api: {
  dispatch: (action: unknown) => unknown
  queryFulfilled: Promise<{ data: Cart }>
}) {
  try {
    const { data } = await api.queryFulfilled
    api.dispatch(customerApi.util.upsertQueryData('getCart', undefined, data))
  } catch {
    // The screen shows the mutation's own error.
  }
}

export const {
  useGetListingsQuery,
  useGetSellersQuery,
  useGetCartQuery,
  useAddToCartMutation,
  useSetCartQuantityMutation,
  useRemoveFromCartMutation,
  useGetOrdersQuery,
  usePlaceOrderMutation,
} = customerApi

/** Turns an RTK Query error into a message for the UI. */
export function errorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Something went wrong'
}
