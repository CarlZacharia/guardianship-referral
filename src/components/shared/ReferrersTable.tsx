'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Profile, REFERRER_TYPE_LABELS, ReferrerType } from '@/lib/types/referral.types'
import { createReferrer } from '@/app/actions/referrer-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, UserCircle, ChevronRight, Search } from 'lucide-react'

interface ReferrersTableProps {
  referrers: Profile[]
  referralCounts: Record<string, number>
}

const REFERRER_TYPE_OPTIONS = Object.entries(REFERRER_TYPE_LABELS) as [ReferrerType, string][]

export function ReferrersTable({ referrers, referralCounts }: ReferrersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    organization: '',
    phone: '',
    referrer_type: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const result = await createReferrer({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      organization: form.organization || undefined,
      phone: form.phone || undefined,
      referrer_type: form.referrer_type || undefined,
    })

    if (result.error) {
      toast({ title: 'Error creating referrer', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Referrer account created', description: `${form.first_name} ${form.last_name} has been added.` })
      setOpen(false)
      setForm({ first_name: '', last_name: '', email: '', organization: '', phone: '', referrer_type: '' })
      router.refresh()
    }
    setSaving(false)
  }

  const filtered = referrers.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.first_name?.toLowerCase().includes(q) ||
      r.last_name?.toLowerCase().includes(q) ||
      r.organization?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, org, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Referrer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Referrer</DialogTitle>
              <DialogDescription>
                Create a new referrer account. They will receive an email to set their password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input value={form.first_name} onChange={set('first_name')} required />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input value={form.last_name} onChange={set('last_name')} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div className="space-y-2">
                <Label>Organization / Facility</Label>
                <Input value={form.organization} onChange={set('organization')} placeholder="e.g., General Hospital" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" value={form.phone} onChange={set('phone')} />
                </div>
                <div className="space-y-2">
                  <Label>Referrer Type</Label>
                  <Select onValueChange={v => setForm(prev => ({ ...prev, referrer_type: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REFERRER_TYPE_OPTIONS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Creating...' : 'Create Referrer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {search ? 'No referrers match your search.' : 'No referrers yet.'}
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map(referrer => (
              <Link
                key={referrer.id}
                href={`/staff/referrers/${referrer.id}`}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <UserCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">
                      {referrer.first_name} {referrer.last_name}
                      {!referrer.is_active && (
                        <Badge variant="secondary" className="ml-2 text-xs">Inactive</Badge>
                      )}
                    </div>
                    {referrer.organization && (
                      <div className="text-sm text-muted-foreground">{referrer.organization}</div>
                    )}
                    <div className="text-sm text-muted-foreground">{referrer.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    {referrer.referrer_type && (
                      <div className="text-muted-foreground">
                        {REFERRER_TYPE_LABELS[referrer.referrer_type] || referrer.referrer_type}
                      </div>
                    )}
                    <div className="flex items-center gap-2 justify-end mt-0.5">
                      {referrer.onboarding_completed ? (
                        <Badge variant="default" className="text-xs">Onboarded</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                      )}
                      <span className="text-muted-foreground">
                        {referralCounts[referrer.id] || 0} referral(s)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
