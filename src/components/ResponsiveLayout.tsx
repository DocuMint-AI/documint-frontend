import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { usePanelContext } from '../context/PanelContext';
import { DocumentPanel } from './panels/DocumentPanel';
import { InsightsPanel } from './panels/InsightsPanel';
import { QAPanel } from './panels/QAPanel';
import ResizeHandle from './ResizeHandle';
import MinimizedPanelBar from './MinimizedPanelBar';

interface ResponsiveLayoutProps {
  className?: string;
}

export function ResponsiveLayout({ className }: ResponsiveLayoutProps) {
  const theme = useTheme();
  const {
    panelStates,
    expandedPanel,
    minimizedPanels,
    getVisiblePanels,
    getNormalizedWidths,
    togglePanelExpand,
    minimizePanel,
    restorePanel,
    updatePanelWidths,
    isResponsiveMode,
  } = usePanelContext();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const visiblePanels = getVisiblePanels();
  const normalizedWidths = getNormalizedWidths();

  // Handle resize for desktop mode
  const handleResize = (panelIndex: number, deltaX: number, startX: number, currentX: number) => {
    if (isMobile || expandedPanel) return;


    let containerWidth = 1200; // Fallback default
    if (typeof window !== 'undefined') {
      containerWidth = window.innerWidth - 64; // Account for padding
    }
    const relativeX = currentX - 32; // Account for left padding
    const percentage = (relativeX / containerWidth) * 100;

    if (panelIndex === 0 && visiblePanels.length >= 2) {
      // Resizing between document and insights
      const constrainedPercentage = Math.max(20, Math.min(60, percentage));
      const remainingPercentage = 100 - constrainedPercentage;
      
      if (visiblePanels.length === 2) {
        updatePanelWidths({
          [visiblePanels[0].id]: constrainedPercentage,
          [visiblePanels[1].id]: remainingPercentage,
        });
      } else if (visiblePanels.length === 3) {
        const thirdPanelWidth = normalizedWidths[visiblePanels[2].id];
        updatePanelWidths({
          [visiblePanels[0].id]: constrainedPercentage,
          [visiblePanels[1].id]: remainingPercentage - thirdPanelWidth,
        });
      }
    } else if (panelIndex === 1 && visiblePanels.length === 3) {
      // Resizing between insights and qa
      const firstPanelWidth = normalizedWidths[visiblePanels[0].id];
      const constrainedPercentage = Math.max(firstPanelWidth + 20, Math.min(80, percentage));
      const secondPanelWidth = constrainedPercentage - firstPanelWidth;
      const thirdPanelWidth = 100 - constrainedPercentage;
      
      updatePanelWidths({
        [visiblePanels[1].id]: secondPanelWidth,
        [visiblePanels[2].id]: thirdPanelWidth,
      });
    }
  };

  const renderPanel = (panelConfig: any, index: number) => {
    const { id } = panelConfig;
    const state = panelStates[id as keyof typeof panelStates];
    const isExpanded = expandedPanel === id;
    const isMinimized = state === 'minimized';

    const panelProps = {
      panelId: id,
      expanded: isExpanded,
      minimized: isMinimized,
      onExpand: () => togglePanelExpand(id),
      onMinimize: () => minimizePanel(id),
      onRestore: () => restorePanel(id),
    };

    switch (id) {
      case 'document':
        return <DocumentPanel key={id} {...panelProps} />;
      case 'insights':
        return <InsightsPanel key={id} {...panelProps} />;
      case 'qa':
        return <QAPanel key={id} {...panelProps} />;
      default:
        return null;
    }
  };

  if (isMobile) {
    // Mobile: Stack panels vertically, show one at a time
    return (
      <Box 
        className={className}
        sx={{ 
          height: '100%', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexGrow: 1, p: 1 }}>
          <AnimatePresence mode="wait">
            {expandedPanel ? (
              <motion.div
                key={expandedPanel}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                {renderPanel(visiblePanels.find(p => p.id === expandedPanel), 0)}
              </motion.div>
            ) : (
              <motion.div
                key="mobile-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateRows: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 2,
                    height: '100%',
                    overflow: 'auto',
                  }}
                >
                  {visiblePanels.map((panel, index) => (
                    <motion.div
                      key={panel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      style={{ minHeight: '250px' }}
                    >
                      {renderPanel(panel, index)}
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
        <MinimizedPanelBar />
      </Box>
    );
  }

  if (isTablet && !expandedPanel) {
    // Tablet: Show 2 panels side by side, stack third panel below
    const [firstPanel, secondPanel, thirdPanel] = visiblePanels;
    
    return (
      <Box 
        className={className}
        sx={{ 
          height: '100%', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexGrow: 1, p: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: thirdPanel ? '1fr 1fr' : '1fr',
              gridTemplateRows: thirdPanel ? '1fr auto' : '1fr',
              gap: 2,
              height: '100%',
            }}
          >
            {/* First row: two panels side by side */}
            {firstPanel && (
              <motion.div
                key={firstPanel.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ minHeight: 0 }}
              >
                {renderPanel(firstPanel, 0)}
              </motion.div>
            )}
            
            {secondPanel && (
              <motion.div
                key={secondPanel.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={{ minHeight: 0 }}
              >
                {renderPanel(secondPanel, 1)}
              </motion.div>
            )}
            
            {/* Second row: third panel full width */}
            {thirdPanel && (
              <motion.div
                key={thirdPanel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                style={{ 
                  gridColumn: '1 / -1',
                  maxHeight: '300px',
                  minHeight: '250px',
                }}
              >
                {renderPanel(thirdPanel, 2)}
              </motion.div>
            )}
          </Box>
        </Box>
        <MinimizedPanelBar />
      </Box>
    );
  }

  // Desktop: Show panels horizontally with resizable dividers
  return (
    <Box 
      className={className}
      sx={{ 
        height: '100%', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <AnimatePresence mode="wait">
          {expandedPanel ? (
            <motion.div
              key={expandedPanel}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ height: '100%' }}
            >
              {renderPanel(visiblePanels.find(p => p.id === expandedPanel), 0)}
            </motion.div>
          ) : (
            <motion.div
              key="desktop-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                height: '100%',
                gap: 0,
              }}
            >
              {visiblePanels.map((panel, index) => (
                <React.Fragment key={panel.id}>
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    style={{
                      width: `${normalizedWidths[panel.id]}%`,
                      minWidth: `${panel.minWidth}px`,
                      maxWidth: visiblePanels.length === 1 ? '100%' : '70%',
                      height: '100%',
                      transition: 'width 0.3s ease',
                    }}
                  >
                    {renderPanel(panel, index)}
                  </motion.div>
                  
                  {/* Resize handle between panels */}
                  {index < visiblePanels.length - 1 && (
                    <ResizeHandle
                      key={`resize-${index}`}
                      onResize={(deltaX, startX, currentX) => handleResize(index, deltaX, startX, currentX)}
                      orientation="vertical"
                    />
                  )}
                </React.Fragment>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
      
      {/* Minimized panels bar */}
      <MinimizedPanelBar />
    </Box>
  );
}

export default ResponsiveLayout;