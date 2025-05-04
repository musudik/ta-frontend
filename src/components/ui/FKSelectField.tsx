import React from 'react';
import { cn } from '../../lib/utils';

interface SelectOption {
  value: string;
  mainLabel: string;  // Label in main language (e.g., German)
  selectedLabel: string;  // Label in selected language
}

interface FKSelectFieldProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  hasError?: boolean;
  validationError?: string;
  mainLanguage: string;
  selectedLanguage: string;
  className?: string;
  mandatory?: boolean;
  placeholder?: {
    mainLabel: string;
    selectedLabel: string;
  };
}

const FKSelectField = ({
  id,
  value,
  onChange,
  options,
  hasError,
  validationError,
  mainLanguage,
  selectedLanguage,
  className,
  mandatory = false,
  placeholder
}: FKSelectFieldProps) => {
  return (
    <div className={cn('space-y-1', className)}>
      {/* Label Section */}
      <div className="mb-1">
        <label htmlFor={id} className="block font-medium text-sm text-neutral-900">
          {mainLanguage}
          {mandatory && <span className="text-red-500 ml-1">*</span>}
        </label>
        {selectedLanguage && (
          <label htmlFor={id} className="block text-neutral-500 text-sm">
            {selectedLanguage}
          </label>
        )}
      </div>

      {/* Select Input */}
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={cn(
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm',
          hasError ? 'border-red-500' : 'border-gray-300',
          !value && 'text-neutral-500'  // Placeholder styling
        )}
      >
        {/* Placeholder Option */}
        {placeholder && (
          <option value="" className="text-neutral-500">
            {placeholder.mainLabel} / {placeholder.selectedLabel}
          </option>
        )}

        {/* Options with dual language support */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.mainLabel} / {option.selectedLabel}
          </option>
        ))}
      </select>

      {/* Validation Error Message */}
      {hasError && validationError && (
        <p className="text-red-500 text-xs mt-1">{validationError}</p>
      )}
    </div>
  );
};

export default FKSelectField; 