'use client';

// src/components/referral/StepIndicator.tsx

import { Check } from 'lucide-react';
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
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile: simple "Step X of Y" */}
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
      </div>

      {/* Desktop: full step indicator */}
      <nav aria-label="Form progress" className="hidden sm:block">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = completedSteps[`step_${step.number}`];
            const isCurrent = step.number === currentStep;
            const isUpcoming = !isCompleted && !isCurrent;

            return (
              <li
                key={step.number}
                className={cn('flex items-center', index < steps.length - 1 ? 'flex-1' : '')}
              >
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-all',
                      isCompleted && 'bg-primary border-primary text-primary-foreground',
                      isCurrent && 'border-primary text-primary bg-primary/10',
                      isUpcoming && 'border-muted-foreground/30 text-muted-foreground/50'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-1 text-xs font-medium whitespace-nowrap',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-muted-foreground',
                      isUpcoming && 'text-muted-foreground/40'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 mb-5 transition-all',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

