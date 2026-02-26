'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function StaffDashboardFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/staff/dashboard?${params.toString()}`)
  }

  const clearAll = () => router.push('/staff/dashboard')

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Input
        placeholder="Search by client name..."
        className="w-56"
        defaultValue={searchParams.get('search') || ''}
        onChange={e => {
          const val = e.target.value
          setTimeout(() => update('search', val), 300)
        }}
      />
      <Select
        defaultValue={searchParams.get('status') || 'all'}
        onValueChange={v => update('status', v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="submitted">Submitted</SelectItem>
          <SelectItem value="in_review">In Review</SelectItem>
          <SelectItem value="accepted">Accepted</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get('type') || 'all'}
        onValueChange={v => update('type', v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Case Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="guardianship">Guardianship</SelectItem>
          <SelectItem value="medicaid">Medicaid</SelectItem>
          <SelectItem value="both">Both</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get('urgency') || 'all'}
        onValueChange={v => update('urgency', v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Urgency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Urgency</SelectItem>
          <SelectItem value="emergency">Emergency</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
          <SelectItem value="routine">Routine</SelectItem>
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X className="w-3.5 h-3.5 mr-1" /> Clear
        </Button>
      )}
    </div>
  )
}

