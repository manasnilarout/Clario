import React, { useState } from 'react'
import {
  Box,
  Chip,
  Collapse,
  Typography,
  Button,
  Popover,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material'
import {
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import { useContactsStore } from '../../../store/contactsStore'
import {
  ContactStatus,
  ContactPriority,
  ContactSource,
} from '../../../types/contact'

const ContactsFilters: React.FC = () => {
  const { filter, contacts, tags, setFilter, clearFilter } = useContactsStore()

  const [isExpanded, setIsExpanded] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('')

  // Get unique companies from contacts
  const companies = Array.from(
    new Set(contacts.map(c => c.company).filter(Boolean))
  )

  const handleFilterClick = (
    event: React.MouseEvent<HTMLElement>,
    filterType: string
  ) => {
    setAnchorEl(event.currentTarget)
    setActiveFilter(filterType)
  }

  const handleFilterClose = () => {
    setAnchorEl(null)
    setActiveFilter('')
  }

  const handleTagFilter = (tagName: string) => {
    const currentTags = filter.tags || []
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName]

    setFilter({ tags: newTags })
  }

  const handleCompanyFilter = (company: string) => {
    const currentCompanies = filter.companies || []
    const newCompanies = currentCompanies.includes(company)
      ? currentCompanies.filter(c => c !== company)
      : [...currentCompanies, company]

    setFilter({ companies: newCompanies })
  }

  const handleStatusFilter = (status: ContactStatus) => {
    const currentStatuses = filter.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]

    setFilter({ status: newStatuses })
  }

  const handlePriorityFilter = (priority: ContactPriority) => {
    const currentPriorities = filter.priority || []
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority]

    setFilter({ priority: newPriorities })
  }

  const handleSourceFilter = (source: ContactSource) => {
    const currentSources = filter.source || []
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source]

    setFilter({ source: newSources })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filter.tags?.length) count += filter.tags.length
    if (filter.companies?.length) count += filter.companies.length
    if (filter.status?.length) count += filter.status.length
    if (filter.priority?.length) count += filter.priority.length
    if (filter.source?.length) count += filter.source.length
    if (filter.isFavorite !== undefined) count += 1
    if (filter.hasEmail !== undefined) count += 1
    if (filter.hasPhone !== undefined) count += 1
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  const renderFilterPopover = () => {
    if (!activeFilter) return null

    let items: any[] = []
    let selectedItems: string[] = []
    let onItemClick: (item: any) => void = () => {}

    switch (activeFilter) {
      case 'tags':
        items = tags.map(tag => tag.name)
        selectedItems = filter.tags || []
        onItemClick = handleTagFilter
        break
      case 'companies':
        items = companies
        selectedItems = filter.companies || []
        onItemClick = handleCompanyFilter
        break
      case 'status':
        items = ['active', 'inactive', 'archived']
        selectedItems = filter.status || []
        onItemClick = handleStatusFilter
        break
      case 'priority':
        items = ['high', 'medium', 'low']
        selectedItems = filter.priority || []
        onItemClick = handlePriorityFilter
        break
      case 'source':
        items = ['manual', 'import', 'linkedin', 'email', 'referral', 'event']
        selectedItems = filter.source || []
        onItemClick = handleSourceFilter
        break
    }

    return (
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { minWidth: 200, maxHeight: 300 },
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ p: 1, fontWeight: 'bold' }}>
            Filter by {activeFilter}
          </Typography>
          <List dense>
            {items.map(item => (
              <ListItem
                key={item}
                onClick={() => onItemClick(item)}
                sx={{ cursor: 'pointer', borderRadius: 1 }}
              >
                <Checkbox
                  checked={selectedItems.includes(item)}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>
    )
  }

  return (
    <Box>
      {/* Filter Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Button
          startIcon={<FilterIcon />}
          endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outlined"
          size="small"
          sx={{ mr: 2 }}
        >
          Filters
          {activeFiltersCount > 0 && (
            <Chip
              label={activeFiltersCount}
              size="small"
              color="primary"
              sx={{ ml: 1, height: 20 }}
            />
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            startIcon={<ClearIcon />}
            onClick={clearFilter}
            size="small"
            color="secondary"
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Filters Content */}
      <Collapse in={isExpanded}>
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            mb: 2,
          }}
        >
          {/* Quick Filters */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Filters
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant={
                  filter.tags?.includes('vip') ? 'contained' : 'outlined'
                }
                onClick={() => handleTagFilter('vip')}
              >
                VIP Contacts
              </Button>
              <Button
                size="small"
                variant={filter.isFavorite ? 'contained' : 'outlined'}
                onClick={() =>
                  setFilter({
                    isFavorite: filter.isFavorite ? undefined : true,
                  })
                }
              >
                Favorites
              </Button>
              <Button
                size="small"
                variant={
                  filter.status?.includes('active') ? 'contained' : 'outlined'
                }
                onClick={() => handleStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                size="small"
                variant={
                  filter.priority?.includes('high') ? 'contained' : 'outlined'
                }
                onClick={() => handlePriorityFilter('high')}
              >
                High Priority
              </Button>
            </Box>
          </Box>

          {/* Filter Categories */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={e => handleFilterClick(e, 'tags')}
              endIcon={
                filter.tags?.length ? (
                  <Chip label={filter.tags.length} size="small" />
                ) : undefined
              }
            >
              Tags
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={e => handleFilterClick(e, 'companies')}
              endIcon={
                filter.companies?.length ? (
                  <Chip label={filter.companies.length} size="small" />
                ) : undefined
              }
            >
              Companies
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={e => handleFilterClick(e, 'status')}
              endIcon={
                filter.status?.length ? (
                  <Chip label={filter.status.length} size="small" />
                ) : undefined
              }
            >
              Status
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={e => handleFilterClick(e, 'priority')}
              endIcon={
                filter.priority?.length ? (
                  <Chip label={filter.priority.length} size="small" />
                ) : undefined
              }
            >
              Priority
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={e => handleFilterClick(e, 'source')}
              endIcon={
                filter.source?.length ? (
                  <Chip label={filter.source.length} size="small" />
                ) : undefined
              }
            >
              Source
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Toggle Filters */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filter.hasEmail === true}
                  onChange={e =>
                    setFilter({ hasEmail: e.target.checked ? true : undefined })
                  }
                  size="small"
                />
              }
              label="Has Email"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filter.hasPhone === true}
                  onChange={e =>
                    setFilter({ hasPhone: e.target.checked ? true : undefined })
                  }
                  size="small"
                />
              }
              label="Has Phone"
            />
          </Box>
        </Box>
      </Collapse>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && !isExpanded && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {filter.tags?.map(tag => (
            <Chip
              key={tag}
              label={`Tag: ${tag}`}
              size="small"
              onDelete={() => handleTagFilter(tag)}
              color="primary"
              variant="outlined"
            />
          ))}
          {filter.companies?.map(company => (
            <Chip
              key={company}
              label={`Company: ${company}`}
              size="small"
              onDelete={() => handleCompanyFilter(company)}
              color="primary"
              variant="outlined"
            />
          ))}
          {filter.status?.map(status => (
            <Chip
              key={status}
              label={`Status: ${status}`}
              size="small"
              onDelete={() => handleStatusFilter(status)}
              color="primary"
              variant="outlined"
            />
          ))}
          {filter.priority?.map(priority => (
            <Chip
              key={priority}
              label={`Priority: ${priority}`}
              size="small"
              onDelete={() => handlePriorityFilter(priority)}
              color="primary"
              variant="outlined"
            />
          ))}
          {filter.isFavorite && (
            <Chip
              label="Favorites Only"
              size="small"
              onDelete={() => setFilter({ isFavorite: undefined })}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {renderFilterPopover()}
    </Box>
  )
}

export default ContactsFilters
