import { EarningsScreen } from '@/components/screens/earnings-screen'
import { formatPrice } from '@/utils/format'

export default function DeliveryEarningsScreen() {
  return (
    <EarningsScreen
      balance={3420}
      stats={[
        { label: 'This week', value: formatPrice(5240), change: '+11%', icon: { sf: 'chart.line.uptrend.xyaxis', md: 'trending_up' }, tone: 'success' },
        { label: 'Tips', value: formatPrice(410), icon: { sf: 'heart.fill', md: 'favorite' }, tone: 'danger' },
      ]}
    />
  )
}
