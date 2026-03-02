'use client';

// src/components/referral/StepNavigation.tsx

import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { SaveStatus } from '@/hooks/use-auto-save';

export interface StepNavProps {
  onBack: () => void;
  isSaving: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface StepNavigationProps extends StepNavProps {
  onNext: () => void;           // triggers form submission / validation
  saveStatus?: SaveStatus;
}

export function StepNavigation({
  onBack,
  onNext,
  isSaving,
  isFirstStep,
  isLastStep,
  saveStatus,
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
        {/* Auto-save status indicator */}
        {saveStatus === 'saving' && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Saved
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Save failed
          </span>
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
