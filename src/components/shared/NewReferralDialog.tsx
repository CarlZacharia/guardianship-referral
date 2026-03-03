'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ReferralType, UrgencyLevel } from '@/lib/types/referral.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewReferralDialogProps {
  userId: string
}

export function NewReferralDialog({ userId }: NewReferralDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isMarried, setIsMarried] = useState(false)
  const [referralType, setReferralType] = useState<ReferralType | undefined>()
  const [urgency, setUrgency] = useState<UrgencyLevel>('routine')

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setIsMarried(false)
    setReferralType(undefined)
    setUrgency('routine')
  }

  const handleCreate = async () => {
    if (!firstName.trim() || !lastName.trim() || !referralType) return
    setSaving(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: userId,
        client_first_name: firstName.trim(),
        client_last_name: lastName.trim(),
        is_married: isMarried,
        referral_type: referralType,
        urgency,
        status: 'draft',
        current_step: 1,
      })
      .select('id')
      .single()

    if (error) {
      toast({ title: 'Error creating referral', description: error.message, variant: 'destructive' })
      setSaving(false)
      return
    }

    router.push(`/referral/${data.id}`)
  }

  const canSubmit = firstName.trim() && lastName.trim() && referralType

  return (
    <>
      <Button onClick={() => { resetForm(); setOpen(true) }}>
        <Plus className="w-4 h-4 mr-2" />
        New Referral
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!saving) setOpen(v) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Referral</DialogTitle>
            <DialogDescription>
              Enter basic information to start a new referral.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nr-first">First Name *</Label>
                <Input
                  id="nr-first"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Resident first name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nr-last">Last Name *</Label>
                <Input
                  id="nr-last"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Resident last name"
                />
              </div>
            </div>

            {/* Case Type */}
            <div className="space-y-2">
              <Label>Case Type *</Label>
              <RadioGroup
                value={referralType}
                onValueChange={(v) => setReferralType(v as ReferralType)}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="guardianship" id="nr-guardianship" />
                  <Label htmlFor="nr-guardianship" className="cursor-pointer font-normal">Guardianship</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="medicaid" id="nr-medicaid" />
                  <Label htmlFor="nr-medicaid" className="cursor-pointer font-normal">Medicaid</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="both" id="nr-both" />
                  <Label htmlFor="nr-both" className="cursor-pointer font-normal">Both</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <Label>Urgency Level</Label>
              <RadioGroup
                value={urgency}
                onValueChange={(v) => setUrgency(v as UrgencyLevel)}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="routine" id="nr-routine" />
                  <Label htmlFor="nr-routine" className="cursor-pointer font-normal">Routine</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="urgent" id="nr-urgent" />
                  <Label htmlFor="nr-urgent" className="cursor-pointer font-normal">Urgent</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="emergency" id="nr-emergency" />
                  <Label htmlFor="nr-emergency" className="cursor-pointer font-normal">Emergency</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Marital Status */}
            <div className={cn(
              'flex items-center justify-between p-3 rounded-lg border transition-colors',
              isMarried ? 'border-primary/30 bg-primary/5' : 'border-input'
            )}>
              <Label className="cursor-pointer mb-0 font-medium">Currently Married</Label>
              <Switch checked={isMarried} onCheckedChange={setIsMarried} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!canSubmit || saving}>
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                : 'Start Referral'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
