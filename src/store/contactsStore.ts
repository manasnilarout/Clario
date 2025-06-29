import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  Contact,
  ContactFilter,
  ContactSortOption,
  ContactViewMode,
  ContactFormData,
  ContactStats,
  ContactTag,
  ContactCategory,
} from '../types/contact'
import { contactsService } from '../services/contactsService'

interface ContactsState {
  // Core data
  contacts: Contact[]
  filteredContacts: Contact[]
  selectedContacts: string[]

  // UI state
  viewMode: ContactViewMode
  sortBy: ContactSortOption
  filter: ContactFilter
  searchQuery: string
  isLoading: boolean
  error?: string
  currentPage: number
  itemsPerPage: number
  totalCount: number

  // Modal states
  isCreating: boolean
  isEditing: boolean
  editingContactId: string | null

  // Related data
  tags: ContactTag[]
  categories: ContactCategory[]
  stats: ContactStats | null

  // Actions
  loadContacts: () => Promise<void>
  createContact: (contactData: ContactFormData) => Promise<Contact>
  updateContact: (
    id: string,
    contactData: Partial<ContactFormData>
  ) => Promise<Contact>
  deleteContact: (id: string) => Promise<void>
  deleteMultipleContacts: (ids: string[]) => Promise<void>

  setSearchQuery: (query: string) => void
  setFilter: (filter: Partial<ContactFilter>) => void
  clearFilter: () => void
  searchContacts: (query: string) => Contact[]

  setSortBy: (sort: ContactSortOption) => void
  setViewMode: (mode: ContactViewMode) => void

  selectContact: (id: string) => void
  deselectContact: (id: string) => void
  clearSelection: () => void
  selectAll: () => void

  toggleFavorite: (id: string) => Promise<void>

  loadTags: () => Promise<void>
  loadCategories: () => Promise<void>
  loadStats: () => Promise<void>

  setCreating: (isCreating: boolean) => void
  setEditing: (contactId: string | null) => void

  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void

  getContactById: (id: string) => Contact | undefined
  getFilteredContacts: () => Contact[]
  refreshContacts: () => Promise<void>
}

const defaultFilter: ContactFilter = {
  searchQuery: '',
  tags: [],
  companies: [],
  status: [],
  priority: [],
  source: [],
  isFavorite: undefined,
  hasEmail: undefined,
  hasPhone: undefined,
}

const defaultSort: ContactSortOption = {
  field: 'updatedAt',
  direction: 'desc',
}

