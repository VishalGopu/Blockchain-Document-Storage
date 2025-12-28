import React, { useState, useRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_CONFIG } from '../config/recaptcha';

const EnhancedReCaptcha = ({ 
  onChange, 
  onExpired, 
  theme = RECAPTCHA_CONFIG.THEME,
  size = RECAPTCHA_CONFIG.SIZE,
  challengeType = RECAPTCHA_CONFIG.CHALLENGE_TYPES.TEXT,
  className = '',
  style = {} 
}) => {
  const [value, setValue] = useState(null);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef(null);

  const handleChange = (token) => {
    setValue(token);
    setExpired(false);
    setError('');
    if (onChange) onChange(token);
  };

  const handleExpired = () => {
    setValue(null);
    setExpired(true);
    setError('reCAPTCHA expired. Please verify again.');
    if (onExpired) onExpired();
  };

  const handleErrored = () => {
    setValue(null);
    setError('reCAPTCHA verification failed. Please try again.');
  };

  const reset = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
      setValue(null);
      setExpired(false);
      setError('');
    }
  };

  // Expose reset method to parent components
  useEffect(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.resetRecaptcha = reset;
    }
  }, []);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    ...style
  };

  const statusStyle = {
    fontSize: '12px',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    textAlign: 'center',
    minHeight: '20px'
  };

  const getStatusMessage = () => {
    if (error) {
      return {
        message: error,
        style: { 
          ...statusStyle, 
          color: '#991b1b', 
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5'
        }
      };
    }
    if (expired) {
      return {
        message: 'reCAPTCHA has expired. Please verify again.',
        style: { 
          ...statusStyle, 
          color: '#92400e', 
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24'
        }
      };
    }
    if (value) {
      return {
        message: '✓ Verification successful',
        style: { 
          ...statusStyle, 
          color: '#065f46', 
          backgroundColor: '#d1fae5',
          border: '1px solid #6ee7b7'
        }
      };
    }
    return {
      message: '',
      style: { ...statusStyle, visibility: 'hidden' }
    };
  };

  const status = getStatusMessage();

  return (
    <div className={className} style={containerStyle}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={RECAPTCHA_CONFIG.SITE_KEY_V2}
        onChange={handleChange}
        onExpired={handleExpired}
        onErrored={handleErrored}
        theme={theme}
        size={size}
        // Note: Google reCAPTCHA automatically determines challenge type based on user behavior
        // Text vs Image challenges are decided by Google's algorithms
      />
      
      <div style={status.style}>
        {status.message}
      </div>

      {challengeType === RECAPTCHA_CONFIG.CHALLENGE_TYPES.IMAGE && (
        <div style={{ 
          fontSize: '11px', 
          color: '#6b7280', 
          textAlign: 'center',
          marginTop: '0.25rem'
        }}>
          Tip: Image challenges may appear for enhanced security
        </div>
      )}
    </div>
  );
};

// Hook for using reCAPTCHA in forms
export const useRecaptcha = () => {
  const [value, setValue] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const recaptchaRef = useRef(null);

  const handleChange = (token) => {
    setValue(token);
    setIsValid(!!token);
  };

  const handleExpired = () => {
    setValue(null);
    setIsValid(false);
  };

  const reset = () => {
    if (recaptchaRef.current && recaptchaRef.current.resetRecaptcha) {
      recaptchaRef.current.resetRecaptcha();
    }
    setValue(null);
    setIsValid(false);
  };

  return {
    value,
    isValid,
    recaptchaRef,
    handleChange,
    handleExpired,
    reset
  };
};

export default EnhancedReCaptcha;