'use client';

// src/components/referral/ReferralForm.tsx
// Main orchestrator for the multi-step referral form

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Referral, ReferralType } from '@/lib/types/referral.types';
import { StepIndicator } from './StepIndicator';
import { StepNavigation } from './StepNavigation';
import { Step1Referral } from './steps/Step1Referral';
import { Step2FamilyContactsAgents } from './steps/Step2FamilyContactsAgents';
import { Step3MedicalCapacity } from './steps/Step3MedicalCapacity';
import { Step4Financial } from './steps/Step4Financial';
import { Step5DocumentsNotes } from './steps/Step5DocumentsNotes';
import { Step6Medicaid } from './steps/Step6Medicaid';
import { Step7ReviewSubmit } from './steps/Step7ReviewSubmit';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// ============================================================
// Step definitions — label, description, and which referral
// types require this step
// ============================================================
export const STEPS = [
  {
    number: 1,
    label: 'Referral',
    description: 'Source, case type, and client information',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 2,
    label: 'Family - Agents',
    description: 'Family members, legal documents, and support services',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 3,
    label: 'Medical & Capacity',
    description: 'Diagnoses, capacity, and physician',
    requiredFor: ['guardianship', 'both'] as ReferralType[],
  },
  {
    number: 4,
    label: 'Financial',
    description: 'Income, assets, and benefits',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 5,
    label: 'Medicaid',
    description: 'Medicaid application details',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 6,
    label: 'Documents & Uploads',
    description: 'Upload attachments and add notes',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 7,
    label: 'Review & Submit',
    description: 'Review all information and submit',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
];

interface ReferralFormProps {
  referralId?: string;      // if resuming a draft
  initialData?: Partial<Referral>;
  userId: string;
  referrerOrganization?: string;
  referrerType?: string;
}

export function ReferralForm({ referralId, initialData, userId, referrerOrganization, referrerType }: ReferralFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(initialData?.current_step || 1);
  const [referralData, setReferralData] = useState<Partial<Referral>>(initialData || {});
  const [savedReferralId, setSavedReferralId] = useState<string | undefined>(referralId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referralType = referralData.referral_type;

  // Get active steps based on referral type selected so far
  const activeSteps = STEPS.filter(step =>
    !referralType || step.requiredFor.includes(referralType)
  );

  // For step 3 (Medical): only required for guardianship or both
  const showMedicalStep = !referralType || referralType === 'guardianship' || referralType === 'both';

  // Save current step data to Supabase
  // silent=true for auto-save: skips isSaving flag and error toast
  const saveStepData = useCallback(async (
    stepData: Partial<Referral>,
    stepNumber: number,
    isFinalSubmit = false,
    silent = false
  ) => {
    if (!silent) setIsSaving(true);
    setError(null);

    try {
      // Separate related-table data from the referrals payload
      const { assets, family_members, referral_documents, facilities, ...referralFields } = {
        ...referralData,
        ...stepData,
      } as any;

      // Convert empty-string UUID fields to null so PostgreSQL doesn't reject them
      const uuidFields = ['facility_id'] as const;
      for (const key of uuidFields) {
        if ((referralFields as any)[key] === '') {
          (referralFields as any)[key] = null;
        }
      }

      // Convert empty-string date fields to null so PostgreSQL doesn't reject them
      const dateFields = ['client_dob', 'admission_date', 'spouse_dob', 'submitted_date'] as const;
      for (const key of dateFields) {
        if ((referralFields as any)[key] === '') {
          (referralFields as any)[key] = null;
        }
      }

      const payload: Partial<Referral> = {
        ...referralFields,
        referrer_id: userId,
        current_step: stepNumber,
        steps_completed: {
          ...referralData.steps_completed,
          [`step_${stepNumber}`]: true,
        },
        status: isFinalSubmit ? 'submitted' : 'draft',
        ...(isFinalSubmit && { submitted_at: new Date().toISOString() }),
      };

      // Remove any remaining non-column fields
      delete (payload as any).id;
      delete (payload as any).created_at;
      delete (payload as any).profiles;

      let result;
      let currentReferralId = savedReferralId;

      if (currentReferralId) {
        // Update existing draft
        const { data, error: updateError } = await supabase
          .from('referrals')
          .update(payload)
          .eq('id', currentReferralId)
          .select('id')
          .single();

        if (updateError) throw updateError;
        result = data;
      } else {
        // Create new referral — ensure referral_type has a default for the NOT NULL constraint
        if (!payload.referral_type) {
          payload.referral_type = 'guardianship';
        }
        const { data, error: insertError } = await supabase
          .from('referrals')
          .insert(payload)
          .select('id')
          .single();

        if (insertError) throw insertError;
        result = data;
        currentReferralId = result.id;
        setSavedReferralId(result.id);
      }

      // Save assets to the assets table (replace all for this referral)
      if (assets && currentReferralId) {
        await supabase.from('assets').delete().eq('referral_id', currentReferralId);
        if (assets.length > 0) {
          const assetRows = assets.map((a: any, i: number) => ({
            referral_id: currentReferralId,
            asset_type: a.asset_type,
            institution: a.institution || null,
            description: a.description || null,
            account_last4: a.account_last4 || null,
            approximate_value: a.approximate_value || null,
            is_exempt: a.is_exempt || false,
            notes: a.notes || null,
            sort_order: i,
          }));
          const { error: assetError } = await supabase.from('assets').insert(assetRows);
          if (assetError) throw assetError;
        }
      }

      // Save family members to the family_members table (replace all for this referral)
      if (family_members && currentReferralId) {
        await supabase.from('family_members').delete().eq('referral_id', currentReferralId);
        if (family_members.length > 0) {
          const memberRows = family_members.map((m: any, i: number) => ({
            referral_id: currentReferralId,
            relationship: m.relationship,
            full_name: m.full_name || null,
            dob: m.dob || null,
            address: m.address || null,
            city: m.city || null,
            state: m.state || null,
            zip: m.zip || null,
            phone: m.phone || null,
            email: m.email || null,
            notes: m.notes || null,
            sort_order: i,
          }));
          const { error: memberError } = await supabase.from('family_members').insert(memberRows);
          if (memberError) throw memberError;
        }
      }

      // Update local state — include the updated steps_completed so
      // subsequent saves don't overwrite previous step completions.
      const updatedStepsCompleted = {
        ...referralData.steps_completed,
        [`step_${stepNumber}`]: true,
      };
      setReferralData(prev => ({
        ...prev,
        ...stepData,
        steps_completed: updatedStepsCompleted,
        current_step: stepNumber,
      }));

      return result?.id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save. Please try again.';
      setError(message);
      if (!silent) {
        toast({
          title: 'Save Error',
          description: message,
          variant: 'destructive',
        });
      }
      return null;
    } finally {
      if (!silent) setIsSaving(false);
    }
  }, [referralData, savedReferralId, supabase, userId, toast]);

  const handleStepComplete = useCallback(async (
    stepData: Partial<Referral>,
    advance = true
  ) => {
    const savedId = await saveStepData(stepData, currentStep);

    if (savedId && advance) {
      // Find next active step number
      const currentIndex = activeSteps.findIndex(s => s.number === currentStep);
      const nextStep = activeSteps[currentIndex + 1];

      if (nextStep) {
        setCurrentStep(nextStep.number);
        window.scrollTo(0, 0);
      }
    }
  }, [saveStepData, currentStep, activeSteps]);

  const handleBack = useCallback(async () => {
    const currentIndex = activeSteps.findIndex(s => s.number === currentStep);
    if (currentIndex > 0) {
      await flushCurrentStepRef.current?.();
      setCurrentStep(activeSteps[currentIndex - 1].number);
      window.scrollTo(0, 0);
    }
  }, [currentStep, activeSteps]);

  // Click a step in the indicator — allowed for completed steps and the next unlocked step
  const handleStepClick = useCallback(async (stepNumber: number) => {
    const completedSteps = referralData.steps_completed || {};

    // Already-completed steps are always allowed (go back to edit)
    if (completedSteps[`step_${stepNumber}`]) {
      await flushCurrentStepRef.current?.();
      setCurrentStep(stepNumber);
      window.scrollTo(0, 0);
      return;
    }

    // For uncompleted steps: every prior step must be completed
    const targetIndex = activeSteps.findIndex(s => s.number === stepNumber);
    for (let i = 0; i < targetIndex; i++) {
      if (!completedSteps[`step_${activeSteps[i].number}`]) return;
    }

    await flushCurrentStepRef.current?.();
    setCurrentStep(stepNumber);
    window.scrollTo(0, 0);
  }, [activeSteps, referralData.steps_completed]);

  const handleFinalSubmit = useCallback(async (stepData: Partial<Referral>) => {
    const savedId = await saveStepData(stepData, currentStep, true);
    if (savedId) {
      // Generate and download the PDF report before redirecting
      try {
        const { data, error } = await supabase.functions.invoke(
          'send-referral-report',
          { body: { referral_id: savedId } }
        );
        if (data && !error) {
          const blob = data instanceof Blob
            ? data
            : new Blob([data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Referral-Report.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch {
        // PDF download failed — email still sends via DB trigger
      }

      toast({
        title: 'Referral Submitted',
        description: 'Your referral has been submitted successfully. Our team will be in touch.',
      });
      router.push('/dashboard');
    }
  }, [saveStepData, currentStep, toast, router]);

  // ── Auto-save infrastructure ──
  // Silent save wrapper for the useAutoSave hook (no isSaving flag, no error toast)
  const silentSave = useCallback(async (
    data: Partial<Referral>,
    step: number,
  ) => {
    return saveStepData(data, step, false, true);
  }, [saveStepData]);

  // Ref to the current step's flushSave — called before step navigation
  const flushCurrentStepRef = useRef<(() => Promise<void>) | null>(null);
  const registerFlush = useCallback((fn: (() => Promise<void>) | null) => {
    flushCurrentStepRef.current = fn;
  }, []);

  const autoSave = {
    save: silentSave,
    stepNumber: currentStep,
    registerFlush,
  };

  const isFirstStep = currentStep === activeSteps[0]?.number;
  const isLastStep = currentStep === activeSteps[activeSteps.length - 1]?.number;

  // Step navigation props
  const navProps = {
    onBack: handleBack,
    isSaving,
    isFirstStep,
    isLastStep,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <StepIndicator
        steps={activeSteps}
        currentStep={currentStep}
        completedSteps={referralData.steps_completed || {}}
        onStepClick={handleStepClick}
      />

      {/* Error Banner */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && (
          <Step1Referral
            defaultValues={referralData}
            onComplete={handleStepComplete}
            navProps={navProps}
            autoSave={autoSave}
            referrerOrganization={referrerOrganization}
            referrerType={referrerType}
          />
        )}
        {currentStep === 2 && (
          <Step2FamilyContactsAgents
            defaultValues={referralData}
            referralType={referralType}
            referralId={savedReferralId}
            onComplete={handleStepComplete}
            navProps={navProps}
            autoSave={autoSave}
          />
        )}
        {currentStep === 3 && showMedicalStep && (
          <Step3MedicalCapacity
            defaultValues={referralData}
            onComplete={handleStepComplete}
            navProps={navProps}
            autoSave={autoSave}
          />
        )}
        {currentStep === 4 && (
          <Step4Financial
            defaultValues={referralData}
            referralType={referralType}
            referralId={savedReferralId}
            onComplete={handleStepComplete}
            navProps={navProps}
            autoSave={autoSave}
          />
        )}
        {currentStep === 5 && (
          <Step6Medicaid
            defaultValues={referralData}
            onComplete={handleStepComplete}
            navProps={navProps}
            autoSave={autoSave}
          />
        )}
        {currentStep === 6 && (
          <Step5DocumentsNotes
            defaultValues={referralData}
            referralId={savedReferralId}
            onComplete={handleStepComplete}
            navProps={navProps}
            autoSave={autoSave}
          />
        )}
        {currentStep === 7 && (
          <Step7ReviewSubmit
            referralData={referralData}
            referralId={savedReferralId}
            activeSteps={activeSteps}
            onSubmit={handleFinalSubmit}
            onEditStep={setCurrentStep}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}
