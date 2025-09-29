import React, { useState } from 'react';
import { Mic } from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);

  const startVoiceInput = async () => {
    try {
      setIsListening(true);
      const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const syntheticEvent = {
          target: { value: transcript }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      };

      recognition.onerror = (event) => {
        if (event.error === 'aborted') {
          console.warn('Speech recognition aborted');
        } else {
          console.error('Speech recognition error:', event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Speech recognition not supported:', error);
      setIsListening(false);
    }
  };

  const baseInputClasses = `w-full px-4 py-3 pr-12 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none`;

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
        {label} {required && <span className="text-error-light dark:text-error-dark">*</span>}
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
            rows={4}
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
        <motion.button
          type="button"
          onClick={startVoiceInput}
          whileTap={{ scale: 0.95 }}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
            isListening
              ? 'text-primary-500 bg-primary-100 dark:bg-primary-500/20'
              : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label="Use voice input"
        >
          <Mic size={18} className={isListening ? 'animate-pulse' : ''} />
        </motion.button>
      </div>
    </div>
  );
};

export default InputWithVoice;