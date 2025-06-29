import React from 'react'
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Box,
  Checkbox,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import { Contact } from '../../../types/contact'
import { useContactsStore } from '../../../store/contactsStore'

interface ContactCardProps {
  contact: Contact
  isSelected?: boolean
  onSelect?: (id: string) => void
  onDeselect?: (id: string) => void
  onClick?: (contact: Contact) => void
  showCheckbox?: boolean
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isSelected = false,
  onSelect,
  onDeselect,
  onClick,
  showCheckbox = false,
}) => {
  const { toggleFavorite, setEditing, deleteContact } = useContactsStore()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await toggleFavorite(contact.id)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleEdit = () => {
    setEditing(contact.id)
    handleMenuClose()
  }

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`
      )
    ) {
      try {
        await deleteContact(contact.id)
      } catch (error) {
        console.error('Failed to delete contact:', error)
      }
    }
    handleMenuClose()
  }

  const handleView = () => {
    if (onClick) {
      onClick(contact)
    }
    handleMenuClose()
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()
    if (event.target.checked && onSelect) {
      onSelect(contact.id)
    } else if (!event.target.checked && onDeselect) {
      onDeselect(contact.id)
    }
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(contact)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'warning'
      case 'archived':
        return 'default'
      default:
        return 'default'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? 4 : 1,
        border: isSelected ? 2 : 0,
        borderColor: isSelected ? 'primary.main' : 'transparent',
        '&:hover': {
          boxShadow: 4,
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header with Avatar and Actions */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          {showCheckbox && (
            <Checkbox
              checked={isSelected}
              onChange={handleCheckboxChange}
              size="small"
              sx={{ p: 0, mr: 1 }}
              onClick={e => e.stopPropagation()}
            />
          )}

          <Avatar
            src={contact.avatar}
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              bgcolor: contact.avatar ? 'transparent' : 'primary.main',
            }}
          >
            {!contact.avatar &&
              getInitials(contact.firstName, contact.lastName)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {contact.firstName} {contact.lastName}
            </Typography>
            {contact.position && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {contact.position}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Fade in={isHovered || contact.isFavorite}>
              <IconButton
                size="small"
                onClick={handleToggleFavorite}
                sx={{
                  color: contact.isFavorite ? 'warning.main' : 'text.secondary',
                }}
              >
                {contact.isFavorite ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </Fade>

            <Fade in={isHovered}>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{ ml: 0.5 }}
              >
                <MoreVertIcon />
              </IconButton>
            </Fade>
          </Box>
        </Box>

        {/* Company */}
        {contact.company && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BusinessIcon
              sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }}
            />
            <Typography variant="body2" color="text.secondary" noWrap>
              {contact.company}
            </Typography>
          </Box>
        )}

        {/* Contact Information */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" noWrap sx={{ flex: 1 }}>
              {contact.email}
            </Typography>
          </Box>

          {contact.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <PhoneIcon
                sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }}
              />
              <Typography variant="body2" noWrap>
                {contact.phone}
              </Typography>
            </Box>
          )}

          {contact.address?.city && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon
                sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }}
              />
              <Typography variant="body2" color="text.secondary" noWrap>
                {contact.address.city}
                {contact.address.state && `, ${contact.address.state}`}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Tags */}
        {contact.tags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {contact.tags.slice(0, 3).map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
              {contact.tags.length > 3 && (
                <Tooltip title={contact.tags.slice(3).join(', ')}>
                  <Chip
                    label={`+${contact.tags.length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
        )}

        {/* Status and Priority */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Chip
            label={contact.status}
            size="small"
            color={getStatusColor(contact.status) as any}
            variant="filled"
          />

          {contact.priority && (
            <Chip
              label={contact.priority}
              size="small"
              color={getPriorityColor(contact.priority) as any}
              variant="outlined"
            />
          )}
        </Box>

        {/* Last Contacted */}
        {contact.lastContactedAt && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Last contacted:{' '}
            {new Date(contact.lastContactedAt).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 160 },
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Contact</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Contact</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  )
}

export default ContactCard
