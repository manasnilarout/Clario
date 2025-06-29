export interface ContactAddress {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface ContactSocialLinks {
  linkedin?: string
  twitter?: string
  website?: string
  instagram?: string
  facebook?: string
}

export type ContactStatus = 'active' | 'inactive' | 'archived'
export type ContactPriority = 'low' | 'medium' | 'high'
export type ContactSource =
  | 'manual'
  | 'import'
  | 'linkedin'
  | 'email'
  | 'referral'
  | 'event'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  position?: string
  tags: string[]
  avatar?: string
  notes?: string
  socialLinks?: ContactSocialLinks
  address?: ContactAddress
  customFields?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  lastContactedAt?: Date
  isFavorite: boolean
  status: ContactStatus
  source?: ContactSource
  priority?: ContactPriority
  birthday?: Date
  timezone?: string
  language?: string
  department?: string
}

export interface ContactTag {
  id: string
  name: string
  color: string
  description?: string
  createdAt: Date
}

export interface ContactCategory {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  isDefault: boolean
}

export interface ContactInteraction {
  id: string
  contactId: string
  type: 'email' | 'call' | 'meeting' | 'message' | 'note'
  subject?: string
  content?: string
  date: Date
  duration?: number // in minutes
  outcome?: string
  createdBy: string
}

export interface ContactFilter {
  searchQuery?: string
  tags?: string[]
  companies?: string[]
  status?: ContactStatus[]
  priority?: ContactPriority[]
  source?: ContactSource[]
  isFavorite?: boolean
  hasEmail?: boolean
  hasPhone?: boolean
  createdDateRange?: {
    start: Date
    end: Date
  }
  lastContactedRange?: {
    start: Date
    end: Date
  }
  cities?: string[]
  countries?: string[]
}

export interface ContactSortOption {
  field: keyof Contact
  direction: 'asc' | 'desc'
}

export type ContactViewMode = 'grid' | 'list' | 'table' | 'compact'

export interface ContactListState {
  contacts: Contact[]
  filteredContacts: Contact[]
  selectedContacts: string[]
  viewMode: ContactViewMode
  sortBy: ContactSortOption
  filter: ContactFilter
  searchQuery: string
  isLoading: boolean
  error?: string
  totalCount: number
  currentPage: number
  itemsPerPage: number
}

export interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  position?: string
  tags: string[]
  notes?: string
  socialLinks?: ContactSocialLinks
  address?: ContactAddress
  customFields?: Record<string, any>
  isFavorite: boolean
  status: ContactStatus
  priority?: ContactPriority
  birthday?: Date
  timezone?: string
  language?: string
  department?: string
}

export interface ContactValidationError {
  field: keyof ContactFormData
  message: string
}

export interface ContactImportData {
  file: File
  format: 'csv' | 'vcard' | 'json'
  fieldMapping: Record<string, keyof Contact>
  duplicateStrategy: 'skip' | 'update' | 'create'
  preview: Partial<Contact>[]
}

export interface ContactExportOptions {
  format: 'csv' | 'vcard' | 'json' | 'pdf'
  fields: (keyof Contact)[]
  includeHeaders: boolean
  dateFormat: string
  contactIds?: string[]
}

export interface ContactStats {
  totalContacts: number
  activeContacts: number
  inactiveContacts: number
  archivedContacts: number
  favoriteContacts: number
  contactsWithEmail: number
  contactsWithPhone: number
  recentlyAdded: number
  recentlyContacted: number
  topCompanies: Array<{ name: string; count: number }>
  topTags: Array<{ name: string; count: number }>
  contactsBySource: Array<{ source: ContactSource; count: number }>
  contactsByPriority: Array<{ priority: ContactPriority; count: number }>
}

export interface ContactSearchResult {
  contact: Contact
  matchedFields: string[]
  score: number
}

export interface ContactBulkOperation {
  type:
    | 'delete'
    | 'archive'
    | 'restore'
    | 'addTag'
    | 'removeTag'
    | 'updateStatus'
    | 'updatePriority'
    | 'export'
  contactIds: string[]
  payload?: any
}

export interface ContactQuickAction {
  id: string
  label: string
  icon: string
  action: (contact: Contact) => void
  isVisible: (contact: Contact) => boolean
  variant?: 'default' | 'primary' | 'secondary' | 'danger'
}
