'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Extend HTMLElement interface for cap-widget
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'cap-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'data-cap-api-endpoint'?: string;
        'data-cap-hidden-field-name'?: string;
        'data-cap-theme'?: string;
      };
    }
  }
}

interface CapWidgetProps {
  onSolve?: (token: string) => void;
  onError?: (error: string) => void;
  onLoad?: () => void;
  apiEndpoint?: string;
  theme?: 'light' | 'dark';
  className?: string;
  hiddenFieldName?: string;
}

export interface CapWidgetRef {
  reset: () => void;
  solve: () => void;
}

const CapWidget = forwardRef<CapWidgetRef, CapWidgetProps>(({
  onSolve,
  onError,
  onLoad,
  apiEndpoint = 'http://localhost:8001', // Default local CAP server
  theme = 'light',
  className = '',
  hiddenFieldName = 'cap-token'
}, ref) => {
  const widgetRef = useRef<HTMLElement>(null);
  const scriptLoadedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetRef.current && 'reset' in widgetRef.current) {
        (widgetRef.current as any).reset();
      }
    },
    solve: () => {
      if (widgetRef.current && 'solve' in widgetRef.current) {
        (widgetRef.current as any).solve();
      }
    }
  }));

  useEffect(() => {
    const loadCapScript = () => {
      if (scriptLoadedRef.current) return Promise.resolve();

      return new Promise<void>((resolve, reject) => {
        // Check if script is already loaded
        if (window.customElements && window.customElements.get('cap-widget')) {
          scriptLoadedRef.current = true;
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@cap.js/widget@0.1.28';
        script.async = true;
        script.onload = () => {
          scriptLoadedRef.current = true;
          resolve();
        };
        script.onerror = () => {
          reject(new Error('Failed to load CAP widget script'));
        };
        document.head.appendChild(script);
      });
    };

    const initializeWidget = async () => {
      try {
        await loadCapScript();

        if (widgetRef.current) {
          // Set up event listeners
          const widget = widgetRef.current;

          const handleSolve = (event: CustomEvent) => {
            const token = event.detail.token;
            if (onSolve) {
              onSolve(token);
            }
          };

          const handleError = (event: CustomEvent) => {
            const error = event.detail.error || 'CAP widget error';
            if (onError) {
              onError(error);
            }
          };

          const handleLoad = () => {
            if (onLoad) {
              onLoad();
            }
          };

          widget.addEventListener('solve', handleSolve as EventListener);
          widget.addEventListener('error', handleError as EventListener);
          widget.addEventListener('load', handleLoad);

          // Set attributes
          widget.setAttribute('data-cap-api-endpoint', apiEndpoint);
          widget.setAttribute('data-cap-hidden-field-name', hiddenFieldName);
          widget.setAttribute('data-cap-theme', theme);

          // Cleanup function
          return () => {
            widget.removeEventListener('solve', handleSolve as EventListener);
            widget.removeEventListener('error', handleError as EventListener);
            widget.removeEventListener('load', handleLoad);
          };
        }
      } catch (error) {
        console.error('Failed to initialize CAP widget:', error);
        if (onError) {
          onError('Failed to initialize CAP widget');
        }
      }
    };

    let cleanup: (() => void) | undefined;
    
    initializeWidget().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [apiEndpoint, theme, onSolve, onError, onLoad, hiddenFieldName]);

  return (
    <div className={`cap-widget-container ${className}`}>
      <cap-widget
        ref={widgetRef}
        data-cap-api-endpoint={apiEndpoint}
        data-cap-hidden-field-name={hiddenFieldName}
        data-cap-theme={theme}
      />
    </div>
  );
});

CapWidget.displayName = 'CapWidget';

export default CapWidget;