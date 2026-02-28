'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

export function EditReferralButton({ referralId }: { referralId: string }) {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      onClick={() => router.push(`/referral/${referralId}?edit=true`)}
    >
      <Pencil className="w-4 h-4 mr-2" />
      Edit & Resubmit
    </Button>
  )
}
