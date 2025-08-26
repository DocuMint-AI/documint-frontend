import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import DescriptionIcon from '@mui/icons-material/Description'
import { useDocument } from '../context/DocumentContext'

export default function DocumentPreview() {
  const { document } = useDocument()

  if (!document) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 4
      }}>
        <Alert severity="info" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            No Document
          </Typography>
          <Typography>
            Upload a document to start viewing and analyzing.
          </Typography>
        </Alert>
      </Box>
    )
  }

  // Split document text into paragraphs for better readability
  const paragraphs = document.preview ? 
    document.preview.split(/\n\s*\n/).filter(para => para.trim().length > 10) :
    ['Document content not available']

  const getFileType = (filename) => {
    return filename.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOCX'
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Document Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="h5" component="h1" fontWeight={500}>
            Document
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography 
            variant="subtitle1" 
            noWrap 
            sx={{ flex: 1, minWidth: 0 }}
            title={document.filename}
          >
            {document.filename}
          </Typography>
          <Chip 
            label={getFileType(document.filename)}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>
      
      {/* Document Content */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        bgcolor: 'background.default'
      }}>
        <Paper sx={{ 
          m: 3, 
          p: 4,
          minHeight: 'calc(100% - 48px)',
          bgcolor: 'background.paper'
        }}>
          {paragraphs.map((paragraph, index) => (
            <Typography 
              key={index}
              variant="body1"
              paragraph
              sx={{ 
                mb: 2,
                lineHeight: 1.7,
                color: 'text.primary',
                fontSize: '0.9rem',
                '&:last-child': { mb: 0 }
              }}
            >
              {paragraph.trim()}
            </Typography>
          ))}
        </Paper>
      </Box>
    </Box>
  )
}
