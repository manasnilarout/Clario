import React from 'react'
import { Container, Typography } from '@mui/material'

const OGSM: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        OGSM Planning
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Strategic planning with Objectives, Goals, Strategies, and Measures.
      </Typography>
    </Container>
  )
}

export default OGSM
