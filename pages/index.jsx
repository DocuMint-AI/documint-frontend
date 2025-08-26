import React, { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import UploadArea from '../src/components/UploadArea'
import Layout from '../src/components/Layout'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)

  const onFiles = useCallback(async (files) => {
    // Basic validation: accept only pdf/docx
    const accepted = []
    const rejected = []
    for (const f of files) {
      const t = f.name.toLowerCase()
      if (t.endsWith('.pdf') || t.endsWith('.docx')) accepted.push(f)
      else rejected.push(f)
    }
    if (rejected.length) {
      alert('Some files were rejected. Only PDF and DOCX supported in this demo.')
    }
    if (accepted.length) {
      setUploading(true)
      // simulate upload and parsing
      setTimeout(() => {
        setUploading(false)
        // in a real app we'd persist the file or upload to backend
        router.push('/workspace')
      }, 900)
    }
  }, [router])

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          DocuMint
        </Typography>
        <Typography color="textSecondary" sx={{ mb: 4 }}>
          Upload a contract (PDF/DOCX) to get instant insights, summaries and a
          ready-to-use assistant.
        </Typography>

        <UploadArea onFiles={onFiles} uploading={uploading} />
      </Container>
    </Layout>
  )
}
