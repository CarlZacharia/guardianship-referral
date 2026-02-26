'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { StatusBadge, UrgencyBadge } from './ReferralList'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow, format } from 'date-fns'
import { Loader2, User, Building2, Calendar } from 'lucide-react'
import { ReferralStatus } from '@/lib/types/referral.types'

const STATUS_TRANSITIONS: Record<ReferralStatus, { label: string; next: ReferralStatus }[]> = {
  draft: [],
  submitted: [
    { label: 'Accept for Review', next: 'in_review' },
    { label: 'Close', next: 'closed' },
  ],
  in_review: [
    { label: 'Mark Accepted', next: 'accepted' },
    { label: 'Close', next: 'closed' },
  ],
  accepted: [
    { label: 'Close Case', next: 'closed' },
  ],
  closed: [
    { label: 'Re-open (In Review)', next: 'in_review' },
  ],
}

export function StaffStatusPanel({ referral }: { referral: any }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')

  const transitions = STATUS_TRANSITIONS[referral.status as ReferralStatus] || []

  const handleStatusChange = async (next: ReferralStatus) => {
    setLoading(true)
    const { error } = await supabase
      .from('referrals')
      .update({ status: next })
      .eq('id', referral.id)

    if (error) {
      toast({ title: 'Error updating status', variant: 'destructive' })
    } else {
      toast({ title: `Status updated to: ${next.replace('_', ' ')}` })
      router.refresh()
    }
    setLoading(false)
  }

  const referrerProfile = referral.profiles

  return (
    <>
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Case Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={referral.status} />
            <UrgencyBadge urgency={referral.urgency} />
          </div>

          {transitions.length > 0 && (
            <div className="space-y-2">
              {transitions.map(({ label, next }) => (
                <Button
                  key={next}
                  variant={next === 'closed' ? 'outline' : 'default'}
                  size="sm"
                  className="w-full"
                  disabled={loading}
                  onClick={() => handleStatusChange(next)}
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  {label}
                </Button>
              ))}
            </div>
          )}

          <Separator />

          <div className="space-y-2 text-sm">
            {referral.submitted_at && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Submitted {format(new Date(referral.submitted_at), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referrer Info */}
      {referrerProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referrer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{referrerProfile.first_name} {referrerProfile.last_name}</span>
            </div>
            {referrerProfile.organization && (
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{referrerProfile.organization}</span>
              </div>
            )}
            {referrerProfile.phone && (
              <a href={`tel:${referrerProfile.phone}`} className="text-primary hover:underline block">
                {referrerProfile.phone}
              </a>
            )}
            {referrerProfile.email && (
              <a href={`mailto:${referrerProfile.email}`} className="text-primary hover:underline block truncate">
                {referrerProfile.email}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Staff Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Staff Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Internal notes (not visible to referrer)..."
            rows={4}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <Button variant="outline" size="sm" className="w-full" disabled={!note}>
            Save Note
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

