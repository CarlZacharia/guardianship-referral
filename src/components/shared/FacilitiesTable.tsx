'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Facility } from '@/lib/types/referral.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Plus, Building2, Phone } from 'lucide-react'

interface FacilitiesTableProps {
  facilities: Facility[]
  referralCounts: Record<string, number>
}

export function FacilitiesTable({ facilities, referralCounts }: FacilitiesTableProps) {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', address: '', city: '', state: 'FL', zip: '',
    phone: '', fax: '', contact_name: '', contact_email: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('facilities').insert(form)
    if (error) {
      toast({ title: 'Error adding facility', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Facility added successfully' })
      setOpen(false)
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Facility</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Facility</DialogTitle>
              <DialogDescription>
                Add a new referring facility to the dropdown list.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Facility Name *</Label>
                <Input value={form.name} onChange={set('name')} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input value={form.contact_name} onChange={set('contact_name')} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input type="email" value={form.contact_email} onChange={set('contact_email')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={set('address')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2 col-span-1">
                  <Label>City</Label>
                  <Input value={form.city} onChange={set('city')} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={form.state} onChange={set('state')} maxLength={2} />
                </div>
                <div className="space-y-2">
                  <Label>ZIP</Label>
                  <Input value={form.zip} onChange={set('zip')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" value={form.phone} onChange={set('phone')} />
                </div>
                <div className="space-y-2">
                  <Label>Fax</Label>
                  <Input type="tel" value={form.fax} onChange={set('fax')} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                Add Facility
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        {facilities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No facilities yet. Add your first referring facility above.
          </div>
        ) : (
          <div className="divide-y">
            {facilities.map(facility => (
              <div key={facility.id} className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{facility.name}</div>
                    {facility.city && (
                      <div className="text-sm text-muted-foreground">
                        {facility.city}, {facility.state} {facility.zip}
                      </div>
                    )}
                    {facility.contact_name && (
                      <div className="text-sm text-muted-foreground">
                        Contact: {facility.contact_name}
                        {facility.contact_email && ` · ${facility.contact_email}`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {referralCounts[facility.id!] || 0} referral(s)
                  {facility.phone && (
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <Phone className="w-3 h-3" />
                      {facility.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

