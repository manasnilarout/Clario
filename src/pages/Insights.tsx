import React from 'react'
import { Container, Typography } from '@mui/material'

const Insights: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Insights & Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Data-driven insights across all your productivity modules.
      </Typography>
    </Container>
  )
}

export default Insights
