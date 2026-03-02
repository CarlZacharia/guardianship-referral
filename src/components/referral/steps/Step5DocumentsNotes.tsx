'use client'

// src/components/referral/steps/Step5DocumentsNotes.tsx

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step5Schema, Step5FormData } from '@/lib/validations/referral.schema'
import { Referral, AutoSaveProps } from '@/lib/types/referral.types'
import { useAutoSave } from '@/hooks/use-auto-save'
import { StepNavigation, StepNavProps } from '../StepNavigation'
import { createClient } from '@/lib/supabase/client'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { FileText, Upload, X, Loader2, CheckCircle2 } from 'lucide-react'

interface Step5Props {
  defaultValues: Partial<Referral>
  referralId?: string
  onComplete: (data: Partial<Referral>) => Promise<void>
  navProps: StepNavProps
  autoSave: AutoSaveProps
}

const DOC_TYPE_LABELS: Record<string, string> = {
  facesheet: 'Facility Admission Facesheet',
  id_drivers_license: 'Driver\'s License',
  id_passport: 'Passport',
  id_state: 'State ID',
  medical_report: 'Medical Report',
  poa: 'Power of Attorney',
  hc_surrogate: 'Health Care Surrogate',
  living_will: 'Living Will / Advance Directive',
  trust: 'Trust Document',
  outstanding_balance: 'Outstanding Balance Statement',
  bank_statement: 'Bank Statement',
  resident_funds: 'Current Resident Funds Statement',
  incapacity_determination: 'Incapacity Determination',
  level_of_care: 'Level of Care Assessment',
  financial_disclosure: 'Financial Disclosure',
  designation_of_rep: 'Designation of Representative',
  authorization_to_disclose: 'Authorization to Disclose',
  other: 'Other Document',
}

interface UploadedFile {
  name: string
  doc_type: string
  description?: string
  storage_path: string
  size: number
  uploading?: boolean
}

export function Step5DocumentsNotes({ defaultValues, referralId, onComplete, navProps, autoSave }: Step5Props) {
  const supabase = createClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const [pendingDocType, setPendingDocType] = useState<string>('facesheet')
  const [pendingDescription, setPendingDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  const form = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      notes: defaultValues.notes || '',
    },
  })

  const { saveStatus, flushSave } = useAutoSave({
    form,
    stepNumber: autoSave.stepNumber,
    saveStepData: autoSave.save,
  })

  useEffect(() => {
    autoSave.registerFlush(flushSave)
    return () => autoSave.registerFlush(null)
  }, [autoSave, flushSave])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !referralId) {
      if (!referralId) {
        toast({
          title: 'Save referral first',
          description: 'The referral must be saved before uploading documents.',
          variant: 'destructive',
        })
      }
      return
    }

    setUploading(true)
    const path = `${referralId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`

    const { error } = await supabase.storage
      .from('referral-documents')
      .upload(path, file)

    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } else {
      await supabase.from('referral_documents').insert({
        referral_id: referralId,
        doc_type: pendingDocType,
        file_name: file.name,
        storage_path: path,
        file_size_bytes: file.size,
        ...(pendingDocType === 'other' && pendingDescription ? { notes: pendingDescription } : {}),
      })

      setUploads(prev => [...prev, {
        name: file.name,
        doc_type: pendingDocType,
        description: pendingDocType === 'other' ? pendingDescription : undefined,
        storage_path: path,
        size: file.size,
      }])
      if (pendingDocType === 'other') setPendingDescription('')
      toast({ title: 'File uploaded successfully' })
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeUpload = async (path: string) => {
    await supabase.storage.from('referral-documents').remove([path])
    await supabase.from('referral_documents').delete().eq('storage_path', path)
    setUploads(prev => prev.filter(u => u.storage_path !== path))
  }

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete({ notes: data.notes })
  })

  const RECOMMENDED_DOCS: { type: string; label: string; required?: boolean }[] = [
    { type: 'facesheet', label: 'Admission Facesheet', required: true },
    { type: 'outstanding_balance', label: 'Outstanding Balance Statement' },
    { type: 'resident_funds', label: 'Current Resident Funds Statement' },
    { type: 'incapacity_determination', label: 'Incapacity Determination' },
    { type: 'level_of_care', label: 'Level of Care Assessment' },
    { type: 'medical_report', label: 'Medical Report / Physician Letter' },
    { type: 'poa', label: 'Power of Attorney (if exists)' },
    { type: 'bank_statement', label: 'Bank Statement(s)' },
    { type: 'financial_disclosure', label: 'Financial Disclosure' },
    { type: 'designation_of_rep', label: 'Designation of Representative' },
    { type: 'authorization_to_disclose', label: 'Authorization to Disclose' },
  ]

  const uploadedTypes = new Set(uploads.map(u => u.doc_type))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle>Documents & Uploads</CardTitle>
        </div>
        <CardDescription>
          Upload supporting documents and add any final notes for our team.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">

          {/* Recommended documents checklist */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Recommended Documents</h3>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              {RECOMMENDED_DOCS.map(({ type, label, required }) => {
                const isUploaded = uploadedTypes.has(type)
                return (
                  <div key={type} className={`flex items-center justify-between p-2.5 rounded-lg text-sm border ${isUploaded ? 'border-green-200 bg-green-50' : 'border-input'}`}>
                    <div className="flex items-center gap-2">
                      {isUploaded
                        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                        : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      }
                      <span>{label}</span>
                      {required && <Badge variant="outline" className="text-xs">Required</Badge>}
                    </div>
                    {!isUploaded && (
                      <button type="button" onClick={() => { setPendingDocType(type); fileInputRef.current?.click() }} className="text-xs text-primary hover:underline">Upload</button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload area */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Upload Other Document</h3>
              <Separator className="flex-1" />
            </div>

            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Document Description</label>
                <Input
                  placeholder="Describe what you're uploading..."
                  value={pendingDescription}
                  onChange={e => setPendingDescription(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" disabled={uploading || !referralId} onClick={() => { setPendingDocType('other'); fileInputRef.current?.click() }}>
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Choose File
              </Button>
            </div>

            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff" onChange={handleFileChange} />

            {!referralId && (
              <p className="text-xs text-amber-600 mt-2">
                Files can only be uploaded after the referral is saved. Complete Step 1 first to enable uploads.
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Accepted: PDF, Word documents, JPEG, PNG, TIFF. Max 20MB per file.
            </p>
          </div>

          {/* Uploaded files list */}
          {uploads.length > 0 && (
            <div className="space-y-2">
              {uploads.map((upload) => (
                <div key={upload.storage_path} className="flex items-center justify-between p-2.5 rounded-lg border border-green-200 bg-green-50">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <div>
                      <div className="font-medium">{upload.name}</div>
                      <div className="text-xs text-muted-foreground">{upload.description || DOC_TYPE_LABELS[upload.doc_type] || upload.doc_type} · {(upload.size / 1024).toFixed(0)} KB</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeUpload(upload.storage_path)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div>
            <Separator className="mb-4" />
            <Form {...form}>
              <FormField control={form.control} name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Notes & Additional Comments</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any additional context, concerns, urgency details, family dynamics, or other information that would help our team..." rows={10} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </Form>
          </div>

        </div>
      </CardContent>

      <StepNavigation
        {...navProps}
        onNext={handleNext}
        saveStatus={saveStatus}
      />
    </Card>
  )
}
