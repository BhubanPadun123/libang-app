import { useState } from 'react'

import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { Toggle } from '@/components/ui/toggle'

export default function SuperAdminSettingsScreen() {
  const [roomsEnabled, setRoomsEnabled] = useState(true)
  const [maintenance, setMaintenance] = useState(false)

  return (
    <Screen title="Settings">
      <Section title="Business">
        <ListCard>
          <ListItem title="Commission rates" subtitle="Restaurants 14% · Stores 10% · Rooms 12%" icon={{ sf: 'percent', md: 'percent' }} iconTone="neutral" onPress={() => {}} />
          <ListItem title="Delivery zones" subtitle="6 active zones" icon={{ sf: 'map.fill', md: 'map' }} iconTone="neutral" onPress={() => {}} />
          <ListItem title="Delivery fees" subtitle="Base ₹30 + ₹8/km" icon={{ sf: 'bicycle', md: 'two_wheeler' }} iconTone="neutral" onPress={() => {}} />
        </ListCard>
      </Section>
      <Section title="Platform">
        <ListCard>
          <ListItem
            title="Room bookings"
            subtitle="Show the Rooms category to customers"
            icon={{ sf: 'bed.double.fill', md: 'hotel' }}
            iconTone="neutral"
            trailing={<Toggle value={roomsEnabled} onValueChange={setRoomsEnabled} />}
          />
          <ListItem
            title="Maintenance mode"
            subtitle="Temporarily pause all new orders"
            icon={{ sf: 'wrench.and.screwdriver.fill', md: 'build' }}
            iconTone="danger"
            trailing={<Toggle value={maintenance} onValueChange={setMaintenance} />}
          />
        </ListCard>
      </Section>
    </Screen>
  )
}
