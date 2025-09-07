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
  alpha
} from '@mui/material';
import { 
  FileText, 
  Maximize2, 
  Minimize2, 
  Minus,
  ChevronDown,
  ChevronUp
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

interface DocumentContent {
  title: string;
  version: string;
  sections: {
    title: string;
    content: string;
  }[];
}

interface DocumentPanelProps extends BasePanelProps {}

const SAMPLE_DOCUMENT: DocumentContent = {
  title: "Non-Disclosure Agreement",
  version: "NDA-2024-001",
  sections: [
    {
      title: "1. Definition of Confidential Information",
      content: "For purposes of this Agreement, \"Confidential Information\" shall include all non-public, proprietary or confidential information, technical data, trade secrets, know-how, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, or other business information disclosed by Company."
    },
    {
      title: "2. Obligations of Receiving Party",
      content: "Recipient agrees to hold and maintain the Confidential Information in strict confidence for a period of five (5) years from the date of disclosure. Recipient shall not disclose any Confidential Information to third parties without the prior written consent of Company. Recipient shall use the same degree of care that it uses to protect its own confidential information, but in no event less than reasonable care."
    },
    {
      title: "3. Term and Termination",
      content: "This Agreement shall remain in effect until terminated by either party with thirty (30) days written notice. Upon termination, all Confidential Information must be returned or destroyed at the Company's discretion."
    },
    {
      title: "4. Remedies",
      content: "Recipient acknowledges that any breach of this Agreement would cause irreparable harm to Company, and that monetary damages would be inadequate compensation. Therefore, Company shall be entitled to seek injunctive relief and other equitable remedies."
    },
    {
      title: "5. Governing Law",
      content: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles."
    },
    {
      title: "6. Entire Agreement",
      content: "This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements, understandings, negotiations and discussions."
    }
  ]
};

export function DocumentPanel({ 
  panelId, 
  expanded, 
  minimized, 
  onExpand, 
  onMinimize, 
  onRestore 
}: DocumentPanelProps) {
  const theme = useTheme();
  const [showAllSections, setShowAllSections] = React.useState(false);
  
  const visibleSections = showAllSections || expanded 
    ? SAMPLE_DOCUMENT.sections 
    : SAMPLE_DOCUMENT.sections.slice(0, 2);

  const headerActions = (
    <Box display="flex" gap={1}>
      <IconButton
        size="small"
        onClick={onMinimize}
        aria-label="Minimize panel"
        sx={{
          color: theme.palette.text.secondary,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
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
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
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
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <FileText size={20} />
            </Box>
          }
          title={
            <Typography variant="h6" component="h2" fontWeight={600}>
              Document
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {SAMPLE_DOCUMENT.title} • {SAMPLE_DOCUMENT.version}
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
          <motion.div layout>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                This Non-Disclosure Agreement ("Agreement") is entered into on January 15, 2024, 
                between TechCorp Solutions Inc., a Delaware corporation ("Company"), and John Smith, 
                an individual ("Recipient").
              </Typography>
            </Box>
            
            <AnimatePresence>
              {visibleSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={600} 
                      color="primary" 
                      gutterBottom
                      sx={{ mb: 1 }}
                    >
                      {section.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.primary"
                      sx={{ 
                        lineHeight: 1.6,
                        textAlign: 'justify',
                      }}
                    >
                      {section.content}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {!expanded && SAMPLE_DOCUMENT.sections.length > 2 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <IconButton
                  onClick={() => setShowAllSections(!showAllSections)}
                  sx={{
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  {showAllSections ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </IconButton>
                <Typography variant="caption" display="block" color="text.secondary">
                  {showAllSections ? 'Show less' : `Show ${SAMPLE_DOCUMENT.sections.length - 2} more sections`}
                </Typography>
              </Box>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}