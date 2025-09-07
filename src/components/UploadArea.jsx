import React, { useRef, useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { alpha, useTheme } from '@mui/material/styles'
import { useDocument } from '../context/DocumentContext'

export default function UploadArea() {
  const theme = useTheme()
  const fileRef = useRef()
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { updateDocument } = useDocument()

  const openFilePicker = () => fileRef.current && fileRef.current.click()

  const uploadFiles = async (files) => {
    // Basic validation: accept only pdf/docx
    const accepted = []
    const rejected = []
    for (const f of files) {
      const t = f.name.toLowerCase()
      if (t.endsWith('.pdf') || t.endsWith('.docx')) accepted.push(f)
      else rejected.push(f)
    }
    
    if (rejected.length) {
      setError('Some files were rejected. Only PDF and DOCX files are supported.')
      return
    }
    
    if (!accepted.length) {
      setError('Please select a valid PDF or DOCX file.')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', accepted[0])

      console.log('Uploading file:', accepted[0].name)
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed')
      }

      console.log('Setting document with data:', data)
      // Set document with extracted content
      updateDocument({
        filename: accepted[0].name,
        preview: data.text,
        uploadedAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragOut = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const dt = e.dataTransfer
    const files = Array.from(dt.files)
    uploadFiles(files)
  }, [uploadFiles])

  const onSelect = (e) => {
    const files = Array.from(e.target.files || [])
    uploadFiles(files)
  }

  return (
    <Paper
      onDrop={onDrop}
      onDragOver={handleDrag}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      sx={{
        p: 6,
        textAlign: 'center',
        borderRadius: 4,
        border: dragActive ? 3 : 2,
        borderStyle: 'dashed',
  borderColor: dragActive ? 'primary.main' : (theme.palette.outline || theme.palette.divider),
        bgcolor: dragActive 
          ? alpha(theme.palette.primary.main, 0.08) 
          : 'background.paper',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: uploading ? 'default' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: uploading ? (theme.palette.outline || theme.palette.divider) : 'primary.main',
          bgcolor: uploading 
            ? 'background.paper' 
            : alpha(theme.palette.primary.main, 0.04),
          transform: uploading ? 'none' : 'translateY(-2px)',
          boxShadow: uploading ? 'none' : 3,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, 
            ${alpha(theme.palette.primary.main, 0.02)} 25%, 
            transparent 25%, 
            transparent 75%, 
            ${alpha(theme.palette.primary.main, 0.02)} 75%
          )`,
          backgroundSize: '20px 20px',
          opacity: dragActive ? 1 : 0,
          transition: 'opacity 0.3s ease',
        },
      }}
      onClick={!uploading ? openFilePicker : undefined}
      elevation={dragActive ? 8 : 1}
    >
      <input 
        ref={fileRef} 
        type="file" 
        hidden 
        onChange={onSelect} 
        accept=".pdf,.docx"
        disabled={uploading}
      />

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 4,
        position: 'relative',
        zIndex: 1
      }}>
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: dragActive ? 'scale(1.15) rotate(5deg)' : 'scale(1)',
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            boxShadow: dragActive ? 
              `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}` : 
              `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <CloudUploadIcon 
            sx={{ 
              fontSize: 48, 
              color: 'primary.main',
              transition: 'all 0.3s ease',
              filter: dragActive ? 'brightness(1.2)' : 'none',
            }} 
          />
        </Box>

        <Box>
          <Typography 
            variant="headlineSmall" 
            gutterBottom 
            color="onSurface.default"
            sx={{ fontWeight: 500 }}
          >
            {dragActive ? 'Drop your file here' : 'Upload your legal document'}
          </Typography>
          <Typography 
            variant="bodyLarge" 
            color="text.secondary" 
            sx={{ mb: 2, maxWidth: 360, mx: 'auto' }}
          >
            Drag and drop a file here, or click to browse your files
          </Typography>
          <Typography 
            variant="labelMedium" 
            color="text.secondary"
            sx={{
              bgcolor: alpha(theme.palette.background.default, 0.8),
              px: 2,
              py: 0.5,
              borderRadius: 2,
              display: 'inline-block'
            }}
          >
            Supported: PDF, DOCX • Max: 50MB
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              width: '100%', 
              textAlign: 'left',
              borderRadius: 3,
              bgcolor: alpha(theme.palette.error.main, 0.08),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            {error}
          </Alert>
        )}

        {!dragActive && (
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="filled"
              startIcon={<InsertDriveFileIcon />}
              onClick={(e) => {
                e.stopPropagation()
                openFilePicker()
              }}
              disabled={uploading}
              size="large"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {uploading ? 'Processing...' : 'Choose File'}
            </Button>
            <Typography variant="bodyMedium" color="text.secondary">
              or drag and drop
            </Typography>
          </Box>
        )}

        {uploading && (
          <Box sx={{ width: '100%', maxWidth: 480 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <InsertDriveFileIcon color="primary" />
              <Typography variant="bodyLarge" color="text.primary" sx={{ fontWeight: 500 }}>
                Processing document...
              </Typography>
            </Box>
            <LinearProgress 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                },
              }} 
            />
          </Box>
        )}
      </Box>
    </Paper>
  )
}
