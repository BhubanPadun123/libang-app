import { customerApi } from '@/store/customer-api'
import type { DeliveryAddress } from '@/types/catalog'
import type { DeliveryOrder } from '@/types/delivery'

export type GeocodedPoint = { latitude: number; longitude: number; approximate: boolean }

/** Endpoints for delivery partners; the server returns only orders assigned to the caller. */
export const deliveryApi = customerApi.injectEndpoints({
  endpoints: (build) => ({
    getDeliveries: build.query<DeliveryOrder[], void>({
      query: () => ({ path: '/api/delivery/orders' }),
      providesTags: ['Deliveries'],
    }),

    /** Picked up, then delivered; the server rejects any other order. */
    advanceDelivery: build.mutation<unknown, { orderId: string; status: 'PICKED_UP' | 'DELIVERED' }>({
      query: ({ orderId, status }) => ({
        path: `/api/delivery/orders/${encodeURIComponent(orderId)}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Deliveries'],
    }),

    /**
     * Pins a typed address for orders placed without a shared location. Tries the full
     * address, then just city and PIN code (marked approximate). Null when nothing matches.
     */
    geocodeAddress: build.query<GeocodedPoint | null, Pick<DeliveryAddress, 'address' | 'city' | 'pincode'>>({
      queryFn: async (a, _api, _extra, baseQuery) => {
        const attempts = [
          { q: [a.address, a.city, a.pincode].filter(Boolean).join(', '), approximate: false },
          { q: [a.city, a.pincode].filter(Boolean).join(' '), approximate: true },
        ].filter((attempt) => attempt.q.trim().length >= 3)

        for (const attempt of attempts) {
          const result = await baseQuery({ path: `/api/geolocation/search?q=${encodeURIComponent(attempt.q)}` })
          const first = (result.data as { latitude: number; longitude: number }[] | undefined)?.[0]
          if (first) return { data: { latitude: first.latitude, longitude: first.longitude, approximate: attempt.approximate } }
        }
        return { data: null }
      },
      // Addresses don't move; keep pins for the session.
      keepUnusedDataFor: 3600,
    }),
  }),
})

export const { useGetDeliveriesQuery, useAdvanceDeliveryMutation, useGeocodeAddressQuery } = deliveryApi

/** Active = still to do; completed = delivered or the order was cancelled. */
export function isActiveDelivery(order: DeliveryOrder) {
  return order.status !== 'CANCELLED' && order.delivery.status !== 'DELIVERED'
}
