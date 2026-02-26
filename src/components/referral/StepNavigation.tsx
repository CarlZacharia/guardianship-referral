'use client';

// src/components/referral/StepNavigation.tsx

import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Referral } from '@/lib/types/referral.types';

export interface StepNavProps {
  onBack: () => void;
  onSaveDraft: (data: Partial<Referral>) => Promise<void>;
  isSaving: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface StepNavigationProps extends StepNavProps {
  onNext: () => void;           // triggers form submission / validation
  currentStepData?: Partial<Referral>; // for save draft
}

export function StepNavigation({
  onBack,
  onNext,
  onSaveDraft,
  currentStepData,
  isSaving,
  isFirstStep,
  isLastStep,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t">
      {/* Back button */}
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isFirstStep || isSaving}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      <div className="flex items-center gap-3">
        {/* Save Draft */}
        {!isLastStep && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => currentStepData && onSaveDraft(currentStepData)}
            disabled={isSaving}
            className="text-muted-foreground"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            Save Draft
          </Button>
        )}

        {/* Next / Submit */}
        <Button
          type="button"
          onClick={onNext}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
          {isLastStep ? 'Submit Referral' : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

