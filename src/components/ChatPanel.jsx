import React, { useState, useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import { alpha } from '@mui/material/styles'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useDocument } from '../context/DocumentContext'

const faqs = [
  { id: 'obligations', title: 'Obligations', icon: '📋' },
  { id: 'risks', title: 'Risks', icon: '⚠️' },
  { id: 'summary', title: 'Summary', icon: '📄' },
  { id: 'timelines', title: 'Timelines', icon: '⏰' },
]

export default function ChatPanel({ isMaximized, onToggleMaximize }) {
  const { document } = useDocument()
  const [messages, setMessages] = useState([{
    id: 1, 
    role: 'assistant', 
    text: 'Welcome! I can help you understand your uploaded document. Try asking about obligations, risks, or request a summary.',
    timestamp: new Date().toISOString()
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return
    
    const userMessage = { 
      id: Date.now(), 
      role: 'user', 
      text: messageText,
      timestamp: new Date().toISOString()
    }
    setMessages(m => [...m, userMessage])
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          document_text: document?.preview,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          text: data.response,
          timestamp: new Date().toISOString()
        }
        setMessages(m => [...m, assistantMessage])
      } else {
        throw new Error(data.detail || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'I apologize, but I\'m having trouble responding right now. Please try again later.',
        error: true,
        timestamp: new Date().toISOString()
      }
      setMessages(m => [...m, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const send = () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    sendMessage(text)
  }

  const onFaq = (title) => {
    if (loading) return
    sendMessage(title)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <SmartToyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">AI Assistant</Typography>
              <Typography variant="caption" color="text.secondary">
                {document ? `Analyzing ${document.filename}` : 'Ready to help'}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={onToggleMaximize}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            {isMaximized ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
          </IconButton>
        </Box>

        {/* FAQ Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {faqs.map((f) => (
            <Chip 
              key={f.id} 
              label={`${f.icon} ${f.title}`}
              variant="outlined"
              clickable 
              onClick={() => onFaq(f.title)}
              disabled={loading}
              size="small"
              sx={{
                '&:hover': {
                  bgcolor: alpha('#1976d2', 0.04),
                  borderColor: 'primary.main',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((message) => (
          <Box key={message.id} sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
            flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
          }}>
            <Avatar sx={{ 
              width: 32, 
              height: 32,
              bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main'
            }}>
              {message.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
            </Avatar>
            
            <Box sx={{ 
              maxWidth: '75%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: message.role === 'user' 
                    ? 'primary.main' 
                    : message.error 
                      ? 'error.main'
                      : 'background.paper',
                  color: message.role === 'user' || message.error 
                    ? 'white' 
                    : 'text.primary',
                  borderRadius: 2,
                  borderTopLeftRadius: message.role === 'user' ? 2 : 0.5,
                  borderTopRightRadius: message.role === 'assistant' ? 2 : 0.5,
                }}
              >
                {message.role === 'user' ? (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </Typography>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <Typography variant="body2" paragraph sx={{ mb: 1, '&:last-child': { mb: 0 } }}>
                          {children}
                        </Typography>
                      ),
                      h1: ({ children }) => (
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {children}
                        </Typography>
                      ),
                      h2: ({ children }) => (
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          {children}
                        </Typography>
                      ),
                      h3: ({ children }) => (
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          {children}
                        </Typography>
                      ),
                      ul: ({ children }) => (
                        <Box component="ul" sx={{ pl: 2, mb: 1 }}>
                          {children}
                        </Box>
                      ),
                      ol: ({ children }) => (
                        <Box component="ol" sx={{ pl: 2, mb: 1 }}>
                          {children}
                        </Box>
                      ),
                      li: ({ children }) => (
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                          {children}
                        </Typography>
                      ),
                      strong: ({ children }) => (
                        <Typography component="strong" sx={{ fontWeight: 600 }}>
                          {children}
                        </Typography>
                      ),
                      em: ({ children }) => (
                        <Typography component="em" sx={{ fontStyle: 'italic' }}>
                          {children}
                        </Typography>
                      ),
                      code: ({ children, inline }) => (
                        inline ? (
                          <Typography 
                            component="code" 
                            sx={{ 
                              bgcolor: message.role === 'user' ? alpha('#fff', 0.2) : alpha('#000', 0.05),
                              px: 0.5,
                              py: 0.25,
                              borderRadius: 0.5,
                              fontSize: '0.85em',
                              fontFamily: 'monospace'
                            }}
                          >
                            {children}
                          </Typography>
                        ) : (
                          <Paper sx={{ p: 1, bgcolor: alpha('#000', 0.05), mb: 1 }}>
                            <Typography 
                              component="pre" 
                              variant="body2"
                              sx={{ 
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                                m: 0
                              }}
                            >
                              {children}
                            </Typography>
                          </Paper>
                        )
                      )
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                )}
                {message.fallback && (
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                    (Offline mode)
                  </Typography>
                )}
              </Paper>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, px: 1 }}>
                {formatTime(message.timestamp)}
              </Typography>
            </Box>
          </Box>
        ))}
        
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              <SmartToyIcon fontSize="small" />
            </Avatar>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                borderTopLeftRadius: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Assistant is thinking...
              </Typography>
            </Paper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField 
            fullWidth 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the document..."
            disabled={loading}
            multiline
            maxRows={4}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
          <IconButton 
            onClick={send}
            disabled={loading || !input.trim()}
            color="primary"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
