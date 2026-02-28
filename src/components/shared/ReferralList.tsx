'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import {
  ReferralStatus, ReferralType, UrgencyLevel,
  STATUS_LABELS, REFERRAL_TYPE_LABELS, URGENCY_LABELS
} from '@/lib/types/referral.types'
import { FileEdit, Eye, AlertTriangle, Zap } from 'lucide-react'

// ============================================================
// StatusBadge
// ============================================================
const STATUS_STYLES: Record<ReferralStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-slate-50 text-slate-500 border-slate-200',
}

export function StatusBadge({ status }: { status: ReferralStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ============================================================
// UrgencyBadge
// ============================================================
export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  if (urgency === 'routine') return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
      urgency === 'emergency'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-amber-50 text-amber-700 border-amber-200'
    }`}>
      {urgency === 'emergency' ? <Zap className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {URGENCY_LABELS[urgency]}
    </span>
  )
}

// ============================================================
// ReferralList
// ============================================================
interface ReferralListProps {
  referrals: any[]
  emptyMessage?: string
  showEditDraft?: boolean
  isStaffView?: boolean
}

export function ReferralList({
  referrals,
  emptyMessage = 'No referrals found.',
  showEditDraft,
  isStaffView,
}: ReferralListProps) {
  if (referrals.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-muted-foreground">{emptyMessage}</p>
        {!isStaffView && (
          <Button asChild className="mt-4">
            <Link href="/referral/new">Submit Your First Referral</Link>
          </Button>
        )}
      </div>
    )
  }

  const basePath = isStaffView ? '/staff/referral' : '/referral'

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="divide-y">
        {referrals.map((referral) => {
          const clientName = referral.client_first_name
            ? `${referral.client_first_name} ${referral.client_last_name}`
            : 'Client name pending'

          const facilityName =
            referral.facilities?.name ||
            referral.facility_name_freetext ||
            'Facility not specified'

          const referrerName = isStaffView && referral.profiles
            ? `${referral.profiles.first_name} ${referral.profiles.last_name}${referral.profiles.organization ? ` · ${referral.profiles.organization}` : ''}`
            : null

          const isDraft = referral.status === 'draft'
          const updatedAt = referral.updated_at
            ? formatDistanceToNow(new Date(referral.updated_at), { addSuffix: true })
            : ''

          return (
            <div key={referral.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{clientName}</span>
                    <StatusBadge status={referral.status} />
                    <UrgencyBadge urgency={referral.urgency} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5 space-x-2">
                    <span>{facilityName}</span>
                    <span>·</span>
                    <span>{REFERRAL_TYPE_LABELS[referral.referral_type as ReferralType] || 'Type pending'}</span>
                    {isStaffView && referrerName && (
                      <>
                        <span>·</span>
                        <span>Referred by {referrerName}</span>
                      </>
                    )}
                  </div>
                  {isDraft && referral.current_step && (
                    <div className="text-xs text-amber-600 mt-1">
                      Draft · Step {referral.current_step} of 7
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Updated {updatedAt}
                  </div>
                </div>

                <Button
                  asChild
                  variant={isDraft && showEditDraft ? 'default' : 'outline'}
                  size="sm"
                >
                  <Link href={`${basePath}/${referral.id}`}>
                    {isDraft && showEditDraft ? (
                      <><FileEdit className="w-3.5 h-3.5 mr-1.5" /> Resume</>
                    ) : (
                      <><Eye className="w-3.5 h-3.5 mr-1.5" /> View</>
                    )}
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

