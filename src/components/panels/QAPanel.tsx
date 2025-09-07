import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  IconButton, 
  Typography, 
  TextField,
  useTheme,
  alpha,
  Stack,
  Divider,
  Avatar
} from '@mui/material';
import { 
  MessageCircle, 
  Maximize2, 
  Minimize2, 
  Minus,
  Send,
  Mic,
  User,
  Bot
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

interface QAPanelProps extends BasePanelProps {}

interface Message {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'question',
    content: 'What is the duration of the confidentiality obligation?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: '2',
    type: 'answer',
    content: 'According to Section 2 of the agreement, the confidentiality obligation lasts for five (5) years from the date of disclosure. This means that the recipient must maintain confidentiality for a full five years after receiving any confidential information.',
    timestamp: new Date(Date.now() - 1000 * 60 * 29)
  },
  {
    id: '3',
    type: 'question',
    content: 'What happens if there is a breach of confidentiality?',
    timestamp: new Date(Date.now() - 1000 * 60 * 25)
  },
  {
    id: '4',
    type: 'answer',
    content: 'Section 4 states that any breach would cause "irreparable harm" to the Company, and monetary damages would be inadequate compensation. Therefore, the Company can seek injunctive relief and other equitable remedies beyond just monetary damages. This gives the Company strong legal recourse in case of a breach.',
    timestamp: new Date(Date.now() - 1000 * 60 * 24)
  }
];

const EXPANDED_MESSAGES: Message[] = [
  ...INITIAL_MESSAGES,
  {
    id: '5',
    type: 'question',
    content: 'Is there a termination clause in this agreement?',
    timestamp: new Date(Date.now() - 1000 * 60 * 20)
  },
  {
    id: '6',
    type: 'answer',
    content: 'Yes, Section 3 includes a termination clause. Either party can terminate this agreement with thirty (30) days written notice. However, upon termination, all confidential information must be returned or destroyed at the Company\'s discretion. The confidentiality obligations continue even after termination.',
    timestamp: new Date(Date.now() - 1000 * 60 * 19)
  },
  {
    id: '7',
    type: 'question',
    content: 'Are there any exceptions to what is considered confidential information?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: '8',
    type: 'answer',
    content: 'The current agreement does not explicitly list exceptions to confidential information. Typically, NDAs include exceptions for information that is publicly available, independently developed, or already known to the recipient. This might be something to clarify with the other party.',
    timestamp: new Date(Date.now() - 1000 * 60 * 14)
  }
];

export function QAPanel({ 
  panelId, 
  expanded, 
  minimized, 
  onExpand, 
  onMinimize, 
  onRestore 
}: QAPanelProps) {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [question, setQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use different message sets based on expanded state
  const displayMessages = expanded ? EXPANDED_MESSAGES : messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendQuestion = async () => {
    if (!question.trim() || isLoading) return;

    const newQuestion: Message = {
      id: Date.now().toString(),
      type: 'question',
      content: question.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newQuestion]);
    setQuestion('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'answer',
        content: 'I\'ll analyze the document to provide you with a comprehensive answer to your question. Based on the content I can see, let me review the relevant sections and provide you with accurate information.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendQuestion();
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  const headerActions = (
    <Box display="flex" gap={1}>
      <IconButton
        size="small"
        onClick={onMinimize}
        aria-label="Minimize panel"
        sx={{
          color: theme.palette.text.secondary,
          '&:hover': {
            backgroundColor: alpha((theme.palette as any).tertiary?.main || theme.palette.info.main, 0.1),
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
          color: (theme.palette as any).tertiary?.main || theme.palette.info.main,
          '&:hover': {
            backgroundColor: alpha((theme.palette as any).tertiary?.main || theme.palette.info.main, 0.1),
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
                backgroundColor: alpha((theme.palette as any).tertiary?.main || theme.palette.info.main, 0.1),
                color: (theme.palette as any).tertiary?.main || theme.palette.info.main,
              }}
            >
              <MessageCircle size={20} />
            </Box>
          }
          title={
            <Typography variant="h6" component="h2" fontWeight={600}>
              Q&A Assistant
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              Ask questions about the document
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
        
        {/* Messages Area */}
        <CardContent sx={{ flexGrow: 1, overflow: 'auto', pt: 0, pb: 1 }}>
          <Stack spacing={2}>
            <AnimatePresence>
              {displayMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent={message.type === 'question' ? 'flex-end' : 'flex-start'}
                    mb={1}
                  >
                    <Box
                      sx={{
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: message.type === 'question' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: '0.75rem',
                          bgcolor: message.type === 'question' 
                            ? theme.palette.primary.main 
                            : (theme.palette as any).tertiary?.main || theme.palette.info.main,
                        }}
                      >
                        {message.type === 'question' ? <User size={12} /> : <Bot size={12} />}
                      </Avatar>
                      
                      <Card
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          backgroundColor: message.type === 'question'
                            ? alpha(theme.palette.primary.main, 0.1)
                            : alpha((theme.palette as any).tertiary?.main || theme.palette.info.main, 0.05),
                          borderColor: message.type === 'question'
                            ? alpha(theme.palette.primary.main, 0.2)
                            : alpha((theme.palette as any).tertiary?.main || theme.palette.info.main, 0.2),
                          borderRadius: 2,
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {message.content}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            mt: 0.5,
                            color: theme.palette.text.secondary,
                            fontSize: '0.7rem',
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Card>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box display="flex" justifyContent="flex-start" mb={1}>
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: '0.75rem',
                        bgcolor: (theme.palette as any).tertiary?.main || theme.palette.info.main,
                      }}
                    >
                      <Bot size={12} />
                    </Avatar>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        backgroundColor: alpha((theme.palette as any).tertiary?.main || theme.palette.info.main, 0.05),
                        borderColor: alpha((theme.palette as any).tertiary?.main || theme.palette.info.main, 0.2),
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        AI is thinking...
                      </Typography>
                    </Card>
                  </Box>
                </Box>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </Stack>
        </CardContent>
        
        <Divider />
        
        {/* Input Area */}
        <Box sx={{ p: 2 }}>
          <Box display="flex" gap={1} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Ask a question about the document..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <IconButton
              onClick={handleVoiceInput}
              color={isRecording ? 'error' : 'default'}
              disabled={isLoading}
              sx={{
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: alpha(
                    isRecording ? theme.palette.error.main : theme.palette.action.hover,
                    0.1
                  ),
                },
              }}
            >
              <Mic size={20} />
            </IconButton>
            <IconButton
              onClick={handleSendQuestion}
              disabled={!question.trim() || isLoading}
              color="primary"
              sx={{
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Send size={20} />
            </IconButton>
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
}