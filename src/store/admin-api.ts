import { customerApi } from '@/store/customer-api'
import type { ServerOrderStatus } from '@/types/catalog'
import type {
  AdminOrder,
  AdminStats,
  AdminUser,
  Business,
  PlatformSettings,
  ServerRole,
  StatsRange,
} from '@/types/admin'

/** Endpoints for admins and super admins. The server enforces who may call each one. */
export const adminApi = customerApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminStats: build.query<AdminStats, StatsRange>({
      query: (range) => ({ path: `/api/admin/stats?range=${range}` }),
      // The stats endpoint puts the range label in `meta`, not paging info.
      transformResponse: (data: AdminStats, meta) => ({
        ...data,
        rangeLabel: (meta?.meta as { label?: string } | undefined)?.label,
      }),
      providesTags: ['AdminStats'],
    }),

    /** Admins get every order in full from the same endpoint owners use. */
    getAllOrders: build.query<AdminOrder[], void>({
      query: () => ({ path: '/api/owner/orders?limit=50' }),
      providesTags: ['AdminOrders'],
    }),

    /** For an admin, sets every line in the order. */
    setAdminOrderStatus: build.mutation<unknown, { orderId: string; status: ServerOrderStatus }>({
      query: ({ orderId, status }) => ({
        path: `/api/owner/orders/${encodeURIComponent(orderId)}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['AdminOrders', 'AdminStats'],
    }),

    getUsers: build.query<AdminUser[], { search?: string; role?: ServerRole | 'ALL' }>({
      query: ({ search = '', role = 'ALL' }) => ({
        path: `/api/admin/users?limit=100&role=${role}&search=${encodeURIComponent(search)}`,
      }),
      providesTags: ['AdminUsers'],
    }),

    /** Super admin only. */
    setUserRole: build.mutation<AdminUser, { userId: string; role: ServerRole }>({
      query: ({ userId, role }) => ({
        path: `/api/admin/users/${encodeURIComponent(userId)}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['AdminUsers', 'AdminStats'],
    }),

    /** Super admin only. */
    deleteUser: build.mutation<unknown, string>({
      query: (userId) => ({ path: `/api/admin/users/${encodeURIComponent(userId)}/delete`, method: 'DELETE' }),
      invalidatesTags: ['AdminUsers', 'AdminStats'],
    }),

    /** Every business plus which ones are already live, fetched together. */
    getBusinesses: build.query<{ businesses: Business[]; liveIds: string[] }, void>({
      queryFn: async (_arg, _api, _extra, baseQuery) => {
        const [all, live] = await Promise.all([
          baseQuery({ path: '/api/admin/business?all=true' }),
          baseQuery({ path: '/api/admin/business/live' }),
        ])
        if (all.error) return { error: all.error }
        if (live.error) return { error: live.error }
        return { data: { businesses: all.data as Business[], liveIds: live.data as string[] } }
      },
      providesTags: ['Businesses'],
    }),

    reviewBusiness: build.mutation<
      Business,
      { businessId: string } & ({ decision: 'APPROVED' } | { decision: 'REJECTED'; reason: string })
    >({
      query: ({ businessId, ...review }) => ({
        path: `/api/admin/business/${encodeURIComponent(businessId)}/review`,
        method: 'POST',
        body: review,
      }),
      invalidatesTags: ['Businesses', 'AdminStats'],
    }),

    /** Publishes an approved business so customers can see it. */
    goLive: build.mutation<unknown, string>({
      query: (businessId) => ({
        path: `/api/admin/business/${encodeURIComponent(businessId)}/go-live`,
        method: 'POST',
      }),
      invalidatesTags: ['Businesses'],
    }),

    getSettings: build.query<PlatformSettings, void>({
      query: () => ({ path: '/api/settings' }),
      providesTags: ['Settings'],
    }),

    updateSettings: build.mutation<PlatformSettings, Partial<PlatformSettings>>({
      query: (body) => ({ path: '/api/settings', method: 'PATCH', body }),
      invalidatesTags: ['Settings'],
    }),
  }),
})

export const {
  useGetAdminStatsQuery,
  useGetAllOrdersQuery,
  useSetAdminOrderStatusMutation,
  useGetUsersQuery,
  useSetUserRoleMutation,
  useDeleteUserMutation,
  useGetBusinessesQuery,
  useReviewBusinessMutation,
  useGoLiveMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = adminApi
