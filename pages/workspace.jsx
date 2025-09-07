import React from 'react'
import Head from 'next/head'
import { DocumentProvider } from '../src/context/DocumentContext'
import { PanelProvider } from '../src/context/PanelContext'
import ResponsiveLayout from '../src/components/ResponsiveLayout'
import { DocumentPanel } from '../src/components/panels/DocumentPanel'
import { InsightsPanel } from '../src/components/panels/InsightsPanel'
import { QAPanel } from '../src/components/panels/QAPanel'

function WorkspaceContent() {
  return (
    <ResponsiveLayout
      leftPanel={<DocumentPanel />}
      centerPanel={<InsightsPanel />}
      rightPanel={<QAPanel />}
    />
  )
}

export default function Workspace() {
  return (
    <DocumentProvider>
      <PanelProvider>
        <Head>
          <title>DocuMint - Legal Document Analysis</title>
          <meta name="description" content="AI-powered legal document analysis and insights" />
        </Head>
        <WorkspaceContent />
      </PanelProvider>
    </DocumentProvider>
  )
}
