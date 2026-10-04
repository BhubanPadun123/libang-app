import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useColorScheme } from 'react-native'

import { Colors } from '@/constants/theme'
import type { RoleTab } from '@/navigation/tabs'
import { useAppSelector } from '@/store/hooks'

type RoleTabsProps = {
  /** URL segment of the role folder, e.g. `customer`. Used by the web variant. */
  basePath: string
  tabs: RoleTab[]
}

export default function RoleTabs({ tabs }: RoleTabsProps) {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme]
  const unread = useAppSelector((s) => s.notifications.unreadCount)
  const badge = unread > 99 ? '99+' : String(unread)

  return (
    <NativeTabs
      backgroundColor={colors.backgroundElement}
      tintColor={colors.primary}
      indicatorColor={colors.primarySoft}
      iconColor={{ default: colors.textSecondary, selected: colors.primary }}
      labelStyle={{
        default: { color: colors.textSecondary },
        selected: { color: colors.primary, fontWeight: '700' },
      }}>
      {tabs.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
          {tab.showsOrderBadge ? (
            <NativeTabs.Trigger.Badge hidden={unread === 0}>{badge}</NativeTabs.Trigger.Badge>
          ) : null}
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  )
}
