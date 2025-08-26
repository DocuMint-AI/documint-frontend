import { documentStore } from './upload.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, documentId } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Get document context if available
    let documentContext = ''
    if (documentId && documentStore[documentId]) {
      const doc = documentStore[documentId]
      documentContext = `\n\nDocument context: ${doc.text.substring(0, 2000)}...`
    }

    // Prepare prompt for Ollama
    const prompt = `You are a legal document assistant. Help the user understand legal documents by providing clear, concise answers. Be helpful but always recommend consulting with a qualified lawyer for important decisions.

User question: ${message}${documentContext}

Response:`

    // Call Ollama endpoint
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'doomgrave/gemma3-tools:12b-it-q2_K',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 500,
        },
      }),
    })

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.status}`)
    }

    const data = await ollamaResponse.json()
    const aiResponse = data.response || 'I apologize, but I was unable to generate a response at this time.'

    res.status(200).json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chat error:', error)
    
    // Fallback response if Ollama is not available
    const fallbackResponses = {
      'obligations': 'Based on the document, key obligations typically include delivery timelines, payment terms, and compliance requirements. Please review the specific clauses for detailed obligations.',
      'risks': 'Common risks in legal documents include liability exposure, penalty clauses, and termination conditions. I recommend having a lawyer review these sections.',
      'summary': 'This appears to be a legal contract with standard clauses for parties, obligations, and terms. For a detailed analysis, please consult with a qualified attorney.',
    }

    const lowerMessage = req.body.message?.toLowerCase() || ''
    let fallbackResponse = 'I apologize, but I\'m currently unable to process your request. Please try again later.'
    
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(key)) {
        fallbackResponse = response
        break
      }
    }

    res.status(200).json({
      success: true,
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
      fallback: true,
    })
  }
}