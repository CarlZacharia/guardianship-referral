'use client';

// src/components/referral/StepIndicator.tsx

import { cn } from '@/lib/utils';

interface Step {
  number: number;
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: Record<string, boolean>;
  onStepClick?: (stepNumber: number) => void;
}

/**
 * A step is navigable if every prior step in the list is completed.
 * This means you can always go back to completed steps and forward to the
 * next unlocked step, but not skip ahead.
 */
function isStepNavigable(
  step: Step,
  index: number,
  steps: Step[],
  completedSteps: Record<string, boolean>,
  currentStep: number,
): boolean {
  if (step.number === currentStep) return true;

  // Already-completed steps are always navigable (can go back to edit)
  if (completedSteps[`step_${step.number}`]) return true;

  // For uncompleted steps: every step before this one must be completed
  for (let i = 0; i < index; i++) {
    if (!completedSteps[`step_${steps[i].number}`]) return false;
  }
  return true;
}

export function StepIndicator({ steps, currentStep, completedSteps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile: step selector */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
          <span>
            Step {steps.findIndex(s => s.number === currentStep) + 1} of {steps.length}
          </span>
          <span className="font-medium text-foreground">
            {steps.find(s => s.number === currentStep)?.label}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((steps.findIndex(s => s.number === currentStep) + 1) / steps.length) * 100}%`
            }}
          />
        </div>

        {/* Mobile step buttons */}
        {onStepClick && (
          <div className="flex flex-wrap gap-2 mt-3">
            {steps.map((step, index) => {
              const isCompleted = completedSteps[`step_${step.number}`];
              const isCurrent = step.number === currentStep;
              const navigable = isStepNavigable(step, index, steps, completedSteps, currentStep);

              return (
                <button
                  key={step.number}
                  type="button"
                  disabled={!navigable}
                  onClick={() => navigable && !isCurrent && onStepClick(step.number)}
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors',
                    isCurrent && 'bg-primary text-primary-foreground',
                    isCompleted && !isCurrent && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                    !navigable && 'cursor-not-allowed',
                  )}
                >
                  <span>{step.number}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop: full step indicator */}
      <nav aria-label="Form progress" className="hidden sm:block">
        <ol className="flex">
          {steps.map((step, index) => {
            const isCompleted = completedSteps[`step_${step.number}`];
            const isCurrent = step.number === currentStep;
            const isCurrentOnly = isCurrent && !isCompleted;
            const isUpcoming = !isCompleted && !isCurrent;
            const navigable = isStepNavigable(step, index, steps, completedSteps, currentStep);
            const clickable = navigable && !isCurrent && !!onStepClick;

            return (
              <li
                key={step.number}
                className="flex-1 relative"
              >
                {/* Connector line — absolutely positioned between circle centers */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute top-3.75 h-0.5 left-[calc(50%+16px)] right-[calc(-50%+16px)]',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}

                {/* Step circle + label */}
                <button
                  type="button"
                  disabled={!navigable || isCurrent}
                  onClick={() => clickable && onStepClick(step.number)}
                  className={cn(
                    'relative z-10 flex flex-col items-center w-full group',
                    clickable && 'cursor-pointer',
                    (!navigable || isCurrent) && 'cursor-default',
                  )}
                  title={
                    !navigable
                      ? 'Complete previous steps first'
                      : isCurrent
                        ? step.label
                        : `Go to ${step.label}`
                  }
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all',
                      isCompleted && !isCurrent && 'bg-primary text-primary-foreground',
                      isCompleted && isCurrent && 'bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary',
                      isCurrentOnly && 'bg-background text-primary border-2 border-primary',
                      isUpcoming && 'bg-muted text-muted-foreground',
                      clickable && 'group-hover:scale-110 group-hover:shadow-md',
                      clickable && isCompleted && 'group-hover:bg-primary/90',
                    )}
                  >
                    <span>{step.number}</span>
                  </div>
                  <span
                    className={cn(
                      'mt-1 text-xs font-medium text-center transition-colors',
                      isCurrent && 'text-primary',
                      isCompleted && !isCurrent && 'text-foreground',
                      isUpcoming && 'text-muted-foreground',
                      clickable && 'group-hover:text-primary',
                    )}
                  >
                    {step.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
