'use client';

import React, { useState, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizableDividerProps {
  onResize: (clientX: number) => void;
}

const ResizableDivider: React.FC<ResizableDividerProps> = ({ onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
    
    const handleMouseMove = (e: MouseEvent) => {
      onResize(e.clientX);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onResize]);
  
  return (
    <div className="relative w-0 h-full flex items-center justify-center">
      {/* Invisible click area */}
      <div
        className="absolute w-4 h-full cursor-col-resize z-10"
        onMouseDown={handleMouseDown}
        style={{ left: '-8px' }}
      />
      
      {/* Visual divider line */}
      <div className="absolute w-px h-full bg-gray-300 dark:bg-gray-600" style={{ left: '-0.5px' }} />
      
      {/* Drag handle */}
      <div
        className={`absolute w-6 h-8 flex items-center justify-center rounded cursor-col-resize transition-all duration-200 ${
          isDragging 
            ? 'bg-blue-500 shadow-md' 
            : 'bg-gray-300 hover:bg-blue-400 hover:shadow-sm dark:bg-gray-600 dark:hover:bg-blue-500'
        }`}
        style={{ left: '-12px' }}
        onMouseDown={handleMouseDown}
      >
        <GripVertical className={`w-3 h-3 ${isDragging ? 'text-white' : 'text-white'}`} />
      </div>
    </div>
  );
};

export default ResizableDivider;