/**
 * Simple Math CAPTCHA Component with Number-to-Image Conversion
 * Displays numbers as canvas-generated images to prevent bot recognition
 */

import React, { useState, useEffect, useRef } from 'react';

interface MathCaptchaProps {
  onVerify: (isValid: boolean, token?: string) => void;
  theme?: 'light' | 'dark';
  onExpire?: () => void;
  className?: string;
  preventReset?: boolean; // New prop to prevent reset when verified
}

interface MathProblem {
  question: string;
  answer: number;
  token: string;
  num1: number;
  num2: number;
  operation: string;
}

// Function to generate a number as an image
const generateNumberImage = (number: number, theme: 'light' | 'dark' = 'light'): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Canvas dimensions
  canvas.width = 60;
  canvas.height = 40;

  // Colors based on theme
  const backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
  const textColor = theme === 'dark' ? '#93c5fd' : '#2563eb';
  
  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add some noise/texture to make it harder for bots
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = theme === 'dark' ? 
      `rgba(${100 + Math.random() * 100}, ${100 + Math.random() * 100}, ${100 + Math.random() * 100}, 0.1)` :
      `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.1)`;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
  }

  // Set text properties with slight randomness
  const fontSize = 20 + Math.random() * 4;
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Add slight rotation to make it harder for bots
  const angle = (Math.random() - 0.5) * 0.3; // ±0.15 radians
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angle);
  
  // Draw the number
  ctx.fillText(number.toString(), 0, 0);
  ctx.restore();

  // Add subtle border
  ctx.strokeStyle = theme === 'dark' ? '#4b5563' : '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL();
};

// Function to generate operation symbol as image
const generateOperationImage = (operation: string, theme: 'light' | 'dark' = 'light'): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  canvas.width = 40;
  canvas.height = 40;

  const backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
  const textColor = theme === 'dark' ? '#fbbf24' : '#d97706';
  
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(operation, canvas.width / 2, canvas.height / 2);

  ctx.strokeStyle = theme === 'dark' ? '#4b5563' : '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL();
};