export const useContactsStore = create<ContactsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      contacts: [],
      filteredContacts: [],
      selectedContacts: [],
      viewMode: 'grid',
      sortBy: defaultSort,
      filter: defaultFilter,
      searchQuery: '',
      isLoading: false,
      error: undefined,
      currentPage: 1,
      itemsPerPage: 20,
      totalCount: 0,
      isCreating: false,
      isEditing: false,
      editingContactId: null,
      tags: [],
      categories: [],
      stats: null,

      // Actions
      loadContacts: async () => {
        set({ isLoading: true, error: undefined })

        try {
          const contacts = await contactsService.getContacts()
          set({
            contacts,
            totalCount: contacts.length,
            isLoading: false,
          })

          get().getFilteredContacts()
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load contacts',
            isLoading: false,
          })
        }
      },

      createContact: async (contactData: ContactFormData) => {
        set({ isLoading: true, error: undefined })

        try {
          const newContact = await contactsService.createContact(contactData)
          const { contacts } = get()
          set({
            contacts: [newContact, ...contacts],
            totalCount: contacts.length + 1,
            isLoading: false,
            isCreating: false,
          })

          get().getFilteredContacts()
          return newContact
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create contact',
            isLoading: false,
          })
          throw error
        }
      },

      updateContact: async (
        id: string,
        contactData: Partial<ContactFormData>
      ) => {
        set({ isLoading: true, error: undefined })

        try {
          const updatedContact = await contactsService.updateContact(
            id,
            contactData
          )
          const { contacts } = get()
          const updatedContacts = contacts.map(c =>
            c.id === id ? updatedContact : c
          )

          set({
            contacts: updatedContacts,
            isLoading: false,
            editingContactId: null,
          })

          get().getFilteredContacts()
          return updatedContact
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update contact',
            isLoading: false,
          })
          throw error
        }
      },

      deleteContact: async (id: string) => {
        try {
          await contactsService.deleteContact(id)
          const { contacts, selectedContacts } = get()

          set({
            contacts: contacts.filter(c => c.id !== id),
            selectedContacts: selectedContacts.filter(cId => cId !== id),
            totalCount: contacts.length - 1,
          })

          get().getFilteredContacts()
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete contact',
          })
          throw error
        }
      },

      deleteMultipleContacts: async (ids: string[]) => {
        try {
          await Promise.all(ids.map(id => contactsService.deleteContact(id)))
          const { contacts } = get()

          set({
            contacts: contacts.filter(c => !ids.includes(c.id)),
            selectedContacts: [],
            totalCount: contacts.length - ids.length,
          })

          get().getFilteredContacts()
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete contacts',
          })
          throw error
        }
      },

      setSearchQuery: (query: string) => {
        set({
          searchQuery: query,
          filter: { ...get().filter, searchQuery: query },
          currentPage: 1,
        })
        get().getFilteredContacts()
      },

      setFilter: (newFilter: Partial<ContactFilter>) => {
        const currentFilter = get().filter
        set({
          filter: { ...currentFilter, ...newFilter },
          currentPage: 1,
        })
        get().getFilteredContacts()
      },

      clearFilter: () => {
        set({
          filter: { ...defaultFilter },
          searchQuery: '',
          currentPage: 1,
        })
        get().getFilteredContacts()
      },

      searchContacts: (query: string) => {
        const { contacts } = get()
        if (!query.trim()) return []

        const searchTerms = query.toLowerCase().split(' ')

        return contacts.filter(contact => {
          const searchableText = [
            contact.firstName,
            contact.lastName,
            contact.email,
            contact.phone,
            contact.company,
            contact.position,
            contact.notes,
            ...contact.tags,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return searchTerms.every(term => searchableText.includes(term))
        })
      },

      setSortBy: (sort: ContactSortOption) => {
        set({ sortBy: sort })
        get().getFilteredContacts()
      },

      setViewMode: (mode: ContactViewMode) => {
        set({ viewMode: mode })
      },

      selectContact: (id: string) => {
        const { selectedContacts } = get()
        if (!selectedContacts.includes(id)) {
          set({ selectedContacts: [...selectedContacts, id] })
        }
      },

      deselectContact: (id: string) => {
        const { selectedContacts } = get()
        set({ selectedContacts: selectedContacts.filter(cId => cId !== id) })
      },

      clearSelection: () => {
        set({ selectedContacts: [] })
      },

      selectAll: () => {
        const { filteredContacts } = get()
        set({ selectedContacts: filteredContacts.map(c => c.id) })
      },

      toggleFavorite: async (id: string) => {
        const contact = get().getContactById(id)
        if (!contact) return

        try {
          await get().updateContact(id, { isFavorite: !contact.isFavorite })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update favorite',
          })
          throw error
        }
      },

      loadTags: async () => {
        try {
          const tags = await contactsService.getTags()
          set({ tags })
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to load tags',
          })
        }
      },

      loadCategories: async () => {
        try {
          const categories = await contactsService.getCategories()
          set({ categories })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load categories',
          })
        }
      },

      loadStats: async () => {
        try {
          const stats = await contactsService.getContactStats()
          set({ stats })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load statistics',
          })
        }
      },

      setCreating: (isCreating: boolean) => {
        set({ isCreating })
      },

      setEditing: (contactId: string | null) => {
        set({
          editingContactId: contactId,
          isEditing: contactId !== null,
        })
      },

      setCurrentPage: (page: number) => {
        set({ currentPage: page })
      },

      setItemsPerPage: (count: number) => {
        set({
          itemsPerPage: count,
          currentPage: 1,
        })
      },

      getContactById: (id: string) => {
        return get().contacts.find(c => c.id === id)
      },

      getFilteredContacts: () => {
        const { contacts, filter, sortBy } = get()

        let filtered = [...contacts]

        // Apply search query
        if (filter.searchQuery) {
          const searchResults = get().searchContacts(filter.searchQuery)
          filtered = searchResults
        }

        // Apply filters
        if (filter.tags && filter.tags.length > 0) {
          filtered = filtered.filter(contact =>
            filter.tags!.some(tag => contact.tags.includes(tag))
          )
        }

        if (filter.companies && filter.companies.length > 0) {
          filtered = filtered.filter(
            contact =>
              contact.company && filter.companies!.includes(contact.company)
          )
        }

        if (filter.status && filter.status.length > 0) {
          filtered = filtered.filter(contact =>
            filter.status!.includes(contact.status)
          )
        }

        if (filter.priority && filter.priority.length > 0) {
          filtered = filtered.filter(
            contact =>
              contact.priority && filter.priority!.includes(contact.priority)
          )
        }

        if (filter.isFavorite !== undefined) {
          filtered = filtered.filter(
            contact => contact.isFavorite === filter.isFavorite
          )
        }

        if (filter.hasEmail !== undefined) {
          filtered = filtered.filter(contact =>
            filter.hasEmail ? !!contact.email : !contact.email
          )
        }

        if (filter.hasPhone !== undefined) {
          filtered = filtered.filter(contact =>
            filter.hasPhone ? !!contact.phone : !contact.phone
          )
        }

        // Apply sorting
        filtered.sort((a, b) => {
          const aValue = a[sortBy.field]
          const bValue = b[sortBy.field]

          if (aValue === bValue) return 0
          if (aValue === undefined || aValue === null) return 1
          if (bValue === undefined || bValue === null) return -1

          let comparison = 0
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue)
          } else if (aValue instanceof Date && bValue instanceof Date) {
            comparison = aValue.getTime() - bValue.getTime()
          } else {
            comparison = aValue < bValue ? -1 : 1
          }

          return sortBy.direction === 'desc' ? -comparison : comparison
        })

        set({ filteredContacts: filtered })
        return filtered
      },

      refreshContacts: async () => {
        await get().loadContacts()
        await get().loadStats()
      },
    }),
    {
      name: 'contacts-store',
    }
  )
)
