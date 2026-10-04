import { EarningsScreen } from '@/components/screens/earnings-screen'
import { formatPrice } from '@/utils/format'

export default function MerchantEarningsScreen() {
  return (
    <EarningsScreen
      balance={24680}
      stats={[
        { label: 'This week', value: formatPrice(68200), change: '+8%', icon: { sf: 'chart.line.uptrend.xyaxis', md: 'trending_up' }, tone: 'success' },
        { label: 'Commission', value: formatPrice(6820), icon: { sf: 'percent', md: 'percent' }, tone: 'neutral' },
      ]}
    />
  )
}
