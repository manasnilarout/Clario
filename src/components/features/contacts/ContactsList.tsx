import React from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  TableSortLabel,
} from '@mui/material'
import {
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  TableChart as TableChartIcon,
  ViewComfy as ViewComfyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'
import { Contact, ContactViewMode } from '../../../types/contact'
import { useContactsStore } from '../../../store/contactsStore'
import ContactCard from './ContactCard'
import { NoContacts, NoSearchResults } from '../../common/EmptyState'

interface ContactsListProps {
  onContactClick?: (contact: Contact) => void
}

const ContactsList: React.FC<ContactsListProps> = ({ onContactClick }) => {
  const {
    filteredContacts,
    contacts,
    searchQuery,
    viewMode,
    sortBy,
    selectedContacts,
    currentPage,
    itemsPerPage,
    isLoading,
    setViewMode,
    setSortBy,
    selectContact,
    deselectContact,
    clearSelection,
    selectAll,
    setCurrentPage,
    setItemsPerPage,
    setCreating,
    clearFilter,
  } = useContactsStore()

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage)

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: ContactViewMode | null
  ) => {
    if (newViewMode) {
      setViewMode(newViewMode)
    }
  }

  const handleSortChange = (field: keyof Contact) => {
    const newDirection =
      sortBy.field === field && sortBy.direction === 'asc' ? 'desc' : 'asc'
    setSortBy({ field, direction: newDirection })
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      selectAll()
    } else {
      clearSelection()
    }
  }

  const handleContactSelect = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      deselectContact(contactId)
    } else {
      selectContact(contactId)
    }
  }

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (event: any) => {
    setItemsPerPage(event.target.value)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (isLoading && filteredContacts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Loading contacts...</Typography>
      </Box>
    )
  }

  if (filteredContacts.length === 0) {
    // Show different empty states based on the situation
    if (contacts.length === 0) {
      // No contacts at all
      return <NoContacts onAddContact={() => setCreating(true)} />
    } else if (
      searchQuery ||
      Object.values(useContactsStore.getState().filter).some(
        v => v && (Array.isArray(v) ? v.length > 0 : true)
      )
    ) {
      // No results for current search/filter
      return (
        <NoSearchResults
          searchTerm={searchQuery}
          onClearSearch={() => clearFilter()}
        />
      )
    }

    return <NoContacts onAddContact={() => setCreating(true)} />
  }

  const renderViewModeToggle = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
      }}
    >
      <Typography variant="h6">
        {filteredContacts.length} contact
        {filteredContacts.length !== 1 ? 's' : ''}
        {selectedContacts.length > 0 && (
          <Typography component="span" color="primary" sx={{ ml: 1 }}>
            ({selectedContacts.length} selected)
          </Typography>
        )}
      </Typography>

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewModeChange}
        size="small"
      >
        <ToggleButton value="grid" aria-label="grid view">
          <GridViewIcon />
        </ToggleButton>
        <ToggleButton value="list" aria-label="list view">
          <ViewListIcon />
        </ToggleButton>
        <ToggleButton value="table" aria-label="table view">
          <TableChartIcon />
        </ToggleButton>
        <ToggleButton value="compact" aria-label="compact view">
          <ViewComfyIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )

  const renderGridView = () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {paginatedContacts.map(contact => (
        <ContactCard
          key={contact.id}
          contact={contact}
          isSelected={selectedContacts.includes(contact.id)}
          onSelect={selectContact}
          onDeselect={deselectContact}
          onClick={onContactClick}
          showCheckbox={selectedContacts.length > 0}
        />
      ))}
    </Box>
  )

  const renderListView = () => (
    <Paper>
      <List>
        {paginatedContacts.map((contact, index) => (
          <ListItem
            key={contact.id}
            divider={index < paginatedContacts.length - 1}
            sx={{
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => onContactClick?.(contact)}
            secondaryAction={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {contact.isFavorite && <StarIcon color="warning" />}
                <Chip
                  label={contact.status}
                  size="small"
                  color={contact.status === 'active' ? 'success' : 'default'}
                />
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
            }
          >
            <Checkbox
              checked={selectedContacts.includes(contact.id)}
              onChange={() => handleContactSelect(contact.id)}
              sx={{ mr: 1 }}
            />
            <ListItemAvatar>
              <Avatar src={contact.avatar}>
                {!contact.avatar &&
                  getInitials(contact.firstName, contact.lastName)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">
                    {contact.firstName} {contact.lastName}
                  </Typography>
                  {contact.tags.slice(0, 2).map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {contact.position}{' '}
                    {contact.company && `at ${contact.company}`}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mt: 0.5,
                    }}
                  >
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <EmailIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{contact.email}</Typography>
                    </Box>
                    {contact.phone && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <PhoneIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">
                          {contact.phone}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )

  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={
                  selectedContacts.length > 0 &&
                  selectedContacts.length < filteredContacts.length
                }
                checked={selectedContacts.length === filteredContacts.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy.field === 'firstName'}
                direction={
                  sortBy.field === 'firstName' ? sortBy.direction : 'asc'
                }
                onClick={() => handleSortChange('firstName')}
              >
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy.field === 'company'}
                direction={
                  sortBy.field === 'company' ? sortBy.direction : 'asc'
                }
                onClick={() => handleSortChange('company')}
              >
                Company
              </TableSortLabel>
            </TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Tags</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedContacts.map(contact => (
            <TableRow
              key={contact.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => onContactClick?.(contact)}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => handleContactSelect(contact.id)}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={contact.avatar} sx={{ width: 32, height: 32 }}>
                    {!contact.avatar &&
                      getInitials(contact.firstName, contact.lastName)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {contact.firstName} {contact.lastName}
                    </Typography>
                    {contact.isFavorite && (
                      <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {contact.company && (
                    <BusinessIcon
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                  )}
                  <Typography variant="body2">
                    {contact.company || '-'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {contact.position || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{contact.email}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{contact.phone || '-'}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={contact.status}
                  size="small"
                  color={contact.status === 'active' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {contact.tags.slice(0, 2).map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {contact.tags.length > 2 && (
                    <Typography variant="caption" color="text.secondary">
                      +{contact.tags.length - 2}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const renderCompactView = () => (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 1,
        }}
      >
        {paginatedContacts.map(contact => (
          <Box
            key={contact.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => onContactClick?.(contact)}
          >
            <Checkbox
              size="small"
              checked={selectedContacts.includes(contact.id)}
              onChange={() => handleContactSelect(contact.id)}
              sx={{ mr: 1 }}
            />
            <Avatar src={contact.avatar} sx={{ width: 32, height: 32, mr: 1 }}>
              {!contact.avatar &&
                getInitials(contact.firstName, contact.lastName)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {contact.firstName} {contact.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {contact.company || contact.email}
              </Typography>
            </Box>
            {contact.isFavorite && (
              <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  )

  const renderPagination = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Show:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select value={itemsPerPage} onChange={handleItemsPerPageChange}>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          of {filteredContacts.length} contacts
        </Typography>
      </Box>

      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      )}
    </Box>
  )

  return (
    <Box>
      {renderViewModeToggle()}

      {viewMode === 'grid' && renderGridView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'table' && renderTableView()}
      {viewMode === 'compact' && renderCompactView()}

      {renderPagination()}
    </Box>
  )
}

export default ContactsList
