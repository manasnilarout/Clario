import { create } from 'zustand'
import { Contact, ContactFilters, ContactFormData } from '../types'

interface ContactsState {
  contacts: Contact[]
  selectedContact: Contact | null
  filters: ContactFilters
  isLoading: boolean
  error: string | null
}

interface ContactsActions {
  // CRUD operations
  addContact: (contactData: ContactFormData) => void
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContact: (id: string) => void

  // Selection and filtering
  selectContact: (contact: Contact | null) => void
  setFilters: (filters: Partial<ContactFilters>) => void
  clearFilters: () => void

  // Data fetching
  fetchContacts: () => Promise<void>
  searchContacts: (query: string) => Contact[]

  // Utility
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type ContactsStore = ContactsState & ContactsActions

export const useContactsStore = create<ContactsStore>((set, get) => ({
  // State
  contacts: [],
  selectedContact: null,
  filters: {},
  isLoading: false,
  error: null,

  // Actions
  addContact: (contactData: ContactFormData) => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      ...contactData,
      lastContact: new Date(),
      socialProfiles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set(state => ({
      contacts: [...state.contacts, newContact],
    }))
  },

  updateContact: (id: string, updates: Partial<Contact>) => {
    set(state => ({
      contacts: state.contacts.map(contact =>
        contact.id === id
          ? { ...contact, ...updates, updatedAt: new Date() }
          : contact
      ),
      selectedContact:
        state.selectedContact?.id === id
          ? { ...state.selectedContact, ...updates, updatedAt: new Date() }
          : state.selectedContact,
    }))
  },

  deleteContact: (id: string) => {
    set(state => ({
      contacts: state.contacts.filter(contact => contact.id !== id),
      selectedContact:
        state.selectedContact?.id === id ? null : state.selectedContact,
    }))
  },

  selectContact: (contact: Contact | null) => {
    set({ selectedContact: contact })
  },

  setFilters: (filters: Partial<ContactFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  clearFilters: () => {
    set({ filters: {} })
  },

  fetchContacts: async () => {
    set({ isLoading: true, error: null })
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock data will be loaded from mock service
      set({ isLoading: false })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch contacts',
        isLoading: false,
      })
    }
  },

  searchContacts: (query: string) => {
    const { contacts } = get()
    const lowerQuery = query.toLowerCase()

    return contacts.filter(
      contact =>
        contact.firstName.toLowerCase().includes(lowerQuery) ||
        contact.lastName.toLowerCase().includes(lowerQuery) ||
        contact.email.toLowerCase().includes(lowerQuery) ||
        contact.company?.toLowerCase().includes(lowerQuery) ||
        contact.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))
