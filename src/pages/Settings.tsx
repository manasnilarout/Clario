import React from 'react'
import { Container, Typography } from '@mui/material'

const Settings: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage your preferences, integrations, and account settings.
      </Typography>
    </Container>
  )
}

export default Settings
