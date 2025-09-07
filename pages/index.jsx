import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { alpha, useTheme } from '@mui/material/styles'
import UploadArea from '../src/components/UploadArea'
import Layout from '../src/components/Layout'
import { useDocument } from '../src/context/DocumentContext'
import { useRouter } from 'next/router'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import InsightsIcon from '@mui/icons-material/Insights'
import SecurityIcon from '@mui/icons-material/Security'
import SpeedIcon from '@mui/icons-material/Speed'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)
const MotionCard = motion(Card)

const features = [
  {
    icon: SmartToyIcon,
    title: 'AI-Powered Analysis',
    description: 'Advanced AI understands your legal documents and provides instant insights.',
    color: 'primary.main',
  },
  {
    icon: InsightsIcon,
    title: 'Smart Insights',
    description: 'Extract key parties, obligations, risks, and timelines automatically.',
    color: 'secondary.main',
  },
  {
    icon: SecurityIcon,
    title: 'Secure & Private',
    description: 'Your documents are processed securely with enterprise-grade privacy.',
    color: 'secondary.main',
  },
  {
    icon: SpeedIcon,
    title: 'Instant Results',
    description: 'Get comprehensive analysis in seconds, not hours of manual review.',
    color: 'primary.main',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

export default function Home() {
  const theme = useTheme()
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
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, 
            ${alpha(theme.palette.primary.main, 0.08)} 0%, 
            transparent 50%
          )`,
          pointerEvents: 'none',
        }
      }}>
        <Container maxWidth="lg" sx={{ py: 10, position: 'relative', zIndex: 1 }}>
          <MotionBox 
            sx={{ textAlign: 'center', mb: 8 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="displayLarge"
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 400,
                mb: 3,
                background: `linear-gradient(135deg, 
                  ${theme.palette.primary.main}, 
                  ${theme.palette.secondary.main},
                  ${theme.palette.tertiary?.main || theme.palette.primary.main}
                )`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
                animation: 'gradient 3s ease infinite',
                '@keyframes gradient': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                  '100%': { backgroundPosition: '0% 50%' },
                },
              }}
            >
              DocuMint
            </Typography>
            <Typography 
              variant="headlineMedium"
              color="text.secondary"
              sx={{ 
                mb: 6, 
                fontWeight: 400, 
                maxWidth: 720, 
                mx: 'auto',
                lineHeight: 1.4
              }}
            >
              Demystify legal documents with AI-powered analysis. 
              Upload, analyze, and understand contracts in minutes.
            </Typography>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <UploadArea 
              onUploadSuccess={onUploadSuccess} 
              uploading={uploading}
              setUploading={setUploading}
            />
          </MotionBox>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Typography 
            variant="displaySmall"
            align="center" 
            gutterBottom
            color="text.primary"
            sx={{ mb: 8, fontWeight: 400 }}
          >
            Why Choose DocuMint?
          </Typography>
        </MotionBox>
        
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={4}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <MotionCard
                    variants={itemVariants}
                    whileHover={{ 
                      y: -8,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    sx={{ 
                      height: '100%',
                      textAlign: 'center',
                      borderRadius: 4,
                      bgcolor: 'background.paper',
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
                        borderColor: 'primary.main',
                        '& .feature-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                        },
                        '&::before': {
                          opacity: 1,
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, 
                          ${theme.palette.primary.main}, 
                          ${theme.palette.secondary.main}
                        )`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }
                    }}
                    elevation={0}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        className="feature-icon"
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: 4,
                          background: `linear-gradient(135deg, 
                            ${alpha(theme.palette.primary.main, 0.12)}, 
                            ${alpha(theme.palette.secondary.main, 0.08)}
                          )`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <IconComponent sx={{ 
                          fontSize: 36, 
                          color: 'primary.main',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }} />
                      </Box>
                      <Typography 
                        variant="titleLarge" 
                        gutterBottom 
                        color="text.primary"
                        sx={{ fontWeight: 500, mb: 2 }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="bodyMedium" 
                        color="text.secondary" 
                        sx={{ lineHeight: 1.6 }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </MotionCard>
                </Grid>
              )
            })}
          </Grid>
        </MotionBox>
      </Container>
    </Layout>
  )
}
