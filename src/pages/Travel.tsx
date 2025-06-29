import React from 'react'
import { Container, Typography } from '@mui/material'

const Travel: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Travel Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Plan and manage your trips, itineraries, and travel checklists.
      </Typography>
    </Container>
  )
}

export default Travel
