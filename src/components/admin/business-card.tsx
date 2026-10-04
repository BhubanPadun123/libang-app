import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { IconName } from '@/components/ui/icon'
import { IconBubble, type Tone } from '@/components/ui/icon-bubble'
import { TextField } from '@/components/ui/text-field'
import { Spacing } from '@/constants/theme'
import { useGoLiveMutation, useReviewBusinessMutation } from '@/store/admin-api'
import { errorMessage } from '@/store/customer-api'
import type { Business } from '@/types/admin'

const TypeIcon: Record<Business['businessType'], IconName> = {
  RESTAURANT: { sf: 'fork.knife', md: 'restaurant' },
  STORE: { sf: 'storefront.fill', md: 'storefront' },
  ROOM: { sf: 'bed.double.fill', md: 'hotel' },
}

const TypeLabel: Record<Business['businessType'], string> = {
  RESTAURANT: 'Restaurant',
  STORE: 'Store',
  ROOM: 'Rooms',
}

/** Display status: an approved business that has been published shows as Live. */
export type PartnerStatus = 'Draft' | 'Submitted' | 'Approved' | 'Live' | 'Rejected'

export function partnerStatus(business: Business, live: boolean): PartnerStatus {
  if (live) return 'Live'
  switch (business.onboarding?.status) {
    case 'SUBMITTED':
      return 'Submitted'
    case 'APPROVED':
      return 'Approved'
    case 'REJECTED':
      return 'Rejected'
    default:
      return 'Draft'
  }
}

const StatusTone: Record<PartnerStatus, Tone> = {
  Draft: 'neutral',
  Submitted: 'warning',
  Approved: 'info',
  Live: 'success',
  Rejected: 'danger',
}

/** A partner business with the next review step: approve/reject when submitted, go live when approved. */
export function BusinessCard({ business, live }: { business: Business; live: boolean }) {
  const status = partnerStatus(business, live)
  const [review, reviewState] = useReviewBusinessMutation()
  const [goLive, goLiveState] = useGoLiveMutation()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  const address = business.business.address
  const place = [address?.address, address?.city].filter(Boolean).join(', ')
  const owner = [business.owner?.name, business.owner?.phone].filter(Boolean).join(' · ')
  const error = reviewState.error ?? goLiveState.error
  const busy = reviewState.isLoading || goLiveState.isLoading

  const reject = async () => {
    try {
      await review({ businessId: business._id, decision: 'REJECTED', reason: reason.trim() }).unwrap()
      setRejecting(false)
      setReason('')
    } catch {
      // Shown below from reviewState.error.
    }
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconBubble icon={TypeIcon[business.businessType]} tone={StatusTone[status]} />
        <View style={styles.flex}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {business.business.name}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {[TypeLabel[business.businessType], address?.city].filter(Boolean).join(' · ')}
          </ThemedText>
        </View>
        <Badge label={status} tone={StatusTone[status]} />
      </View>

      {place ? (
        <ThemedText type="caption" themeColor="textSecondary" numberOfLines={2}>
          {place}
        </ThemedText>
      ) : null}
      {owner ? (
        <ThemedText type="caption" themeColor="textSecondary">
          Owner: {owner}
        </ThemedText>
      ) : null}
      {status === 'Rejected' && business.onboarding.rejectionReason ? (
        <ThemedText type="caption" themeColor="danger">
          Rejected: {business.onboarding.rejectionReason}
        </ThemedText>
      ) : null}

      {rejecting ? (
        <View style={styles.reject}>
          <TextField
            label="Reason for rejection"
            value={reason}
            onChangeText={setReason}
            placeholder="Shown to the owner"
            multiline
          />
          <View style={styles.actions}>
            <Button
              label="Reject"
              size="sm"
              variant="danger"
              loading={reviewState.isLoading}
              disabled={reason.trim().length < 3}
              onPress={reject}
            />
            <Button label="Back" size="sm" variant="secondary" disabled={busy} onPress={() => setRejecting(false)} />
          </View>
        </View>
      ) : status === 'Submitted' || status === 'Draft' || status === 'Rejected' ? (
        <View style={styles.actions}>
          <Button
            label="Approve"
            size="sm"
            icon={{ sf: 'checkmark', md: 'check' }}
            loading={reviewState.isLoading}
            disabled={busy}
            onPress={() => review({ businessId: business._id, decision: 'APPROVED' })}
          />
          {status !== 'Rejected' ? (
            <Button label="Reject" size="sm" variant="secondary" disabled={busy} onPress={() => setRejecting(true)} />
          ) : null}
        </View>
      ) : status === 'Approved' ? (
        <View style={styles.actions}>
          <Button
            label="Go live"
            size="sm"
            icon={{ sf: 'bolt.fill', md: 'bolt' }}
            loading={goLiveState.isLoading}
            disabled={busy}
            onPress={() => goLive(business._id)}
          />
        </View>
      ) : null}

      {error ? (
        <ThemedText type="caption" themeColor="danger">
          {errorMessage(error)}
        </ThemedText>
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
  },
  reject: {
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
})
