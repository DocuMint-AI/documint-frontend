import React from 'react'
import Layout from '../src/components/Layout'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import DocumentPreview from '../src/components/DocumentPreview'
import ChatPanel from '../src/components/ChatPanel'
import InsightsPanel from '../src/components/InsightsPanel'

export default function Workspace() {
  return (
    <Layout>
      <Container maxWidth={false} disableGutters>
        <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
          <Box sx={{ width: 320, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
            <DocumentPreview />
          </Box>

          <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
            {/* Main center area: could host document reader or editor */}
            <Box sx={{ borderRadius: 2, p: 2, bgcolor: 'background.paper', height: '100%' }}>
              <h2>Document Workspace</h2>
              <p>Preview and interact with the document here.</p>
            </Box>
          </Box>

          <Box sx={{ width: 420, borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
            <ChatPanel />
          </Box>

          <InsightsPanel />
        </Box>
      </Container>
    </Layout>
  )
}
