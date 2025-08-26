import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

const faqs = [
  { id: 'obligations', title: 'Obligations' },
  { id: 'risks', title: 'Risks' },
  { id: 'summary', title: 'Summary' },
]

export default function ChatPanel() {
  const [messages, setMessages] = useState([{
    id: 1, role: 'system', text: 'Welcome! Ask me about the uploaded document.'
  }])
  const [input, setInput] = useState('')

  const send = () => {
    if (!input.trim()) return
    setMessages((m) => [...m, { id: Date.now(), role: 'user', text: input }])
    setInput('')
    // stubbed assistant response
    setTimeout(() => setMessages((m) => [...m, { id: Date.now() + 1, role: 'assistant', text: 'This is a placeholder response.' }]), 600)
  }

  const onFaq = (t) => {
    setMessages((m) => [...m, { id: Date.now(), role: 'user', text: t }])
    setTimeout(() => setMessages((m) => [...m, { id: Date.now() + 1, role: 'assistant', text: `Placeholder answer for ${t}` }]), 600)
  }

  return (
    <Box sx={{ p: 2 }} role="region" aria-label="Chat panel">
      <Typography variant="subtitle1">Assistant</Typography>

      <Paper sx={{ p: 2, my: 2, height: 420, overflow: 'auto' }}>
        {messages.map((m) => (
          <Box key={m.id} sx={{ mb: 1 }}>
            <Typography variant="caption">{m.role}</Typography>
            <Typography>{m.text}</Typography>
          </Box>
        ))}
      </Paper>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {faqs.map((f) => (
          <Chip key={f.id} label={f.title} clickable onClick={() => onFaq(f.title)} />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField fullWidth value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question about the document..." />
        <Button variant="contained" onClick={send}>Send</Button>
      </Box>
    </Box>
  )
}
