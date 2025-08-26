import React, { useState } from 'react'
import Head from 'next/head'
import Box from '@mui/material/Box'
import { DocumentProvider } from '../src/context/DocumentContext'
import { useTheme } from '../src/context/ThemeContext'
import DocumentPreview from '../src/components/DocumentPreview'
import ChatPanel from '../src/components/ChatPanel'
import InsightsPanel from '../src/components/InsightsPanel'
import UploadArea from '../src/components/UploadArea'
import { useDocument } from '../src/context/DocumentContext'

function WorkspaceContent() {
  const { document } = useDocument()
  const [chatMaximized, setChatMaximized] = useState(false)
  const [insightsMaximized, setInsightsMaximized] = useState(false)
  
  const toggleChatMaximize = () => setChatMaximized(!chatMaximized)
  const toggleInsightsMaximize = () => setInsightsMaximized(!insightsMaximized)

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'grid',
      gridTemplateColumns: insightsMaximized ? '1fr' : chatMaximized ? '1fr' : '1fr 400px',
      gridTemplateRows: insightsMaximized ? '1fr' : chatMaximized ? '1fr' : '1fr 300px',
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      {/* Main Document Area */}
      <Box sx={{ 
        gridColumn: insightsMaximized ? 1 : chatMaximized ? 1 : '1 / -1',
        gridRow: insightsMaximized ? 1 : chatMaximized ? 1 : 1,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {insightsMaximized ? (
          <InsightsPanel 
            isMaximized={true} 
            onToggleMaximize={toggleInsightsMaximize} 
          />
        ) : chatMaximized ? (
          <ChatPanel 
            isMaximized={true} 
            onToggleMaximize={toggleChatMaximize} 
          />
        ) : (
          document ? <DocumentPreview /> : <UploadArea />
        )}
      </Box>

      {/* Insights Panel - Top Right */}
      {!insightsMaximized && !chatMaximized && (
        <Box sx={{ 
          gridColumn: 2,
          gridRow: 1,
          borderLeft: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <InsightsPanel 
            isMaximized={false} 
            onToggleMaximize={toggleInsightsMaximize} 
          />
        </Box>
      )}

      {/* Chat Panel - Bottom Right */}
      {!insightsMaximized && !chatMaximized && (
        <Box sx={{ 
          gridColumn: 2,
          gridRow: 2,
          borderLeft: 1, 
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <ChatPanel 
            isMaximized={false} 
            onToggleMaximize={toggleChatMaximize} 
          />
        </Box>
      )}
    </Box>
  )
}

export default function Workspace() {
  const { theme } = useTheme()

  return (
    <DocumentProvider>
      <Head>
        <title>DocuMint - Legal Document Analysis</title>
        <meta name="description" content="AI-powered legal document analysis and insights" />
      </Head>
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary
      }}>
        <WorkspaceContent />
      </Box>
    </DocumentProvider>
  )
}
