import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type PanelId = 'document' | 'insights' | 'qa';
export type PanelState = 'normal' | 'expanded' | 'minimized';

export interface PanelConfig {
  id: PanelId;
  title: string;
  icon: string;
  minWidth: number;
  defaultWidth: number;
  canMinimize: boolean;
  canExpand: boolean;
}

export interface PanelWidths {
  document: number;
  insights: number;
  qa: number;
}

export interface PanelStates {
  document: PanelState;
  insights: PanelState;
  qa: PanelState;
}

interface PanelContextValue {
  // Panel configurations
  panels: PanelConfig[];
  
  // Current state
  panelStates: PanelStates;
  panelWidths: PanelWidths;
  expandedPanel: PanelId | null;
  minimizedPanels: PanelId[];
  
  // Actions
  expandPanel: (panelId: PanelId) => void;
  minimizePanel: (panelId: PanelId) => void;
  restorePanel: (panelId: PanelId) => void;
  restoreAllPanels: () => void;
  togglePanelExpand: (panelId: PanelId) => void;
  
  // Resizing
  updatePanelWidth: (panelId: PanelId, width: number) => void;
  updatePanelWidths: (widths: Partial<PanelWidths>) => void;
  resetPanelWidths: () => void;
  
  // Responsive helpers
  isResponsiveMode: boolean;
  setResponsiveMode: (responsive: boolean) => void;
  
  // Layout helpers
  getVisiblePanels: () => PanelConfig[];
  getMinimizedPanels: () => PanelConfig[];
  getNormalizedWidths: () => PanelWidths;
}

const PanelContext = createContext<PanelContextValue | undefined>(undefined);

const DEFAULT_PANELS: PanelConfig[] = [
  {
    id: 'document',
    title: 'Document',
    icon: 'FileText',
    minWidth: 250,
    defaultWidth: 33.33,
    canMinimize: true,
    canExpand: true,
  },
  {
    id: 'insights',
    title: 'AI Insights',
    icon: 'Brain',
    minWidth: 280,
    defaultWidth: 33.33,
    canMinimize: true,
    canExpand: true,
  },
  {
    id: 'qa',
    title: 'Q&A Assistant',
    icon: 'MessageCircle',
    minWidth: 300,
    defaultWidth: 33.34,
    canMinimize: true,
    canExpand: true,
  },
];

const DEFAULT_PANEL_WIDTHS: PanelWidths = {
  document: 33.33,
  insights: 33.33,
  qa: 33.34,
};

const DEFAULT_PANEL_STATES: PanelStates = {
  document: 'normal',
  insights: 'normal',
  qa: 'normal',
};

interface PanelProviderProps {
  children: ReactNode;
}

