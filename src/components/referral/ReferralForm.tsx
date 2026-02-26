'use client';

// src/components/referral/ReferralForm.tsx
// Main orchestrator for the multi-step referral form

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Referral, ReferralType } from '@/lib/types/referral.types';
import { StepIndicator } from './StepIndicator';
import { StepNavigation } from './StepNavigation';
import { Step1ReferralSource } from './steps/Step1ReferralSource';
import { Step2CaseType } from './steps/Step2CaseType';
import { Step3ClientIdentity } from './steps/Step3ClientIdentity';
import { Step4MedicalCapacity } from './steps/Step4MedicalCapacity';
import { Step5Financial } from './steps/Step5Financial';
import { Step6Family } from './steps/Step6Family';
import { Step7LegalDocuments } from './steps/Step7LegalDocuments';
import { Step8DocumentsNotes } from './steps/Step8DocumentsNotes';
import { Step9ReviewSubmit } from './steps/Step9ReviewSubmit';
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
    label: 'Referral Source',
    description: 'Who is making this referral?',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 2,
    label: 'Case Type',
    description: 'What type of case is this?',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 3,
    label: 'Client Identity',
    description: 'Basic client information',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 4,
    label: 'Medical & Capacity',
    description: 'Diagnoses, capacity, and physician',
    requiredFor: ['guardianship', 'both'] as ReferralType[],
  },
  {
    number: 5,
    label: 'Financial',
    description: 'Income, assets, and benefits',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 6,
    label: 'Family & Contacts',
    description: 'Spouse, children, and next of kin',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 7,
    label: 'Legal Documents',
    description: 'Existing POAs, guardianship, trusts',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 8,
    label: 'Documents & Notes',
    description: 'Upload attachments and add notes',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
  {
    number: 9,
    label: 'Review & Submit',
    description: 'Review all information and submit',
    requiredFor: ['guardianship', 'medicaid', 'both'] as ReferralType[],
  },
];

interface ReferralFormProps {
  referralId?: string;      // if resuming a draft
  initialData?: Partial<Referral>;
  userId: string;
}

export function ReferralForm({ referralId, initialData, userId }: ReferralFormProps) {
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

  // For step 4 (Medical): only required for guardianship or both
  const showMedicalStep = !referralType || referralType === 'guardianship' || referralType === 'both';

  // Save current step data to Supabase
  const saveStepData = useCallback(async (
    stepData: Partial<Referral>,
    stepNumber: number,
    isFinalSubmit = false
  ) => {
    setIsSaving(true);
    setError(null);

    try {
      const payload: Partial<Referral> = {
        ...referralData,
        ...stepData,
        referrer_id: userId,
        current_step: stepNumber,
        steps_completed: {
          ...referralData.steps_completed,
          [`step_${stepNumber}`]: true,
        },
        status: isFinalSubmit ? 'submitted' : 'draft',
        ...(isFinalSubmit && { submitted_at: new Date().toISOString() }),
      };

      let result;

      if (savedReferralId) {
        // Update existing draft
        const { data, error: updateError } = await supabase
          .from('referrals')
          .update(payload)
          .eq('id', savedReferralId)
          .select('id')
          .single();

        if (updateError) throw updateError;
        result = data;
      } else {
        // Create new referral
        const { data, error: insertError } = await supabase
          .from('referrals')
          .insert(payload)
          .select('id')
          .single();

        if (insertError) throw insertError;
        result = data;
        setSavedReferralId(result.id);
      }

      // Update local state
      setReferralData(prev => ({ ...prev, ...stepData }));

      return result?.id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save. Please try again.';
      setError(message);
      toast({
        title: 'Save Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSaving(false);
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

  const handleBack = useCallback(() => {
    const currentIndex = activeSteps.findIndex(s => s.number === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(activeSteps[currentIndex - 1].number);
      window.scrollTo(0, 0);
    }
  }, [currentStep, activeSteps]);

  const handleSaveDraft = useCallback(async (stepData: Partial<Referral>) => {
    await saveStepData(stepData, currentStep);
    toast({
      title: 'Draft Saved',
      description: 'Your progress has been saved. You can return to complete this form later.',
    });
  }, [saveStepData, currentStep, toast]);

  const handleFinalSubmit = useCallback(async (stepData: Partial<Referral>) => {
    const savedId = await saveStepData(stepData, currentStep, true);
    if (savedId) {
      toast({
        title: 'Referral Submitted',
        description: 'Your referral has been submitted successfully. Our team will be in touch.',
      });
      router.push('/dashboard');
    }
  }, [saveStepData, currentStep, toast, router]);

  const isFirstStep = currentStep === activeSteps[0]?.number;
  const isLastStep = currentStep === activeSteps[activeSteps.length - 1]?.number;

  // Step navigation props
  const navProps = {
    onBack: handleBack,
    onSaveDraft: handleSaveDraft,
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
          <Step1ReferralSource
            defaultValues={referralData}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 2 && (
          <Step2CaseType
            defaultValues={referralData}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 3 && (
          <Step3ClientIdentity
            defaultValues={referralData}
            referralType={referralType}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 4 && showMedicalStep && (
          <Step4MedicalCapacity
            defaultValues={referralData}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 5 && (
          <Step5Financial
            defaultValues={referralData}
            referralType={referralType}
            referralId={savedReferralId}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 6 && (
          <Step6Family
            defaultValues={referralData}
            referralId={savedReferralId}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 7 && (
          <Step7LegalDocuments
            defaultValues={referralData}
            referralType={referralType}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 8 && (
          <Step8DocumentsNotes
            defaultValues={referralData}
            referralId={savedReferralId}
            onComplete={handleStepComplete}
            navProps={navProps}
          />
        )}
        {currentStep === 9 && (
          <Step9ReviewSubmit
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

