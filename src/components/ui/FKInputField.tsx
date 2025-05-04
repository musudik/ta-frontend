import React from 'react';
import { cn } from '../../lib/utils';

interface FKInputFieldProps {
  id: string;
  type?: string;
  min?: number;
  step?: number;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
  validationError?: string;
  mainLanguage: string;
  selectedLanguage: string;
  className?: string;
  mandatory?: boolean;
  readOnly?: boolean;
}

const FKInputField = ({
  id,
  type = 'text',
  min,
  step,
  value,
  onChange,
  hasError,
  validationError,
  mainLanguage,
  selectedLanguage,
  className,
  mandatory = false,
  readOnly = false
}: FKInputFieldProps) => {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="mb-1">
        <label htmlFor={id} className="block font-medium text-sm text-neutral-900">
          {mainLanguage}
          {mandatory && !readOnly && <span className="text-red-500 ml-1">*</span>}
        </label>
        {selectedLanguage && (
          <label htmlFor={id} className="block text-neutral-500 text-sm">
            {selectedLanguage}
          </label>
        )}
      </div>
      <input
        id={id}
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={!readOnly ? onChange : undefined}
        readOnly={readOnly}
        className={cn(
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm',
          hasError ? 'border-red-500' : 'border-gray-300',
          readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
        )}
      />
      {hasError && validationError && (
        <p className="text-red-500 text-xs mt-1">{validationError}</p>
      )}
    </div>
  );
};

export default FKInputField;
