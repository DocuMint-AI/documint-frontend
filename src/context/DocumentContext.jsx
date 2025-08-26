import React, { createContext, useContext, useState } from 'react'

const DocumentContext = createContext({})

export function DocumentProvider({ children }) {
  const [document, setDocument] = useState(null)
  const [insights, setInsights] = useState(null)

  const updateDocument = (docData) => {
    setDocument(docData)
    if (docData?.insights) {
      setInsights(docData.insights)
    }
  }

  const clearDocument = () => {
    setDocument(null)
    setInsights(null)
  }

  return (
    <DocumentContext.Provider value={{
      document,
      insights,
      updateDocument,
      clearDocument,
    }}>
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocument() {
  const context = useContext(DocumentContext)
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider')
  }
  return context
}