'use client';

// src/components/referral/steps/Step2FamilyContactsAgents.tsx
// Combined step: Family Members + Legal Documents + Benefits + Legal Rep

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema, Step2FormData } from '@/lib/validations/referral.schema';
import { Referral, ReferralType, AutoSaveProps } from '@/lib/types/referral.types';
import { useAutoSave } from '@/hooks/use-auto-save';
import { StepNavigation, StepNavProps } from '../StepNavigation';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Users, PlusCircle, Trash2, Shield, Scale, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step2Props {
  defaultValues: Partial<Referral>;
  referralType?: ReferralType;
  referralId?: string;
  onComplete: (data: Partial<Referral>) => Promise<void>;
  navProps: StepNavProps;
  autoSave: AutoSaveProps;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  child: 'Child',
  sibling: 'Sibling',
  parent: 'Parent',
  other_nok: 'Other Next of Kin',
  spouse: 'Spouse (if not listed above)',
};

type FamilyMemberDraft = {
  relationship: 'child' | 'sibling' | 'parent' | 'other_nok' | 'spouse';
  full_name: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  notes: string;
};

const EMPTY_MEMBER: FamilyMemberDraft = {
  relationship: 'child',
  full_name: '',
  dob: '',
  address: '',
  city: '',
  state: 'FL',
  zip: '',
  phone: '',
  email: '',
  notes: '',
};

