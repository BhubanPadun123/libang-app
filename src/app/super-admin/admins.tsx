import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { AdminAccounts } from '@/data/mock'

export default function SuperAdminAdminsScreen() {
  return (
    <Screen
      title="Admins"
      subtitle={`${AdminAccounts.length} accounts`}
      headerRight={<Button label="Invite" size="sm" icon={{ sf: 'plus', md: 'add' }} />}>
      <ListCard>
        {AdminAccounts.map((a) => (
          <ListItem
            key={a.id}
            title={a.name}
            subtitle={a.region}
            leading={<Avatar name={a.name} size={40} />}
            trailing={<Badge label={a.active ? 'Active' : 'Disabled'} tone={a.active ? 'success' : 'neutral'} />}
            onPress={() => {}}
          />
        ))}
      </ListCard>
    </Screen>
  )
}
