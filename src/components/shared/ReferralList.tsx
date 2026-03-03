'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import {
  ReferralStatus, ReferralType, UrgencyLevel,
  STATUS_LABELS, REFERRAL_TYPE_LABELS, URGENCY_LABELS
} from '@/lib/types/referral.types'
import { FileEdit, Eye, AlertTriangle, Zap, FileDown, FileText, Loader2, Trash2 } from 'lucide-react'

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
  newReferralAction?: React.ReactNode
}

export function ReferralList({
  referrals,
  emptyMessage = 'No referrals found.',
  showEditDraft,
  isStaffView,
  newReferralAction,
}: ReferralListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [navigating, setNavigating] = useState(false)
  const [navigatingId, setNavigatingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const supabase = createClient()

    // Remove uploaded files from storage
    const { data: docs } = await supabase
      .from('referral_documents')
      .select('storage_path')
      .eq('referral_id', deleteId)
    if (docs && docs.length > 0) {
      await supabase.storage
        .from('referral-documents')
        .remove(docs.map(d => d.storage_path))
    }

    // Cascade delete related rows then the referral
    const tables = ['referral_documents', 'assets', 'family_members'] as const
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq('referral_id', deleteId)
      if (error) {
        toast({ title: `Error removing ${table}`, description: error.message, variant: 'destructive' })
        setDeleting(false)
        setDeleteId(null)
        return
      }
    }

    const { error } = await supabase.from('referrals').delete().eq('id', deleteId)
    if (error) {
      toast({ title: 'Error deleting referral', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Referral deleted' })
      router.refresh()
    }

    setDeleting(false)
    setDeleteId(null)
  }

  if (referrals.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-muted-foreground">{emptyMessage}</p>
        {!isStaffView && (
          newReferralAction ? <div className="mt-4">{newReferralAction}</div> : (
            <Button
              className="mt-4 cursor-pointer"
              disabled={navigating}
              onClick={() => {
                setNavigating(true)
                router.push('/referral/new')
              }}
            >
              {navigating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Your First Referral
            </Button>
          )
        )}
      </div>
    )
  }

  const basePath = isStaffView ? '/staff/referral' : '/referral'

  return (
    <>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Resident</th>
              <th className="px-4 py-3">Case Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date Submitted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {referrals.map((referral) => {
              const clientName = referral.client_first_name
                ? `${referral.client_first_name} ${referral.client_last_name}`
                : 'Client name pending'

              const isDraft = referral.status === 'draft'

              const dateDisplay = referral.submitted_at
                ? format(new Date(referral.submitted_at), 'MMM d, yyyy')
                : isDraft && referral.current_step
                  ? `Draft · Step ${referral.current_step}/7`
                  : '—'

              return (
                <tr key={referral.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{clientName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {REFERRAL_TYPE_LABELS[referral.referral_type as ReferralType] || 'Pending'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={referral.status} />
                      <UrgencyBadge urgency={referral.urgency} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{dateDisplay}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {!isDraft && (
                        <>
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={`/api/referral/${referral.id}/medicaid-forms`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1.5" /> MCD Forms
                            </a>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={`/api/referral/${referral.id}/report`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileDown className="w-3.5 h-3.5 mr-1.5" /> Report
                            </a>
                          </Button>
                        </>
                      )}
                      <Button
                        variant={isDraft && showEditDraft ? 'default' : 'outline'}
                        size="sm"
                        disabled={navigatingId === referral.id}
                        onClick={() => {
                          setNavigatingId(referral.id)
                          router.push(`${basePath}/${referral.id}`)
                        }}
                      >
                        {navigatingId === referral.id ? (
                          <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Loading...</>
                        ) : isDraft && showEditDraft ? (
                          <><FileEdit className="w-3.5 h-3.5 mr-1.5" /> Resume</>
                        ) : (
                          <><Eye className="w-3.5 h-3.5 mr-1.5" /> View</>
                        )}
                      </Button>
                      {isDraft && showEditDraft && !isStaffView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(referral.id)}
                          className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Referral</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this referral? This will permanently
              remove the referral and all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              No, Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : 'Yes, Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {navigatingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-8 shadow-lg">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Loading referral...</p>
          </div>
        </div>
      )}
    </>
  )
}