export function PanelProvider({ children }: PanelProviderProps) {
  const [panelStates, setPanelStates] = useState<PanelStates>(DEFAULT_PANEL_STATES);
  const [panelWidths, setPanelWidths] = useState<PanelWidths>(DEFAULT_PANEL_WIDTHS);
  const [isResponsiveMode, setResponsiveMode] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedStates = localStorage.getItem('documint:panel-states');
      const savedWidths = localStorage.getItem('documint:panel-widths');
      
      if (savedStates) {
        const parsed = JSON.parse(savedStates) as PanelStates;
        setPanelStates(parsed);
      }
      
      if (savedWidths) {
        const parsed = JSON.parse(savedWidths) as PanelWidths;
        setPanelWidths(parsed);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('documint:panel-states', JSON.stringify(panelStates));
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [panelStates]);

  useEffect(() => {
    try {
      localStorage.setItem('documint:panel-widths', JSON.stringify(panelWidths));
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [panelWidths]);

  // Detect responsive breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setResponsiveMode(window.innerWidth < 1024); // lg breakpoint
      }
    };
    if (typeof window !== 'undefined') {
      handleResize(); // Initial check
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
    // On server, do nothing
    return () => {};
  }, []);

  // Computed values
  const expandedPanel = Object.entries(panelStates).find(([_, state]) => state === 'expanded')?.[0] as PanelId | null;
  const minimizedPanels = Object.entries(panelStates)
    .filter(([_, state]) => state === 'minimized')
    .map(([id]) => id as PanelId);

  // Actions
  const expandPanel = useCallback((panelId: PanelId) => {
    setPanelStates(prev => {
      const newStates = { ...prev };
      
      // Collapse all other panels and expand the target
      Object.keys(newStates).forEach(id => {
        if (id === panelId) {
          newStates[id as PanelId] = 'expanded';
        } else {
          newStates[id as PanelId] = 'normal';
        }
      });
      
      return newStates;
    });
  }, []);

  const minimizePanel = useCallback((panelId: PanelId) => {
    setPanelStates(prev => ({
      ...prev,
      [panelId]: 'minimized',
    }));
  }, []);

  const restorePanel = useCallback((panelId: PanelId) => {
    setPanelStates(prev => ({
      ...prev,
      [panelId]: 'normal',
    }));
  }, []);

  const restoreAllPanels = useCallback(() => {
    setPanelStates(DEFAULT_PANEL_STATES);
  }, []);

  const togglePanelExpand = useCallback((panelId: PanelId) => {
    setPanelStates(prev => {
      if (prev[panelId] === 'expanded') {
        // Collapse back to normal view
        return { ...DEFAULT_PANEL_STATES };
      } else {
        // Expand this panel
        const newStates = { ...prev };
        Object.keys(newStates).forEach(id => {
          if (id === panelId) {
            newStates[id as PanelId] = 'expanded';
          } else {
            newStates[id as PanelId] = 'normal';
          }
        });
        return newStates;
      }
    });
  }, []);

  const updatePanelWidth = useCallback((panelId: PanelId, width: number) => {
    setPanelWidths(prev => ({
      ...prev,
      [panelId]: Math.max(15, Math.min(70, width)), // Constrain between 15% and 70%
    }));
  }, []);

  const updatePanelWidths = useCallback((widths: Partial<PanelWidths>) => {
    setPanelWidths(prev => ({ ...prev, ...widths }));
  }, []);

  const resetPanelWidths = useCallback(() => {
    setPanelWidths(DEFAULT_PANEL_WIDTHS);
  }, []);

  // Helper functions
  const getVisiblePanels = useCallback((): PanelConfig[] => {
    if (expandedPanel) {
      return DEFAULT_PANELS.filter(panel => panel.id === expandedPanel);
    }
    return DEFAULT_PANELS.filter(panel => panelStates[panel.id] !== 'minimized');
  }, [expandedPanel, panelStates]);

  const getMinimizedPanels = useCallback((): PanelConfig[] => {
    return DEFAULT_PANELS.filter(panel => panelStates[panel.id] === 'minimized');
  }, [panelStates]);

  const getNormalizedWidths = useCallback((): PanelWidths => {
    const visiblePanels = getVisiblePanels();
    
    if (expandedPanel) {
      // When expanded, give full width to expanded panel
      return {
        document: expandedPanel === 'document' ? 100 : 0,
        insights: expandedPanel === 'insights' ? 100 : 0,
        qa: expandedPanel === 'qa' ? 100 : 0,
      };
    }
    
    if (visiblePanels.length === 1) {
      const singlePanel = visiblePanels[0];
      return {
        document: singlePanel.id === 'document' ? 100 : 0,
        insights: singlePanel.id === 'insights' ? 100 : 0,
        qa: singlePanel.id === 'qa' ? 100 : 0,
      };
    }
    
    if (visiblePanels.length === 2) {
      // Distribute evenly between two visible panels
      const [first, second] = visiblePanels;
      return {
        document: first.id === 'document' || second.id === 'document' ? 50 : 0,
        insights: first.id === 'insights' || second.id === 'insights' ? 50 : 0,
        qa: first.id === 'qa' || second.id === 'qa' ? 50 : 0,
      };
    }
    
    // All three panels visible - use current widths
    return panelWidths;
  }, [expandedPanel, getVisiblePanels, panelWidths]);

  const contextValue: PanelContextValue = {
    panels: DEFAULT_PANELS,
    panelStates,
    panelWidths,
    expandedPanel,
    minimizedPanels,
    expandPanel,
    minimizePanel,
    restorePanel,
    restoreAllPanels,
    togglePanelExpand,
    updatePanelWidth,
    updatePanelWidths,
    resetPanelWidths,
    isResponsiveMode,
    setResponsiveMode,
    getVisiblePanels,
    getMinimizedPanels,
    getNormalizedWidths,
  };

  return (
    <PanelContext.Provider value={contextValue}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanelContext(): PanelContextValue {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanelContext must be used within a PanelProvider');
  }
  return context;
}