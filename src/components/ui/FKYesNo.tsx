import React from 'react';
import { cn } from '../../lib/utils';

interface FKYesNoProps {
  id: string;
  value: boolean | undefined | null;
  onChange: (value: boolean) => void;
  hasError?: boolean;
  validationError?: string;
  mainLanguage: string; // The question text in the main language (e.g., German)
  selectedLanguage?: string; // The question text in the selected secondary language
  className?: string;
  mandatory?: boolean;
}

const FKYesNo: React.FC<FKYesNoProps> = ({
  id,
  value,
  onChange,
  hasError,
  validationError,
  mainLanguage,
  selectedLanguage,
  className,
  mandatory = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value === 'yes');
  };

  return (
    <div className={cn('space-y-1', className)}>
      {/* Labels - Stacked Vertically */}
      <div className="mb-1">
        <div className="block font-medium text-sm text-neutral-900">
          {mainLanguage}
          {mandatory && <span className="text-red-500 ml-1">*</span>}
        </div>
        {selectedLanguage && (
          <div className="block text-neutral-500 text-sm">
            {selectedLanguage}
          </div>
        )}
      </div>

      {/* Radio Buttons */}
      <div className="flex items-center space-x-4 pt-1">
        {/* Yes Option */}
        <label htmlFor={`${id}-yes`} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            id={`${id}-yes`}
            name={id}
            value="yes"
            checked={value === true}
            onChange={handleChange}
            className={cn(
              'form-radio h-4 w-4 text-primary-600 focus:ring-primary-500',
              hasError ? 'border-red-500 ring-red-500' : 'border-gray-300'
            )}
          />
          <span className="text-sm text-neutral-700">Yes</span> {/* Add localization later */}
        </label>

        {/* No Option */}
        <label htmlFor={`${id}-no`} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            id={`${id}-no`}
            name={id}
            value="no"
            checked={value === false}
            onChange={handleChange}
            className={cn(
              'form-radio h-4 w-4 text-primary-600 focus:ring-primary-500',
              hasError ? 'border-red-500 ring-red-500' : 'border-gray-300'
            )}
          />
          <span className="text-sm text-neutral-700">No</span> {/* Add localization later */}
        </label>
      </div>

      {/* Validation Error Message */}
      {hasError && validationError && (
        <p className="text-red-500 text-xs mt-1">{validationError}</p>
      )}
    </div>
  );
};

export default FKYesNo; 