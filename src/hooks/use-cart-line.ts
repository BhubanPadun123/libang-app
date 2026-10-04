import { errorMessage, useAddToCartMutation, useGetCartQuery, useSetCartQuantityMutation } from '@/store/customer-api'
import type { ListingType } from '@/types/catalog'

/** One listing's line in the server cart: its quantity and the actions that change it. */
export function useCartLine(listingType: ListingType, listingId: string) {
  const { quantity = 0 } = useGetCartQuery(undefined, {
    selectFromResult: ({ data }) => ({
      quantity: data?.items.find((i) => i.listingId === listingId && i.listingType === listingType)?.quantity,
    }),
  })
  const [add, addState] = useAddToCartMutation()
  const [setQuantity, setState] = useSetCartQuantityMutation()

  const busy = addState.isLoading || setState.isLoading
  const error = addState.error ?? setState.error

  return {
    quantity,
    busy,
    error: error ? errorMessage(error) : null,
    add: () => add({ listingType, listingId, quantity: 1 }),
    change: (delta: number) => setQuantity({ listingType, listingId, quantity: Math.max(0, quantity + delta) }),
  }
}
