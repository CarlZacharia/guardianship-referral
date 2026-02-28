'use client';

// src/hooks/use-auto-save.ts
// Debounced auto-save hook for multi-step form fields.

import { useState, useEffect, useCallback, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Referral } from '@/lib/types/referral.types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  form: UseFormReturn<any>;
  stepNumber: number;
  saveStepData: (data: Partial<Referral>, step: number) => Promise<string | null>;
  enabled?: boolean;
  debounceMs?: number;
}

interface UseAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  flushSave: () => Promise<void>;
}

export function useAutoSave({
  form,
  stepNumber,
  saveStepData,
  enabled = true,
  debounceMs = 2000,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const lastSavedDataRef = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const isSavingRef = useRef(false);

  // Keep saveStepData in a ref so the watch subscription stays stable
  const saveStepDataRef = useRef(saveStepData);
  useEffect(() => {
    saveStepDataRef.current = saveStepData;
  }, [saveStepData]);

  // Initialize last-saved snapshot on mount
  useEffect(() => {
    lastSavedDataRef.current = JSON.stringify(form.getValues());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  // Core save (no debounce)
  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;

    const currentData = form.getValues();
    const serialized = JSON.stringify(currentData);

    // Skip if nothing changed
    if (serialized === lastSavedDataRef.current) return;

    isSavingRef.current = true;
    if (isMountedRef.current) setSaveStatus('saving');

    try {
      const result = await saveStepDataRef.current(
        currentData as Partial<Referral>,
        stepNumber,
      );

      if (isMountedRef.current) {
        if (result) {
          lastSavedDataRef.current = serialized;
          setLastSavedAt(new Date());
          setSaveStatus('saved');

          // Reset to idle after 3 seconds
          if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
          savedTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) setSaveStatus('idle');
          }, 3000);
        } else {
          setSaveStatus('error');
        }
      }
    } catch {
      if (isMountedRef.current) setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [form, stepNumber]);

  // Imperative flush: cancel pending debounce, save now
  const flushSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await performSave();
  }, [performSave]);

  // Watch all form fields and debounce
  useEffect(() => {
    if (!enabled) return;

    const subscription = form.watch(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        performSave();
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [form, enabled, debounceMs, performSave]);

  return { saveStatus, lastSavedAt, flushSave };
}
