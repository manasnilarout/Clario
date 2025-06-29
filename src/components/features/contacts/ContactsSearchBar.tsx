import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Divider,
  ClickAwayListener,
  Fade,
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import { useContactsStore } from '../../../store/contactsStore'
import { Contact, ContactSearchResult } from '../../../types/contact'

interface ContactsSearchBarProps {
  placeholder?: string
  autoFocus?: boolean
}

const ContactsSearchBar: React.FC<ContactsSearchBarProps> = ({
  placeholder = 'Search contacts by name, email, company, or tags...',
  autoFocus = false,
}) => {
  const { searchQuery, searchContacts, setSearchQuery, contacts } =
    useContactsStore()

  const [inputValue, setInputValue] = useState(searchQuery)
  const [isOpen, setIsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<ContactSearchResult[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  // Debounced search
  const [debouncedValue, setDebouncedValue] = useState(inputValue)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue])

  useEffect(() => {
    if (debouncedValue !== searchQuery) {
      setSearchQuery(debouncedValue)
    }
  }, [debouncedValue, searchQuery, setSearchQuery])

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('contacts-search-history')
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.warn('Failed to parse search history:', error)
      }
    }
  }, [])

  // Save search history to localStorage
  const saveSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return

    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(
        0,
        10
      )
      localStorage.setItem(
        'contacts-search-history',
        JSON.stringify(newHistory)
      )
      return newHistory
    })
  }, [])

  // Perform search when input has value
  useEffect(() => {
    if (inputValue.trim()) {
      const contacts = searchContacts(inputValue)
      const results: ContactSearchResult[] = contacts.map(contact => ({
        contact,
        matchedFields: [],
        score: 1,
      }))
      setSearchResults(results)
      setIsOpen(true)
    } else {
      setSearchResults([])
      setIsOpen(false)
    }
  }, [inputValue, searchContacts])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value)
  }

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setAnchorEl(event.currentTarget)
    if (inputValue.trim() || searchHistory.length > 0) {
      setIsOpen(true)
    }
  }

  const handleInputKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      const query = inputValue.trim()
      if (query) {
        saveSearchHistory(query)
        setIsOpen(false)
        setSearchQuery(query)
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handleClearSearch = () => {
    setInputValue('')
    setSearchQuery('')
    setSearchResults([])
    setIsOpen(false)
  }

  const handleContactSelect = (contact: Contact) => {
    setInputValue(`${contact.firstName} ${contact.lastName}`)
    saveSearchHistory(`${contact.firstName} ${contact.lastName}`)
    setSearchQuery(`${contact.firstName} ${contact.lastName}`)
    setIsOpen(false)
  }

  const handleHistorySelect = (query: string) => {
    setInputValue(query)
    setSearchQuery(query)
    setIsOpen(false)
  }

  const handleClickAway = () => {
    setIsOpen(false)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const highlightMatchedText = (text: string, query: string) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: 'rgba(255, 193, 7, 0.3)' }}>
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  const getPopularSearches = () => {
    // Get most common tags and companies for suggestions
    const tagCount: Record<string, number> = {}
    const companyCount: Record<string, number> = {}

    contacts.forEach(contact => {
      contact.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
      if (contact.company) {
        companyCount[contact.company] = (companyCount[contact.company] || 0) + 1
      }
    })

    const popularTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag)

    const popularCompanies = Object.entries(companyCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([company]) => company)

    return [...popularTags, ...popularCompanies]
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          fullWidth
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyPress={handleInputKeyPress}
          placeholder={placeholder}
          autoFocus={autoFocus}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: inputValue && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            },
          }}
        />

        <Popper
          open={isOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={150}>
              <Paper
                elevation={8}
                sx={{
                  mt: 1,
                  maxHeight: 400,
                  overflow: 'auto',
                  borderRadius: 2,
                }}
              >
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <>
                    <Box sx={{ p: 2, pb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Contacts ({searchResults.length})
                      </Typography>
                    </Box>
                    <List dense>
                      {searchResults.slice(0, 5).map(({ contact }) => (
                        <ListItem
                          key={contact.id}
                          onClick={() => handleContactSelect(contact)}
                          sx={{
                            py: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              src={contact.avatar}
                              sx={{ width: 32, height: 32 }}
                            >
                              {!contact.avatar &&
                                getInitials(
                                  contact.firstName,
                                  contact.lastName
                                )}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                {highlightMatchedText(
                                  `${contact.firstName} ${contact.lastName}`,
                                  inputValue
                                )}
                              </Typography>
                            }
                            secondary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 0.5,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {highlightMatchedText(
                                    contact.company || contact.email,
                                    inputValue
                                  )}
                                </Typography>
                                {contact.tags.length > 0 && (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      gap: 0.5,
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    {contact.tags.slice(0, 3).map(tag => (
                                      <Chip
                                        key={tag}
                                        label={highlightMatchedText(
                                          tag,
                                          inputValue
                                        )}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.65rem', height: 16 }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {/* Search History */}
                {!inputValue && searchHistory.length > 0 && (
                  <>
                    {searchResults.length > 0 && <Divider />}
                    <Box sx={{ p: 2, pb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        <HistoryIcon
                          sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }}
                        />
                        Recent Searches
                      </Typography>
                    </Box>
                    <List dense>
                      {searchHistory.slice(0, 5).map((query, index) => (
                        <ListItem
                          key={index}
                          onClick={() => handleHistorySelect(query)}
                          sx={{
                            py: 0.5,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {query}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {/* Popular Searches */}
                {!inputValue && searchHistory.length === 0 && (
                  <>
                    <Box sx={{ p: 2, pb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        <TrendingUpIcon
                          sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }}
                        />
                        Popular Searches
                      </Typography>
                    </Box>
                    <List dense>
                      {getPopularSearches()
                        .slice(0, 5)
                        .map((suggestion, index) => (
                          <ListItem
                            key={index}
                            onClick={() => handleHistorySelect(suggestion)}
                            sx={{
                              py: 0.5,
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {suggestion}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  </>
                )}

                {/* No Results */}
                {inputValue && searchResults.length === 0 && (
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                    >
                      No contacts found for "{inputValue}"
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  )
}

export default ContactsSearchBar
