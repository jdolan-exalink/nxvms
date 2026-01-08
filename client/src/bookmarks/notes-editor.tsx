import React, { useState, useEffect } from 'react';
import { Save, X, Trash2, RotateCcw } from 'lucide-react';

export interface NotesEditorProps {
  initialNotes?: string;
  maxLength?: number;
  onSave?: (notes: string) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => Promise<void>;
  readOnly?: boolean;
  placeholder?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  initialNotes = '',
  maxLength = 500,
  onSave,
  onCancel,
  onDelete,
  readOnly = false,
  placeholder = 'Add notes...',
  autoSave = false,
  autoSaveDelay = 3000,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [originalNotes, setOriginalNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string>('');

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !isDirty || readOnly) return;

    const timeout = setTimeout(async () => {
      await handleSave();
    }, autoSaveDelay);

    return () => clearTimeout(timeout);
  }, [notes, autoSave, isDirty, autoSaveDelay, readOnly]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    if (newNotes.length <= maxLength) {
      setNotes(newNotes);
      setIsDirty(newNotes !== originalNotes);
      setSaveStatus('idle');
      setSaveError('');
    }
  };

  const handleSave = async () => {
    if (!onSave || !isDirty || isSaving) return;

    setIsSaving(true);
    setSaveStatus('saving');
    setSaveError('');

    try {
      await onSave(notes);
      setOriginalNotes(notes);
      setIsDirty(false);
      setSaveStatus('saved');
      
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setSaveError(
        error instanceof Error ? error.message : 'Failed to save notes'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNotes(originalNotes);
    setIsDirty(false);
    setSaveStatus('idle');
    setSaveError('');
    onCancel?.();
  };

  const handleReset = () => {
    if (confirm('Reset notes to original?')) {
      setNotes(originalNotes);
      setIsDirty(false);
      setSaveStatus('idle');
      setSaveError('');
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (confirm('Delete these notes?')) {
      try {
        setIsSaving(true);
        await onDelete();
        setNotes('');
        setOriginalNotes('');
        setIsDirty(false);
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : 'Failed to delete notes'
        );
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="w-full space-y-3 bg-dark-800 rounded-lg border border-dark-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Notes</h3>
        {!readOnly && originalNotes && (
          <span className="text-xs text-dark-400">
            Last edited: {new Date(originalNotes).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder={placeholder}
        disabled={readOnly || isSaving}
        className="w-full h-32 bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 disabled:opacity-50 resize-none"
      />

      {/* Character count */}
      <div className="flex justify-between items-center text-xs text-dark-400">
        <span>{notes.length} / {maxLength}</span>
        {notes.length > maxLength * 0.9 && (
          <span className="text-yellow-500">
            {maxLength - notes.length} characters remaining
          </span>
        )}
      </div>

      {/* Error message */}
      {saveError && (
        <div className="p-2 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-300">
          {saveError}
        </div>
      )}

      {/* Save status */}
      {saveStatus === 'saved' && (
        <div className="p-2 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-300">
          Notes saved successfully
        </div>
      )}

      {/* Action buttons */}
      {!readOnly && (
        <div className="flex gap-2 pt-2 border-t border-dark-700">
          {onSave && (
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 disabled:cursor-not-allowed text-white rounded font-medium transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}

          {isDirty && onCancel && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded font-medium transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}

          {isDirty && originalNotes && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded font-medium transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}

          {onDelete && originalNotes && (
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-400 hover:text-red-300 rounded font-medium transition-colors text-sm ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* Read-only mode message */}
      {readOnly && (
        <div className="text-xs text-dark-400 text-center py-2">
          Read-only mode
        </div>
      )}
    </div>
  );
};
