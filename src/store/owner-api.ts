import { customerApi } from '@/store/customer-api'
import type { ServerOrderStatus } from '@/types/catalog'
import type { ListingInput, OwnerListing, OwnerOrder, OwnerStats } from '@/types/owner'

/**
 * Endpoints for store, restaurant and room owners. The server scopes everything to the
 * signed-in owner and their one listing type, so no type or owner id is sent.
 */
export const ownerApi = customerApi.injectEndpoints({
  endpoints: (build) => ({
    getOwnerStats: build.query<OwnerStats, void>({
      query: () => ({ path: '/api/owner/stats' }),
      providesTags: ['OwnerStats'],
    }),

    getOwnerOrders: build.query<OwnerOrder[], void>({
      query: () => ({ path: '/api/owner/orders?limit=50' }),
      providesTags: ['OwnerOrders'],
    }),

    /** Applies to this owner's lines in the order only. */
    setOrderStatus: build.mutation<unknown, { orderId: string; status: ServerOrderStatus }>({
      query: ({ orderId, status }) => ({
        path: `/api/owner/orders/${encodeURIComponent(orderId)}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['OwnerOrders', 'OwnerStats'],
    }),

    getOwnerListings: build.query<OwnerListing[], { search?: string } | void>({
      query: (args) => {
        const search = args?.search ? `&search=${encodeURIComponent(args.search)}` : ''
        return { path: `/api/owner/listings?limit=50${search}` }
      },
      providesTags: ['OwnerListings'],
    }),

    getOwnerListing: build.query<OwnerListing, string>({
      query: (id) => ({ path: `/api/owner/listings/${encodeURIComponent(id)}` }),
      providesTags: ['OwnerListings'],
    }),

    createListing: build.mutation<OwnerListing, ListingInput>({
      query: (body) => ({ path: '/api/owner/listings', method: 'POST', body }),
      invalidatesTags: ['OwnerListings'],
    }),

    updateListing: build.mutation<OwnerListing, { id: string; changes: Partial<ListingInput> }>({
      query: ({ id, changes }) => ({
        path: `/api/owner/listings/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body: changes,
      }),
      invalidatesTags: ['OwnerListings'],
    }),

    deleteListing: build.mutation<unknown, string>({
      query: (id) => ({ path: `/api/owner/listings/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: ['OwnerListings'],
    }),
  }),
})

export const {
  useGetOwnerStatsQuery,
  useGetOwnerOrdersQuery,
  useSetOrderStatusMutation,
  useGetOwnerListingsQuery,
  useGetOwnerListingQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
} = ownerApi

/**
 * This owner's status for an order, rolled up from their own lines the same way the server rolls
 * up the whole order: cancelled lines are ignored unless all are cancelled.
 */
export function ownerStatus(order: OwnerOrder): ServerOrderStatus {
  const live = order.items.filter((i) => i.status !== 'CANCELLED')
  if (!order.items.length) return 'PENDING'
  if (!live.length) return 'CANCELLED'
  if (live.every((i) => i.status === 'DELIVERED')) return 'DELIVERED'
  if (live.every((i) => i.status !== 'PENDING')) return 'CONFIRMED'
  return 'PENDING'
}
