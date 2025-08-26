import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import UploadArea from '../src/components/UploadArea'
import Layout from '../src/components/Layout'
import { useDocument } from '../src/context/DocumentContext'
import { useRouter } from 'next/router'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import InsightsIcon from '@mui/icons-material/Insights'
import SecurityIcon from '@mui/icons-material/Security'
import SpeedIcon from '@mui/icons-material/Speed'

const features = [
  {
    icon: SmartToyIcon,
    title: 'AI-Powered Analysis',
    description: 'Advanced AI understands your legal documents and provides instant insights.',
  },
  {
    icon: InsightsIcon,
    title: 'Smart Insights',
    description: 'Extract key parties, obligations, risks, and timelines automatically.',
  },
  {
    icon: SecurityIcon,
    title: 'Secure & Private',
    description: 'Your documents are processed securely with enterprise-grade privacy.',
  },
  {
    icon: SpeedIcon,
    title: 'Instant Results',
    description: 'Get comprehensive analysis in seconds, not hours of manual review.',
  },
]

export default function Home() {
  const router = useRouter()
  const { updateDocument } = useDocument()
  const [uploading, setUploading] = useState(false)

  const onUploadSuccess = (data) => {
    updateDocument(data)
    router.push('/workspace')
  }

  return (
    <Layout>
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 300,
                mb: 2,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DocuMint
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ mb: 4, fontWeight: 300, maxWidth: 600, mx: 'auto' }}
            >
              Demystify legal documents with AI-powered analysis. 
              Upload, analyze, and understand contracts in minutes.
            </Typography>
          </Box>

          <UploadArea 
            onUploadSuccess={onUploadSuccess} 
            uploading={uploading}
            setUploading={setUploading}
          />
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ mb: 6, fontWeight: 400 }}
        >
          Why Choose DocuMint?
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    textAlign: 'center',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    }
                  }}
                  elevation={2}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                      }}
                    >
                      <IconComponent sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Container>
    </Layout>
  )
}
