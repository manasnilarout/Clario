import React from 'react'
import { Container, Typography } from '@mui/material'

const Meetings: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Meeting Planner
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Schedule meetings, manage agendas, and track action items.
      </Typography>
    </Container>
  )
}

export default Meetings
