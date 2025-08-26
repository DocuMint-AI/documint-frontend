import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import RefreshIcon from '@mui/icons-material/Refresh'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import ScheduleIcon from '@mui/icons-material/Schedule'
import InfoIcon from '@mui/icons-material/Info'
import { alpha } from '@mui/material/styles'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useDocument } from '../context/DocumentContext'

const INSIGHT_CATEGORIES = [
  { id: 'risks', title: 'Risks', icon: <WarningAmberIcon />, color: 'error' },
  { id: 'obligations', title: 'Obligations', icon: <TaskAltIcon />, color: 'warning' },
  { id: 'timelines', title: 'Timelines', icon: <ScheduleIcon />, color: 'info' },
  { id: 'summary', title: 'Summary', icon: <InfoIcon />, color: 'primary' },
]

export default function InsightsPanel({ isMaximized, onToggleMaximize }) {
  const [insights, setInsights] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('summary')
  const { document } = useDocument()

  // Auto-generate insights when document is uploaded
  useEffect(() => {
    if (document?.preview && Object.keys(insights).length === 0) {
      generateInsights()
    }
  }, [document])

  const generateInsights = async () => {
    if (!document?.preview) {
      setError('No document available for analysis')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_text: document.preview
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate insights')
      }

      const data = await response.json()
      setInsights(data.insights)
      
      // Auto-select first available category
      const firstCategory = Object.keys(data.insights)[0]
      if (firstCategory) {
        setSelectedCategory(firstCategory)
      }
    } catch (error) {
      console.error('Insights error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedInsight = () => {
    return insights[selectedCategory] || ''
  }

  const getAvailableCategories = () => {
    return INSIGHT_CATEGORIES.filter(cat => insights[cat.id])
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightbulbIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={500}>
            Insights
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton 
            onClick={generateInsights}
            disabled={loading || !document}
            size="small"
            title="Regenerate insights"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={onToggleMaximize}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            {isMaximized ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!document ? (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            p: 3
          }}>
            <Box>
              <LightbulbIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Upload a document to generate insights
              </Typography>
            </Box>
          </Box>
        ) : loading ? (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            p: 3
          }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Analyzing document...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert 
              severity="error" 
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={generateInsights}
                  disabled={loading}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Box>
        ) : Object.keys(insights).length === 0 ? (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            p: 3
          }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No insights generated yet
            </Typography>
            <Button 
              variant="contained" 
              onClick={generateInsights}
              disabled={loading}
              startIcon={<LightbulbIcon />}
            >
              Generate Insights
            </Button>
          </Box>
        ) : (
          <>
            {/* Category Tabs */}
            <Box sx={{ p: 2, pb: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {getAvailableCategories().map((category) => (
                  <Chip
                    key={category.id}
                    label={category.title}
                    icon={category.icon}
                    clickable
                    color={selectedCategory === category.id ? category.color : 'default'}
                    variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedCategory(category.id)}
                    sx={{
                      '&:hover': {
                        bgcolor: selectedCategory === category.id ? undefined : alpha('#1976d2', 0.04)
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
            
            <Divider />
            
            {/* Selected Insight Content */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 2,
              bgcolor: 'background.default'
            }}>
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <Typography variant="body2" paragraph sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                        {children}
                      </Typography>
                    ),
                    h1: ({ children }) => (
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        {children}
                      </Typography>
                    ),
                    h2: ({ children }) => (
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                        {children}
                      </Typography>
                    ),
                    h3: ({ children }) => (
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {children}
                      </Typography>
                    ),
                    ul: ({ children }) => (
                      <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                        {children}
                      </Box>
                    ),
                    ol: ({ children }) => (
                      <Box component="ol" sx={{ pl: 2, mb: 2 }}>
                        {children}
                      </Box>
                    ),
                    li: ({ children }) => (
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
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
                            bgcolor: alpha('#000', 0.05),
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
                  {getSelectedInsight()}
                </ReactMarkdown>
              </Paper>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  )
}
