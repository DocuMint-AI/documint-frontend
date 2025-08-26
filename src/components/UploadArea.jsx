import React, { useRef, useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { alpha } from '@mui/material/styles'

export default function UploadArea({ onUploadSuccess, uploading, setUploading }) {
  const fileRef = useRef()
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

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

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onUploadSuccess(data)
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
        borderRadius: 3,
        border: dragActive ? 2 : 1,
        borderStyle: 'dashed',
        borderColor: dragActive ? 'primary.main' : 'divider',
        bgcolor: dragActive ? alpha('#1976d2', 0.04) : 'background.paper',
        transition: 'all 0.2s ease-in-out',
        cursor: uploading ? 'default' : 'pointer',
        '&:hover': {
          borderColor: uploading ? 'divider' : 'primary.main',
          bgcolor: uploading ? 'background.paper' : alpha('#1976d2', 0.02),
        },
      }}
      onClick={!uploading ? openFilePicker : undefined}
      elevation={dragActive ? 3 : 1}
    >
      <input 
        ref={fileRef} 
        type="file" 
        hidden 
        onChange={onSelect} 
        accept=".pdf,.docx"
        disabled={uploading}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: alpha('#1976d2', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease-in-out',
            transform: dragActive ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <CloudUploadIcon 
            sx={{ 
              fontSize: 40, 
              color: 'primary.main',
              transition: 'all 0.2s ease-in-out',
            }} 
          />
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom color="text.primary">
            {dragActive ? 'Drop your file here' : 'Upload your legal document'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag and drop a file here, or click to browse
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supported formats: PDF, DOCX • Max size: 50MB
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
            {error}
          </Alert>
        )}

        {!dragActive && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<InsertDriveFileIcon />}
              onClick={(e) => {
                e.stopPropagation()
                openFilePicker()
              }}
              disabled={uploading}
              size="large"
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
            <Typography variant="body2" color="text.secondary">
              or drag and drop
            </Typography>
          </Box>
        )}

        {uploading && (
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <InsertDriveFileIcon color="primary" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Processing document...
              </Typography>
            </Box>
            <LinearProgress 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: alpha('#1976d2', 0.1),
              }} 
            />
          </Box>
        )}
      </Box>
    </Paper>
  )
}