function FamilyMemberModal({
  open,
  onOpenChange,
  initial,
  onSave,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: FamilyMemberDraft;
  onSave: (data: FamilyMemberDraft) => void;
  mode: 'add' | 'edit';
}) {
  const [draft, setDraft] = useState<FamilyMemberDraft>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  const update = (field: keyof FamilyMemberDraft, value: string) =>
    setDraft(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!draft.full_name.trim()) return;
    onSave(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Child or Family Member' : 'Edit Family Member'}</DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Enter the details for the new family member.'
              : 'Update the family member details below.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fm-name">Full Name *</Label>
              <Input id="fm-name" value={draft.full_name} onChange={e => update('full_name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fm-rel">Relationship</Label>
              <select
                id="fm-rel"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={draft.relationship}
                onChange={e => update('relationship', e.target.value)}
              >
                {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fm-dob">Date of Birth</Label>
              <Input id="fm-dob" type="date" value={draft.dob} onChange={e => update('dob', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fm-phone">Phone</Label>
              <Input id="fm-phone" type="tel" value={draft.phone} onChange={e => update('phone', e.target.value)} placeholder="(239) 555-0000" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fm-email">Email</Label>
            <Input id="fm-email" type="email" value={draft.email} onChange={e => update('email', e.target.value)} placeholder="email@example.com" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fm-address">Street Address</Label>
            <Input id="fm-address" value={draft.address} onChange={e => update('address', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fm-city">City</Label>
              <Input id="fm-city" value={draft.city} onChange={e => update('city', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fm-state">State</Label>
              <Input id="fm-state" maxLength={2} value={draft.state} onChange={e => update('state', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fm-zip">ZIP</Label>
              <Input id="fm-zip" maxLength={10} value={draft.zip} onChange={e => update('zip', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fm-notes">Notes</Label>
            <Textarea id="fm-notes" rows={2} value={draft.notes} onChange={e => update('notes', e.target.value)} placeholder="Any additional notes..." />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={!draft.full_name.trim()}>
            {mode === 'add' ? 'Add Member' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{className?: string}>; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
      <Separator className="flex-1" />
    </div>
  );
}

// Yes/No radio with conditional detail fields (name, date executed, contact)
function LegalDocField({
  form,
  boolField,
  label,
  nameField,
  nameLabel,
  namePlaceholder,
  dateField,
  contactField,
}: {
  form: ReturnType<typeof useForm<Step2FormData>>;
  boolField: keyof Step2FormData;
  label: string;
  nameField: keyof Step2FormData;
  nameLabel: string;
  namePlaceholder: string;
  dateField: keyof Step2FormData;
  contactField: keyof Step2FormData;
}) {
  const value = form.watch(boolField);
  const isYes = value === true;

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name={boolField}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">{label}</FormLabel>
            <FormControl>
              <RadioGroup
                className="flex gap-4 mt-1"
                value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
                onValueChange={(v) => field.onChange(v === 'yes')}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id={`${String(boolField)}-yes`} />
                  <Label htmlFor={`${String(boolField)}-yes`} className="cursor-pointer font-normal">Yes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id={`${String(boolField)}-no`} />
                  <Label htmlFor={`${String(boolField)}-no`} className="cursor-pointer font-normal">No</Label>
                </div>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
      {isYes && (
        <div className="space-y-3 pl-4 border-l-2 border-primary/20">
          <FormField
            control={form.control}
            name={nameField}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">{nameLabel}</FormLabel>
                <FormControl>
                  <Input placeholder={namePlaceholder} {...field} value={field.value as string || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={dateField}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Date Executed</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., January 2020" {...field} value={field.value as string || ''} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={contactField}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Contact Information</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Phone, email, or address"
                    rows={2}
                    {...field}
                    value={field.value as string || ''}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}

export function Step2FamilyContactsAgents({
  defaultValues,
  referralType,
  referralId,
  onComplete,
  navProps,
  autoSave,
}: Step2Props) {
  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      family_members: (defaultValues as any).family_members || [],
      has_poa: defaultValues.has_poa,
      poa_agent_name: defaultValues.poa_agent_name || '',
      poa_date_executed: defaultValues.poa_date_executed || '',
      poa_contact: defaultValues.poa_contact || '',
      has_hc_surrogate: defaultValues.has_hc_surrogate,
      hc_surrogate_name: defaultValues.hc_surrogate_name || '',
      hc_surrogate_date_executed: defaultValues.hc_surrogate_date_executed || '',
      hc_surrogate_contact: defaultValues.hc_surrogate_contact || '',
      has_living_will: defaultValues.has_living_will,
      living_will_agent_name: defaultValues.living_will_agent_name || '',
      living_will_date_executed: defaultValues.living_will_date_executed || '',
      living_will_contact: defaultValues.living_will_contact || '',
      has_trust: defaultValues.has_trust,
      trust_type: defaultValues.trust_type || '',
      trust_trustee_name: defaultValues.trust_trustee_name || '',
      trust_date_executed: defaultValues.trust_date_executed || '',
      trust_contact: defaultValues.trust_contact || '',
      has_prior_guardianship: defaultValues.has_prior_guardianship,
      prior_guardianship_details: defaultValues.prior_guardianship_details || '',
      existing_guardian_name: defaultValues.existing_guardian_name || '',
      guardianship_date_executed: defaultValues.guardianship_date_executed || '',
      guardianship_contact: defaultValues.guardianship_contact || '',
      disability_benefits: defaultValues.disability_benefits || false,
      veteran_services: defaultValues.veteran_services || false,
      other_services: defaultValues.other_services || '',
      legal_rep_name: defaultValues.legal_rep_name || '',
      legal_rep_contact: defaultValues.legal_rep_contact || '',
      special_needs: defaultValues.special_needs || '',
    },
  });

  const { saveStatus, flushSave } = useAutoSave({
    form,
    stepNumber: autoSave.stepNumber,
    saveStepData: autoSave.save,
  });

  useEffect(() => {
    autoSave.registerFlush(flushSave);
    return () => autoSave.registerFlush(null);
  }, [autoSave, flushSave]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'family_members',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalInitial, setModalInitial] = useState<FamilyMemberDraft>(EMPTY_MEMBER);

  const handleNext = form.handleSubmit(async (data) => {
    await onComplete(data as Partial<Referral>);
  });

  const openAddModal = () => {
    setModalMode('add');
    setEditIndex(null);
    setModalInitial(EMPTY_MEMBER);
    setModalOpen(true);
  };

  const openEditModal = (index: number) => {
    const member = fields[index];
    setModalMode('edit');
    setEditIndex(index);
    setModalInitial({
      relationship: (member as any).relationship || 'child',
      full_name: (member as any).full_name || '',
      dob: (member as any).dob || '',
      address: (member as any).address || '',
      city: (member as any).city || '',
      state: (member as any).state || 'FL',
      zip: (member as any).zip || '',
      phone: (member as any).phone || '',
      email: (member as any).email || '',
      notes: (member as any).notes || '',
    });
    setModalOpen(true);
  };

  const handleModalSave = (data: FamilyMemberDraft) => {
    if (modalMode === 'add') {
      append(data as any);
    } else if (editIndex !== null) {
      (Object.keys(data) as (keyof FamilyMemberDraft)[]).forEach(key => {
        form.setValue(`family_members.${editIndex}.${key}` as any, data[key], { shouldDirty: true });
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle>Family - Agents</CardTitle>
        </div>
        <CardDescription>
          Family members, legal documents, and support services.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-6">

            {/* ── Family Members ── */}
            <div className="flex items-center justify-between">
              <SectionHeader icon={Users} title="Children & Next of Kin" />
              <span className="text-xs text-muted-foreground">{fields.length} added</span>
            </div>

            <p className="text-sm text-muted-foreground -mt-4">
              List all children (regardless of age), siblings, and other close relatives.
              In Florida, all adult next-of-kin must receive notice of guardianship proceedings.
            </p>

            {fields.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                No family members added yet.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Relationship</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Phone</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr
                        key={field.id}
                        className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => openEditModal(index)}
                      >
                        <td className="py-2 px-3">{(field as any).full_name || <span className="text-muted-foreground italic">No name</span>}</td>
                        <td className="py-2 px-3">{RELATIONSHIP_LABELS[(field as any).relationship] || (field as any).relationship}</td>
                        <td className="py-2 px-3 text-muted-foreground">{(field as any).phone || '—'}</td>
                        <td className="py-2 px-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive h-7 w-7 p-0"
                            onClick={(e) => { e.stopPropagation(); remove(index); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Button type="button" variant="outline" onClick={openAddModal} className="w-full">
              <PlusCircle className="w-4 h-4 mr-2" /> Add New Family Member
            </Button>

            <FamilyMemberModal
              open={modalOpen}
              onOpenChange={setModalOpen}
              initial={modalInitial}
              onSave={handleModalSave}
              mode={modalMode}
            />

            {/* ── Legal Documents ── */}
            <SectionHeader icon={Shield} title="Financial & Health Documents" />

            <div className="space-y-5">
              <LegalDocField
                form={form}
                boolField="has_poa"
                label="Financial Power of Attorney"
                nameField="poa_agent_name"
                nameLabel="Agent Name"
                namePlaceholder="Name of POA agent"
                dateField="poa_date_executed"
                contactField="poa_contact"
              />
              <LegalDocField
                form={form}
                boolField="has_hc_surrogate"
                label="Health Care Surrogate / Health Care Proxy"
                nameField="hc_surrogate_name"
                nameLabel="Surrogate Name"
                namePlaceholder="Name of health care surrogate"
                dateField="hc_surrogate_date_executed"
                contactField="hc_surrogate_contact"
              />
              <LegalDocField
                form={form}
                boolField="has_living_will"
                label="Living Will / Advance Directive"
                nameField="living_will_agent_name"
                nameLabel="Agent / Designee Name"
                namePlaceholder="Name of designated agent"
                dateField="living_will_date_executed"
                contactField="living_will_contact"
              />
              <LegalDocField
                form={form}
                boolField="has_trust"
                label="Qualified Income Trust"
                nameField="trust_trustee_name"
                nameLabel="Qualified Income Trustee Name"
                namePlaceholder="Name of trustee"
                dateField="trust_date_executed"
                contactField="trust_contact"
              />
            </div>

            {/* Guardianship History */}
            {(referralType === 'guardianship' || referralType === 'both' || !referralType) && (
              <>
                <SectionHeader icon={Scale} title="Guardianship History" />
                <div className="space-y-5">
                  <LegalDocField
                    form={form}
                    boolField="has_prior_guardianship"
                    label="Prior or existing guardianship proceedings?"
                    nameField="existing_guardian_name"
                    nameLabel="Guardian Name"
                    namePlaceholder="Name of currently appointed guardian"
                    dateField="guardianship_date_executed"
                    contactField="guardianship_contact"
                  />
                  {form.watch('has_prior_guardianship') && (
                    <div className="pl-4 border-l-2 border-primary/20">
                      <FormField control={form.control} name="prior_guardianship_details"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Additional Details</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe prior proceedings, court, case number if known" rows={3} {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Benefits & Support */}
            <SectionHeader icon={HeartPulse} title="Benefits & Support Services" />

            <div className="space-y-3">
              {(['disability_benefits', 'veteran_services'] as const).map(fieldName => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName}
                  render={({ field: f }) => (
                    <FormItem>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-input">
                        <FormLabel className="cursor-pointer font-medium mb-0">
                          {fieldName === 'disability_benefits' ? 'Supplemental Security Income (SSI)' : 'Veterans Benefits / Services'}
                        </FormLabel>
                        <FormControl>
                          <Switch checked={!!f.value} onCheckedChange={f.onChange} />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
              <FormField control={form.control} name="other_services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Benefits or Services</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Community Mediaid, QMB, Community Programs" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>


            {/* Special Needs */}
            <FormField control={form.control} name="special_needs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Needs, Preferences, or Wishes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special needs, cultural considerations, religious preferences, care preferences, or expressed wishes of the individual..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

          </div>
        </Form>
      </CardContent>

      <StepNavigation
        {...navProps}
        onNext={handleNext}
        saveStatus={saveStatus}
      />
    </Card>
  );
}
