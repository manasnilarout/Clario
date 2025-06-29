import React from 'react'
import { Container, Typography } from '@mui/material'

const Tasks: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Task Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Organize tasks with Kanban boards, lists, and calendar views.
      </Typography>
    </Container>
  )
}

export default Tasks
