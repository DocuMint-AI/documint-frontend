import React from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'

const exampleClauses = Array.from({ length: 30 }).map((_, i) => ({
  id: i + 1,
  title: `Clause ${i + 1}`,
  text: `This is placeholder text for clause ${i + 1}.`,
}))

export default function DocumentPreview() {
  return (
    <Box sx={{ p: 2 }} aria-label="Document preview" role="region">
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Document
      </Typography>
      <List>
        {exampleClauses.map((c) => (
          <ListItem key={c.id} button>
            <ListItemText primary={c.title} secondary={c.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
