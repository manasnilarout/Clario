import React, { useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Fab,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { useContactsStore } from '../store/contactsStore'
import ContactsList from '../components/features/contacts/ContactsList'
import ContactsSearchBar from '../components/features/contacts/ContactsSearchBar'
import ContactsFilters from '../components/features/contacts/ContactsFilters'
import BulkActionsToolbar from '../components/features/contacts/BulkActionsToolbar'
import ContactForm from '../components/features/contacts/ContactForm'

const Contacts: React.FC = () => {
  const {
    isLoading,
    error,
    selectedContacts,
    isCreating,
    loadContacts,
    loadTags,
    loadCategories,
    loadStats,
    setCreating,
    refreshContacts,
  } = useContactsStore()

  useEffect(() => {
    // Load initial data
    const initializeData = async () => {
      await Promise.all([
        loadContacts(),
        loadTags(),
        loadCategories(),
        loadStats(),
      ])
    }

    initializeData()
  }, [loadContacts, loadTags, loadCategories, loadStats])

  const handleCreateContact = () => {
    setCreating(true)
  }

  const handleRefresh = async () => {
    await refreshContacts()
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Contact Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Organize and manage your professional contacts with insights and
            analytics.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateContact}
            size="large"
          >
            Add Contact
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <ContactsSearchBar />
        <Box sx={{ mt: 2 }}>
          <ContactsFilters />
        </Box>
      </Box>

      {/* Bulk Actions Toolbar */}
      {selectedContacts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <BulkActionsToolbar />
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ position: 'relative' }}>
        {isLoading && !isCreating && (
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <ContactsList />
      </Box>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add contact"
        onClick={handleCreateContact}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', sm: 'none' },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Contact Creation Form Modal */}
      {isCreating && <ContactForm />}

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default Contacts
