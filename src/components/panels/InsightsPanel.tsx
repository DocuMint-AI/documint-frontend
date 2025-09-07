import React from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  IconButton, 
  Typography, 
  Chip,
  useTheme,
  alpha,
  Stack
} from '@mui/material';
import { 
  Brain, 
  Maximize2, 
  Minimize2, 
  Minus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePanelContext, type PanelId } from '../../context/PanelContext';

interface BasePanelProps {
  panelId: PanelId;
  expanded: boolean;
  minimized: boolean;
  onExpand: () => void;
  onMinimize: () => void;
  onRestore: () => void;
}

interface InsightsPanelProps extends BasePanelProps {}

type InsightType = 'risk' | 'compliance' | 'standard' | 'suggestion' | 'legal';
type InsightLevel = 'high' | 'medium' | 'low';

interface Insight {
  id: string;
  type: InsightType;
  level: InsightLevel;
  title: string;
  description: string;
  section?: string;
  recommendation?: string;
}

const SAMPLE_INSIGHTS: Insight[] = [
  {
    id: '1',
    type: 'risk',
    level: 'high',
    title: 'Overly Broad Confidentiality Scope',
    description: 'The definition of confidential information may be too broad and could be unenforceable in court.',
    section: 'Section 1',
    recommendation: 'Consider narrowing the scope to specific categories of information.'
  },
  {
    id: '2',
    type: 'compliance',
    level: 'medium',
    title: 'Missing Jurisdiction Clause',
    description: 'The agreement lacks a specific jurisdiction clause for dispute resolution.',
    section: 'Section 5',
    recommendation: 'Add a jurisdiction clause to specify where disputes will be resolved.'
  },
  {
    id: '3',
    type: 'standard',
    level: 'low',
    title: 'Standard Term Length',
    description: 'The five-year confidentiality term aligns with industry standards.',
    section: 'Section 2'
  },
  {
    id: '4',
    type: 'suggestion',
    level: 'medium',
    title: 'Consider Mutual Confidentiality',
    description: 'This is a one-way NDA. Consider making it mutual if both parties will share information.',
    recommendation: 'Add reciprocal confidentiality obligations if needed.'
  },
  {
    id: '5',
    type: 'legal',
    level: 'medium',
    title: 'Definition Clarity',
    description: 'The definition of confidential information could be more specific and precise.',
    section: 'Section 1',
    recommendation: 'Consider adding specific examples and exclusions.'
  },
  {
    id: '6',
    type: 'risk',
    level: 'high',
    title: 'Missing Information Carve-outs',
    description: 'No carve-outs for publicly available information or independently developed information.',
    section: 'Section 1',
    recommendation: 'Add standard exceptions for public information and independently developed materials.'
  },
  {
    id: '7',
    type: 'compliance',
    level: 'low',
    title: 'Proper Return/Destruction Clause',
    description: 'The agreement properly addresses return and destruction of confidential information.',
    section: 'Section 3'
  },
  {
    id: '8',
    type: 'suggestion',
    level: 'low',
    title: 'Independent Development Exception',
    description: 'Consider adding exceptions for independently developed information.',
    recommendation: 'Add clause protecting independently developed or reverse-engineered information.'
  }
];

const getInsightIcon = (type: InsightType) => {
  switch (type) {
    case 'risk': return AlertTriangle;
    case 'compliance': return CheckCircle;
    case 'standard': return CheckCircle;
    case 'suggestion': return Lightbulb;
    case 'legal': return AlertCircle;
    default: return AlertCircle;
  }
};

const getInsightColor = (type: InsightType, level: InsightLevel) => {
  if (level === 'high') return 'error';
  if (level === 'medium') return 'warning';
  if (level === 'low') return 'success';
  
  switch (type) {
    case 'risk': return 'error';
    case 'compliance': return 'info';
    case 'standard': return 'success';
    case 'suggestion': return 'warning';
    case 'legal': return 'info';
    default: return 'info';
  }
};

const getLevelColor = (level: InsightLevel): 'error' | 'warning' | 'success' => {
  switch (level) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'success';
  }
};

export function InsightsPanel({ 
  panelId, 
  expanded, 
  minimized, 
  onExpand, 
  onMinimize, 
  onRestore 
}: InsightsPanelProps) {
  const theme = useTheme();
  
  const visibleInsights = expanded ? SAMPLE_INSIGHTS : SAMPLE_INSIGHTS.slice(0, 4);

  const headerActions = (
    <Box display="flex" gap={1}>
      <IconButton
        size="small"
        onClick={onMinimize}
        aria-label="Minimize panel"
        sx={{
          color: theme.palette.text.secondary,
          '&:hover': {
            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
          },
        }}
      >
        <Minus size={16} />
      </IconButton>
      <IconButton
        size="small"
        onClick={onExpand}
        aria-label={expanded ? "Exit fullscreen" : "Enter fullscreen"}
        sx={{
          color: theme.palette.secondary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
          },
        }}
      >
        {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </IconButton>
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ height: '100%' }}
    >
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: theme.shadows[1],
          '&:hover': {
            boxShadow: theme.shadows[2],
          },
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <CardHeader
          avatar={
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
              }}
            >
              <Brain size={20} />
            </Box>
          }
          title={
            <Typography variant="h6" component="h2" fontWeight={600}>
              AI Insights
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {SAMPLE_INSIGHTS.length} insights found
            </Typography>
          }
          action={headerActions}
          sx={{ 
            pb: 1,
            '& .MuiCardHeader-content': {
              overflow: 'hidden',
            },
          }}
        />
        
        <CardContent sx={{ flexGrow: 1, overflow: 'auto', pt: 0 }}>
          <Stack spacing={2}>
            <AnimatePresence>
              {visibleInsights.map((insight, index) => {
                const IconComponent = getInsightIcon(insight.type);
                const colorScheme = getInsightColor(insight.type, insight.level);
                const levelColor = getLevelColor(insight.level);
                
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: theme.shadows[1],
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
                        <Box
                          sx={{
                            p: 0.5,
                            borderRadius: 1,
                            backgroundColor: alpha(theme.palette[colorScheme].main, 0.1),
                            color: theme.palette[colorScheme].main,
                            mt: 0.25,
                          }}
                        >
                          <IconComponent size={14} />
                        </Box>
                        <Box flexGrow={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Chip
                              label={insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                              size="small"
                              color={colorScheme}
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                            <Chip
                              label={insight.level.charAt(0).toUpperCase() + insight.level.slice(1)}
                              size="small"
                              color={levelColor}
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                            {insight.section && (
                              <Typography variant="caption" color="text.secondary">
                                {insight.section}
                              </Typography>
                            )}
                          </Box>
                          <Typography 
                            variant="body2" 
                            fontWeight={500} 
                            gutterBottom
                            sx={{ fontSize: '0.875rem' }}
                          >
                            {insight.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontSize: '0.8rem',
                              lineHeight: 1.4,
                              mb: insight.recommendation ? 1 : 0,
                            }}
                          >
                            {insight.description}
                          </Typography>
                          {insight.recommendation && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.75rem',
                                fontStyle: 'italic',
                                color: theme.palette.primary.main,
                                mt: 0.5,
                              }}
                            >
                              💡 {insight.recommendation}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Stack>
          
          {!expanded && SAMPLE_INSIGHTS.length > 4 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                +{SAMPLE_INSIGHTS.length - 4} more insights available in fullscreen
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}