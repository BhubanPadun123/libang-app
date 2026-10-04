// TODO: confirm the market currency for LibangExpress.
export const CURRENCY_SYMBOL = '₹'

export function formatPrice(amount: number) {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN')}`
}
