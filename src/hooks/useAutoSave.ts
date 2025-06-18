import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

interface UseAutoSaveOptions {
  formType: string;
  formData: any;
  onSave?: (data: any) => void;
  interval?: number; // in seconds
  enabled?: boolean;
}

export const useAutoSave = ({
  formType,
  formData,
  onSave,
  interval = 60,
  enabled = true
}: UseAutoSaveOptions) => {
  const { state, updateAutoSaveData } = useApp();
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>('');

  // Check for changes
  useEffect(() => {
    const currentDataString = JSON.stringify(formData);
    const hasChanges = currentDataString !== lastDataRef.current && lastDataRef.current !== '';
    
    setHasUnsavedChanges(hasChanges);
    
    if (lastDataRef.current === '') {
      lastDataRef.current = currentDataString;
    }
  }, [formData]);

  // Auto-save function
  const performAutoSave = async () => {
    if (!enabled || !hasUnsavedChanges || !state.currentUser) return;

    setIsSaving(true);
    
    try {
      const autoSaveData = {
        id: `${formType}_${state.currentUser.id}_${Date.now()}`,
        formType,
        formData,
        timestamp: new Date().toISOString(),
        userId: state.currentUser.id
      };

      // Save to context
      updateAutoSaveData(autoSaveData);
      
      // Call custom save function if provided
      if (onSave) {
        await onSave(formData);
      }

      setLastSaved(new Date().toISOString());
      setHasUnsavedChanges(false);
      lastDataRef.current = JSON.stringify(formData);
      
      console.log(`Auto-saved ${formType} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(performAutoSave, interval * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, hasUnsavedChanges, formData]);

  // Manual save function
  const saveNow = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    await performAutoSave();
    
    if (enabled) {
      intervalRef.current = setInterval(performAutoSave, interval * 1000);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    saveNow,
    performAutoSave
  };
};