import React from 'react';
import { motion } from 'framer-motion';

interface InputWithVoiceProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  step?: string;
  min?: string;
  multiline?: boolean;
  required?: boolean;
}

const InputWithVoice: React.FC<InputWithVoiceProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
  min,
  multiline = false,
  required = false,
}) => {
  const baseInputClasses = `w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none`;

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={baseInputClasses}
            rows={3}
          />
        ) : (
          <input
            id={id}
            type={type}
            step={step}
            min={min}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={baseInputClasses}
          />
        )}
      </div>
    </div>
  );
};

export default InputWithVoice;