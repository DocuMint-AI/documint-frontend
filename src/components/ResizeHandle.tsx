import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Box, useTheme, alpha } from '@mui/material';
import { GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResizeHandleProps {
  onResize: (deltaX: number, startX: number, currentX: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function ResizeHandle({
  onResize,
  onResizeStart,
  onResizeEnd,
  disabled = false,
  orientation = 'vertical',
  className,
}: ResizeHandleProps) {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const startPositionRef = useRef({ x: 0, y: 0 });
  const handleRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    startPositionRef.current = { x: e.clientX, y: e.clientY };
    
    onResizeStart?.();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      
      const deltaX = moveEvent.clientX - startPositionRef.current.x;
      const deltaY = moveEvent.clientY - startPositionRef.current.y;
      
      if (orientation === 'vertical') {
        onResize(deltaX, startPositionRef.current.x, moveEvent.clientX);
      } else {
        onResize(deltaY, startPositionRef.current.y, moveEvent.clientY);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      onResizeEnd?.();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectstart', preventSelection);
    };
    
    const preventSelection = (e: Event) => e.preventDefault();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectstart', preventSelection);
  }, [disabled, onResize, onResizeStart, onResizeEnd, orientation]);

  // Touch support for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    setIsDragging(true);
    startPositionRef.current = { x: touch.clientX, y: touch.clientY };
    
    onResizeStart?.();
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      
      const touch = moveEvent.touches[0];
      const deltaX = touch.clientX - startPositionRef.current.x;
      const deltaY = touch.clientY - startPositionRef.current.y;
      
      if (orientation === 'vertical') {
        onResize(deltaX, startPositionRef.current.x, touch.clientX);
      } else {
        onResize(deltaY, startPositionRef.current.y, touch.clientY);
      }
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
      onResizeEnd?.();
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [disabled, onResize, onResizeStart, onResizeEnd, orientation]);

  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    
    const step = e.shiftKey ? 50 : 10;
    let deltaX = 0;
    let deltaY = 0;
    
    switch (e.key) {
      case 'ArrowLeft':
        if (orientation === 'vertical') deltaX = -step;
        break;
      case 'ArrowRight':
        if (orientation === 'vertical') deltaX = step;
        break;
      case 'ArrowUp':
        if (orientation === 'horizontal') deltaY = -step;
        break;
      case 'ArrowDown':
        if (orientation === 'horizontal') deltaY = step;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    
    if (orientation === 'vertical') {
      onResize(deltaX, 0, deltaX);
    } else {
      onResize(deltaY, 0, deltaY);
    }
  }, [disabled, onResize, orientation]);

  useEffect(() => {
    // Update cursor for the entire document when dragging
    if (isDragging) {
      document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, orientation]);

  const isVertical = orientation === 'vertical';
  
  return (
    <Box
      ref={handleRef}
      className={className}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: isVertical ? 16 : '100%',
        height: isVertical ? '100%' : 16,
        cursor: disabled ? 'default' : (isVertical ? 'col-resize' : 'row-resize'),
        zIndex: 10,
        userSelect: 'none',
        touchAction: 'none',
        '&:focus': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="separator"
      aria-orientation={orientation}
      aria-label={`Resize ${orientation === 'vertical' ? 'columns' : 'rows'}`}
    >
      {/* Invisible interaction area */}
      <Box
        sx={{
          position: 'absolute',
          width: isVertical ? 20 : '100%',
          height: isVertical ? '100%' : 20,
          left: isVertical ? -10 : 0,
          top: isVertical ? 0 : -10,
          zIndex: 1,
        }}
      />
      
      {/* Visual divider line */}
      <motion.div
        style={{
          position: 'absolute',
          backgroundColor: alpha(theme.palette.divider, isDragging ? 0.8 : 0.4),
          width: isVertical ? 1 : '100%',
          height: isVertical ? '100%' : 1,
          zIndex: 2,
        }}
        animate={{
          backgroundColor: alpha(
            theme.palette.divider, 
            isDragging ? 0.8 : (isHovered ? 0.6 : 0.4)
          ),
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Drag handle */}
      <AnimatePresence>
        {(isHovered || isDragging) && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isVertical ? 20 : 40,
                height: isVertical ? 40 : 20,
                borderRadius: 2,
                backgroundColor: isDragging 
                  ? theme.palette.primary.main
                  : alpha(theme.palette.primary.main, 0.8),
                color: theme.palette.primary.contrastText,
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                transform: isDragging ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <GripVertical 
                size={12} 
                style={{ 
                  transform: isVertical ? 'rotate(0deg)' : 'rotate(90deg)',
                }}
              />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Active drag indicator */}
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        />
      )}
    </Box>
  );
}

export default ResizeHandle;