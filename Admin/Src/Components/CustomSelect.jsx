import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

export default function CustomSelect({ 
  name, 
  value, 
  onChange, 
  options, 
  placeholder = 'Select Option',
  required = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close DropDown When Clicking Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`custom-select ${isOpen ? 'open' : ''}`} ref={selectRef}>
      <div 
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={selectedOption ? 'has-value' : 'placeholder'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className="arrow" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </div>
      
      {isOpen && (
        <div className="custom-select-options">
          {placeholder && (
            <div 
              className={`custom-select-option disabled`}
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </div>
          )}
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      
      {/* Hidden Input For Form Validation */}
      <input 
        type="hidden" 
        name={name} 
        value={value || ''} 
        required={required}
      />
    </div>
  );
}