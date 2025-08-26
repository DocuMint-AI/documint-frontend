import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import CloseIcon from '@mui/icons-material/Close'

export default function InsightsPanel() {
  const [open, setOpen] = useState(false)

  const insights = [
    { id: 'parties', title: 'Parties', value: 'Alice, Beta LLC' },
    { id: 'obligations', title: 'Obligations', value: 'Deliver goods within 30 days' },
    { id: 'risks', title: 'Risks', value: 'No IP warranty' },
  ]

  if (open) {
    return (
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 1400 }}>
        <Paper sx={{ m: 4, p: 3, height: 'calc(100% - 64px)', overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Insights</Typography>
            <IconButton onClick={() => setOpen(false)} aria-label="close insights"><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ mt: 2 }}>
            {insights.map((i) => (
              <Box key={i.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">{i.title}</Typography>
                <Typography>{i.value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'fixed', right: 24, bottom: 24 }}>
      <Paper sx={{ p: 1, width: 260 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">Insights</Typography>
          <IconButton onClick={() => setOpen(true)} aria-label="expand insights"><FullscreenIcon /></IconButton>
        </Box>

        <Box sx={{ mt: 1 }}>
          {insights.map((i) => (
            <Box key={i.id} sx={{ mb: 1 }}>
              <Typography variant="caption">{i.title}</Typography>
              <Typography noWrap>{i.value}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  )
}
