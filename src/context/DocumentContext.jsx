import React, { createContext, useContext, useState, useEffect } from 'react'

const DocumentContext = createContext({})

export function DocumentProvider({ children }) {
  const [document, setDocument] = useState(null)
  const [insights, setInsights] = useState(null)
  const [availableModels, setAvailableModels] = useState([])
  const [currentModel, setCurrentModel] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch available models on component mount
  useEffect(() => {
    fetchAvailableModels()
  }, [])

  const fetchAvailableModels = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/models')
      const data = await response.json()
      
      if (response.ok) {
        setAvailableModels(data.models)
        setCurrentModel(data.current_model)
      } else {
        console.error('Failed to fetch models:', data)
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectModel = async (modelName) => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/models/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model_name: modelName }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCurrentModel(data.current_model)
        return { success: true }
      } else {
        return { success: false, error: data.detail }
      }
    } catch (error) {
      console.error('Error selecting model:', error)
      return { success: false, error: 'Failed to connect to server' }
    } finally {
      setLoading(false)
    }
  }

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
      availableModels,
      currentModel,
      loading,
      updateDocument,
      clearDocument,
      fetchAvailableModels,
      selectModel,
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