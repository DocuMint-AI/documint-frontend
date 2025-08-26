import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Simple in-memory store for demo (use database in production)
let documentStore = {}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      uploadDir: './uploads',
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    })

    // Ensure uploads directory exists
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads', { recursive: true })
    }

    const [fields, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : files.file

    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const fileName = file.originalFilename.toLowerCase()
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx')) {
      // Clean up uploaded file
      fs.unlinkSync(file.filepath)
      return res.status(400).json({ error: 'Only PDF and DOCX files are supported' })
    }

    let extractedText = ''
    let insights = {}

    try {
      if (fileName.endsWith('.pdf')) {
        const dataBuffer = fs.readFileSync(file.filepath)
        const data = await pdfParse(dataBuffer)
        extractedText = data.text
      } else if (fileName.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ path: file.filepath })
        extractedText = result.value
      }

      // Extract basic insights (simple keyword extraction for demo)
      insights = extractInsights(extractedText)

      // Store document data
      const docId = Date.now().toString()
      documentStore[docId] = {
        id: docId,
        filename: file.originalFilename,
        text: extractedText,
        insights,
        uploadedAt: new Date().toISOString(),
      }

      // Clean up uploaded file
      fs.unlinkSync(file.filepath)

      res.status(200).json({
        success: true,
        documentId: docId,
        filename: file.originalFilename,
        insights,
        preview: extractedText.substring(0, 500) + '...',
      })
    } catch (parseError) {
      console.error('Parse error:', parseError)
      fs.unlinkSync(file.filepath)
      res.status(500).json({ error: 'Failed to parse document' })
    }
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
}

function extractInsights(text) {
  // Simple keyword-based extraction for demo
  const parties = extractParties(text)
  const obligations = extractObligations(text)
  const risks = extractRisks(text)
  const timelines = extractTimelines(text)

  return {
    parties,
    obligations,
    risks,
    timelines,
    summary: `Document contains ${text.split(' ').length} words with ${parties.length} identified parties.`,
  }
}

function extractParties(text) {
  const patterns = [
    /(?:party|parties|company|corporation|llc|inc|ltd)[\s\w]*(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
    /(?:between|among)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  ]
  
  const parties = new Set()
  patterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.replace(/^(?:party|parties|company|corporation|llc|inc|ltd|between|among)\s*/i, '').trim()
        if (cleaned.length > 2) parties.add(cleaned)
      })
    }
  })
  
  return Array.from(parties).slice(0, 5) // Limit to 5 for demo
}

function extractObligations(text) {
  const patterns = [
    /(?:shall|must|will|required to|obligated to)\s+([^.]{10,100})/gi,
    /(?:responsible for|duty to|obligation to)\s+([^.]{10,100})/gi,
  ]
  
  const obligations = new Set()
  patterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(match => {
        obligations.add(match.trim())
      })
    }
  })
  
  return Array.from(obligations).slice(0, 5)
}

function extractRisks(text) {
  const riskKeywords = ['liability', 'penalty', 'breach', 'default', 'termination', 'damages', 'indemnify']
  const risks = []
  
  riskKeywords.forEach(keyword => {
    const regex = new RegExp(`[^.]{0,50}${keyword}[^.]{0,50}`, 'gi')
    const matches = text.match(regex)
    if (matches) {
      risks.push(...matches.slice(0, 2))
    }
  })
  
  return risks.slice(0, 5)
}

function extractTimelines(text) {
  const patterns = [
    /(?:within|by|before|after)\s+(\d+\s+(?:days?|weeks?|months?|years?))/gi,
    /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/gi,
  ]
  
  const timelines = new Set()
  patterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(match => timelines.add(match.trim()))
    }
  })
  
  return Array.from(timelines).slice(0, 5)
}

// Export for use in other API routes
export { documentStore }