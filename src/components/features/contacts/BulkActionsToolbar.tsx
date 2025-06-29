import React, { useState } from 'react'
import {
  Box,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Label as LabelIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  GetApp as ExportIcon,
  Email as EmailIcon,
  Message as MessageIcon,
} from '@mui/icons-material'
import { useContactsStore } from '../../../store/contactsStore'
import { ContactStatus, ContactPriority } from '../../../types/contact'

const BulkActionsToolbar: React.FC = () => {
  const { selectedContacts, tags, clearSelection, deleteMultipleContacts } =
    useContactsStore()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ContactStatus>('active')
  const [selectedPriority, setSelectedPriority] =
    useState<ContactPriority>('medium')

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteMultipleContacts(selectedContacts)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Failed to delete contacts:', error)
    }
  }

  const handleAddTag = async () => {
    if (!selectedTag) return

    try {
      // TODO: Implement bulk tag operations
      console.log('Add tag to contacts:', selectedContacts, selectedTag)
      setTagDialogOpen(false)
      setSelectedTag('')
    } catch (error) {
      console.error('Failed to add tag:', error)
    }
  }

  const handleUpdateStatus = async () => {
    try {
      // TODO: Implement bulk status updates
      console.log(
        'Update status for contacts:',
        selectedContacts,
        selectedStatus
      )
      setStatusDialogOpen(false)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleUpdatePriority = async () => {
    try {
      // TODO: Implement bulk priority updates
      console.log(
        'Update priority for contacts:',
        selectedContacts,
        selectedPriority
      )
      setPriorityDialogOpen(false)
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  const handleExport = async () => {
    try {
      // TODO: Implement bulk export
      console.log('Export contacts:', selectedContacts)
      handleMenuClose()
    } catch (error) {
      console.error('Failed to export contacts:', error)
    }
  }

  const handleArchive = async () => {
    try {
      // TODO: Implement bulk archive
      console.log('Archive contacts:', selectedContacts)
      handleMenuClose()
    } catch (error) {
      console.error('Failed to archive contacts:', error)
    }
  }

  const handleUnarchive = async () => {
    try {
      // TODO: Implement bulk unarchive
      console.log('Unarchive contacts:', selectedContacts)
      handleMenuClose()
    } catch (error) {
      console.error('Failed to unarchive contacts:', error)
    }
  }

  return (
    <>
      <Toolbar
        sx={{
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
          borderRadius: 1,
          mb: 2,
          pl: 2,
          pr: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" component="div">
            <Chip
              label={selectedContacts.length}
              size="small"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 'bold',
              }}
            />
            <Typography component="span" sx={{ ml: 1 }}>
              contact{selectedContacts.length !== 1 ? 's' : ''} selected
            </Typography>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Quick Actions */}
          <IconButton
            color="inherit"
            onClick={() => setTagDialogOpen(true)}
            title="Add Tags"
          >
            <LabelIcon />
          </IconButton>

          <IconButton
            color="inherit"
            onClick={() => setStatusDialogOpen(true)}
            title="Update Status"
          >
            <EditIcon />
          </IconButton>

          <IconButton
            color="inherit"
            onClick={() => setDeleteDialogOpen(true)}
            title="Delete Contacts"
          >
            <DeleteIcon />
          </IconButton>

          {/* More Actions Menu */}
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            title="More Actions"
          >
            <MoreVertIcon />
          </IconButton>

          {/* Close Selection */}
          <IconButton
            color="inherit"
            onClick={clearSelection}
            title="Clear Selection"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* More Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 },
        }}
      >
        <MenuItem onClick={() => setPriorityDialogOpen(true)}>
          <ListItemIcon>
            <StarIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Set Priority</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleArchive}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Archive Contacts</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleUnarchive}>
          <ListItemIcon>
            <UnarchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Unarchive Contacts</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleExport}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Contacts</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => console.log('Send email to selected contacts')}
        >
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => console.log('Send message to selected contacts')}
        >
          <ListItemIcon>
            <MessageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Message</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Contacts</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedContacts.length} contact
            {selectedContacts.length !== 1 ? 's' : ''}? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Tag Dialog */}
      <Dialog
        open={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Tag to Contacts</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Add a tag to {selectedContacts.length} selected contact
            {selectedContacts.length !== 1 ? 's' : ''}:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Tag</InputLabel>
            <Select
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              label="Select Tag"
            >
              {tags.map(tag => (
                <MenuItem key={tag.id} value={tag.name}>
                  {tag.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddTag}
            variant="contained"
            disabled={!selectedTag}
          >
            Add Tag
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Contact Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Update status for {selectedContacts.length} selected contact
            {selectedContacts.length !== 1 ? 's' : ''}:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as ContactStatus)}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Priority Dialog */}
      <Dialog
        open={priorityDialogOpen}
        onClose={() => setPriorityDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set Contact Priority</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Set priority for {selectedContacts.length} selected contact
            {selectedContacts.length !== 1 ? 's' : ''}:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={selectedPriority}
              onChange={e =>
                setSelectedPriority(e.target.value as ContactPriority)
              }
              label="Priority"
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriorityDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdatePriority} variant="contained">
            Set Priority
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BulkActionsToolbar
