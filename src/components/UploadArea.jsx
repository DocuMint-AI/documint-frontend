import React, { useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'

export default function UploadArea({ onFiles, uploading }) {
  const fileRef = useRef()

  const openFilePicker = () => fileRef.current && fileRef.current.click()

  const onDrop = useCallback((e) => {
    e.preventDefault()
    const dt = e.dataTransfer
    const files = Array.from(dt.files)
    onFiles(files)
  }, [onFiles])

  const onSelect = (e) => {
    const files = Array.from(e.target.files || [])
    onFiles(files)
  }

  return (
    <Paper
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}
    >
      <input ref={fileRef} type="file" hidden onChange={onSelect} multiple />

      <Box sx={{ py: 4 }}>
        <Typography variant="h6">Drag & drop your contract here</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Or select a file from your device. Supported: PDF, DOCX
        </Typography>

        <Button variant="contained" onClick={openFilePicker} sx={{ mr: 2 }}>
          Choose file
        </Button>

        {uploading && <LinearProgress sx={{ mt: 3 }} />}
      </Box>
    </Paper>
  )
}