export const MathCaptcha: React.FC<MathCaptchaProps> = ({
  onVerify,
  theme = 'light',
  onExpire,
  className = '',
  preventReset = true // Default to preventing reset
}) => {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<{
    num1: string;
    operation: string;
    num2: string;
  } | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a random math problem
  const generateProblem = (): MathProblem => {
    const operations = [
      { symbol: '+', op: (a: number, b: number) => a + b },
      { symbol: '-', op: (a: number, b: number) => a - b },
      { symbol: '×', op: (a: number, b: number) => a * b }
    ];

    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    if (operation.symbol === '+') {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      answer = operation.op(num1, num2);
    } else if (operation.symbol === '-') {
      num1 = Math.floor(Math.random() * 30) + 10;
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
      answer = operation.op(num1, num2);
    } else { // multiplication
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = operation.op(num1, num2);
    }

    const question = `${num1} ${operation.symbol} ${num2} = ?`;
    const token = btoa(`${Date.now()}-${Math.random()}`);
    
    return { 
      question, 
      answer, 
      token, 
      num1, 
      num2, 
      operation: operation.symbol 
    };
  };

  // Generate images for the current problem
  const generateImages = (problem: MathProblem) => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const num1Image = generateNumberImage(problem.num1, theme);
      const operationImage = generateOperationImage(problem.operation, theme);
      const num2Image = generateNumberImage(problem.num2, theme);
      
      setImageUrls({
        num1: num1Image,
        operation: operationImage,
        num2: num2Image
      });
    }, 100);
  };

  // Initialize or refresh the problem
  const refreshProblem = () => {
    // Don't refresh if verified and preventReset is true
    if (isVerified && preventReset) {
      return;
    }
    
    const newProblem = generateProblem();
    setProblem(newProblem);
    setUserAnswer('');
    setIsVerified(false);
    setError('');
    setAttempts(0);
    setImageUrls(null);
    onVerify(false);
    
    // Generate new images
    generateImages(newProblem);
  };

  // Handle answer submission
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!problem) return;

    const answer = parseInt(userAnswer.trim());
    
    if (isNaN(answer)) {
      setError('Please enter a valid number');
      return;
    }

    if (answer === problem.answer) {
      setIsVerified(true);
      setError('');
      onVerify(true, problem.token);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setError('Too many incorrect attempts. Generating new problem...');
        setTimeout(refreshProblem, 2000);
      } else {
        setError(`Incorrect answer. ${3 - newAttempts} attempts remaining.`);
      }
      onVerify(false);
    }
  };

  // Handle input change with auto-check
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserAnswer(value);
    setError('');
    
    // Auto-check when user enters a complete number (after a brief pause)
    if (value.trim() && !isNaN(parseInt(value.trim())) && !isVerified) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        // Check if component is still mounted and not verified
        if (!isVerified && problem) {
          const answer = parseInt(value.trim());
          
          if (answer === problem.answer) {
            setIsVerified(true);
            setError('');
            onVerify(true, problem.token);
          }
        }
      }, 800); // Slightly longer delay for better UX
    }
  };

  // Initialize problem on mount
  useEffect(() => {
    refreshProblem();
  }, []);

  // Regenerate images when theme changes (but only if not verified)
  useEffect(() => {
    if (problem && !isVerified) {
      generateImages(problem);
    }
  }, [theme, problem, isVerified]);

  // Auto-expire after 5 minutes (but not if verified)
  useEffect(() => {
    if (problem && !isVerified) {
      const timer = setTimeout(() => {
        if (!isVerified) { // Double check verification status
          onExpire?.();
          refreshProblem();
        }
      }, 300000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [problem, isVerified, onExpire]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!problem) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`math-captcha ${theme} ${className}`}>
      <div className={`
        border-2 rounded-lg p-4 transition-all duration-200
        ${theme === 'dark' 
          ? 'bg-gray-800 border-gray-600 text-white' 
          : 'bg-white border-gray-300 text-gray-900'
        }
        ${isVerified 
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
          : error 
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
            : ''
        }
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">
            {isVerified ? '✅ Verified' : '🔢 Math Challenge'}
          </span>
          <button
            type="button"
            onClick={refreshProblem}
            disabled={isVerified}
            className={`
              text-xs px-2 py-1 rounded transition-colors
              ${theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200 disabled:text-gray-600'
                : 'text-gray-600 hover:text-gray-800 disabled:text-gray-400'
              }
              disabled:cursor-not-allowed
            `}
            title="Generate new problem"
          >
            🔄 New
          </button>
        </div>

        {/* Problem Display */}
        <div className="text-center mb-4">
          <div className={`
            flex items-center justify-center gap-2 p-3 rounded-lg
            ${theme === 'dark' 
              ? 'bg-gray-700' 
              : 'bg-gray-100'
            }
          `}>
            {imageUrls ? (
              <>
                <img 
                  src={imageUrls.num1} 
                  alt="First number"
                  className="inline-block border border-gray-300 dark:border-gray-600 rounded"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <img 
                  src={imageUrls.operation} 
                  alt="Operation"
                  className="inline-block border border-gray-300 dark:border-gray-600 rounded"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <img 
                  src={imageUrls.num2} 
                  alt="Second number"
                  className="inline-block border border-gray-300 dark:border-gray-600 rounded"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <span className={`text-2xl font-mono font-bold px-2 ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  = ?
                </span>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-[60px] h-[40px] bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                <div className="w-[40px] h-[40px] bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                <div className="w-[60px] h-[40px] bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                <span className={`text-2xl font-mono font-bold px-2 ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  = ?
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        {!isVerified && (
          <div className="space-y-3">
            <input
              type="number"
              value={userAnswer}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              placeholder="Your answer"
              className={`
                w-full px-3 py-2 border rounded-md text-center font-mono text-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
                ${error ? 'border-red-500' : ''}
              `}
              autoComplete="off"
            />
          </div>
        )}

        {/* Verified State */}
        {isVerified && (
          <div className={`text-center font-medium p-3 rounded-lg ${
            theme === 'dark' 
              ? 'bg-green-900/20 text-green-400 border border-green-800' 
              : 'bg-green-50 text-green-600 border border-green-200'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Correct! CAPTCHA verified</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Attempts Counter */}
        {attempts > 0 && !isVerified && !error.includes('Too many') && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Attempts: {attempts}/3
          </div>
        )}
      </div>
    </div>
  );
};

export default MathCaptcha;