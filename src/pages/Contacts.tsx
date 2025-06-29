import React from 'react'
import { Container, Typography } from '@mui/material'

const Contacts: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Contact Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Organize and manage your professional contacts with insights and
        analytics.
      </Typography>
    </Container>
  )
}

export default Contacts
