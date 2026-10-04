import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { Chip } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { SearchField } from '@/components/ui/search-field'
import { Section } from '@/components/ui/section'
import { Spacing } from '@/constants/theme'
import { NearbyPlaces } from '@/data/mock'

const RecentSearches = ['Momo', 'Biryani', 'Milk', 'Homestay', 'Pizza']

export default function CustomerSearchScreen() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const results = NearbyPlaces.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
  )

  return (
    <Screen title="Search">
      <SearchField value={query} onChangeText={setQuery} placeholder="Search food, stores, rooms…" />

      {!q ? (
        <Section title="Recent searches">
          <View style={styles.chips}>
            {RecentSearches.map((term) => (
              <Chip key={term} label={term} onPress={() => setQuery(term)} />
            ))}
          </View>
        </Section>
      ) : null}

      <Section title={q ? 'Results' : 'Suggested for you'}>
        {results.length ? (
          <ListCard>
            {results.map((p) => (
              <ListItem
                key={p.id}
                title={p.name}
                subtitle={`${p.type} · ★ ${p.rating} · ${p.eta}`}
                icon={p.icon}
                iconTone={p.tone}
                onPress={() => {}}
              />
            ))}
          </ListCard>
        ) : (
          <EmptyState
            icon={{ sf: 'magnifyingglass', md: 'search_off' }}
            title="No results"
            message={`We couldn't find anything for "${query}".`}
          />
        )}
      </Section>
    </Screen>
  )
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
})
