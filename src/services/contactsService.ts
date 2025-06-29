import {
  Contact,
  ContactFormData,
  ContactTag,
  ContactCategory,
  ContactStats,
  ContactSource,
  ContactStatus,
  ContactPriority,
} from '../types/contact'

// Mock data generation helpers
const generateMockContacts = (): Contact[] => {
  const firstNames = [
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Edward',
    'Fiona',
    'George',
    'Hannah',
    'Ian',
    'Julia',
    'Kevin',
    'Linda',
    'Michael',
    'Nancy',
    'Oliver',
    'Patricia',
    'Quinn',
    'Rebecca',
    'Samuel',
    'Teresa',
    'Ulrich',
    'Victoria',
    'William',
    'Xenia',
    'Yusuf',
    'Zoe',
    'Alex',
    'Blake',
    'Casey',
    'Drew',
    'Emery',
    'Finley',
    'Gray',
    'Harper',
    'Indigo',
    'Jordan',
    'Kendall',
    'Logan',
    'Morgan',
    'Noah',
    'Parker',
    'River',
    'Sage',
    'Taylor',
    'Unique',
    'Val',
    'West',
    'Xander',
  ]

  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
    'Hernandez',
    'Lopez',
    'Gonzalez',
    'Wilson',
    'Anderson',
    'Thomas',
    'Taylor',
    'Moore',
    'Jackson',
    'Martin',
    'Lee',
    'Perez',
    'Thompson',
    'White',
    'Harris',
    'Sanchez',
    'Clark',
    'Ramirez',
    'Lewis',
    'Robinson',
    'Walker',
    'Young',
    'Allen',
    'King',
    'Wright',
    'Scott',
    'Torres',
    'Nguyen',
    'Hill',
    'Flores',
    'Green',
    'Adams',
    'Nelson',
    'Baker',
    'Hall',
    'Rivera',
    'Campbell',
    'Mitchell',
  ]

  const companies = [
    'TechCorp',
    'InnovateCo',
    'GlobalSystems',
    'DataDyne',
    'CloudFirst',
    'NextGen Solutions',
    'Digital Horizons',
    'SmartTech',
    'FutureSoft',
    'CyberEdge',
    'Quantum Labs',
    'Synergy Inc',
    'Velocity Corp',
    'Apex Industries',
    'Pinnacle Systems',
    'Zenith Technologies',
    'Catalyst Group',
    'Momentum LLC',
    'Nexus Enterprises',
    'Vortex Solutions',
    'Phoenix Digital',
    'Elevate Corp',
    'Paradigm Systems',
    'Convergence Tech',
    'Infinite Innovations',
  ]

  const positions = [
    'Software Engineer',
    'Product Manager',
    'Designer',
    'Data Scientist',
    'DevOps Engineer',
    'Marketing Manager',
    'Sales Director',
    'Business Analyst',
    'CTO',
    'CEO',
    'Frontend Developer',
    'Backend Developer',
    'UX Designer',
    'UI Designer',
    'Architect',
    'Team Lead',
    'Senior Engineer',
    'Junior Developer',
    'Consultant',
    'Specialist',
    'Director',
    'VP Engineering',
    'VP Sales',
    'VP Marketing',
    'COO',
  ]

  const tags = [
    'client',
    'prospect',
    'partner',
    'vendor',
    'colleague',
    'friend',
    'vip',
    'hot-lead',
    'cold-lead',
    'warm-lead',
    'decision-maker',
    'influencer',
    'technical',
    'business',
    'executive',
    'startup',
    'enterprise',
    'consultant',
  ]

  const sources: ContactSource[] = [
    'manual',
    'import',
    'linkedin',
    'email',
    'referral',
    'event',
  ]
  const statuses: ContactStatus[] = ['active', 'inactive', 'archived']
  const priorities: ContactPriority[] = ['low', 'medium', 'high']

  const contacts: Contact[] = []

  for (let i = 0; i < 150; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const company = companies[Math.floor(Math.random() * companies.length)]
    const position = positions[Math.floor(Math.random() * positions.length)]

    const createdDate = new Date(
      Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
    )
    const lastContactedDate =
      Math.random() > 0.3
        ? new Date(
            createdDate.getTime() +
              Math.floor(Math.random() * (Date.now() - createdDate.getTime()))
          )
        : undefined

    const contactTags: string[] = []
    const numTags = Math.floor(Math.random() * 4)
    for (let j = 0; j < numTags; j++) {
      const tag = tags[Math.floor(Math.random() * tags.length)]
      if (!contactTags.includes(tag)) {
        contactTags.push(tag)
      }
    }

    const contact: Contact = {
      id: `contact-${i + 1}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone:
        Math.random() > 0.2
          ? `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
          : undefined,
      company,
      position,
      tags: contactTags,
      avatar:
        Math.random() > 0.7
          ? `https://i.pravatar.cc/150?u=${firstName}${lastName}`
          : undefined,
      notes:
        Math.random() > 0.6
          ? `Met at ${['conference', 'networking event', 'trade show', 'meeting', 'introduction'][Math.floor(Math.random() * 5)]}. ${['Very interested in our product', 'Potential partnership opportunity', 'Follow up needed', 'Key decision maker', 'Technical contact'][Math.floor(Math.random() * 5)]}.`
          : undefined,
      socialLinks:
        Math.random() > 0.5
          ? {
              linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
              website:
                Math.random() > 0.7
                  ? `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.com`
                  : undefined,
              twitter:
                Math.random() > 0.8
                  ? `@${firstName.toLowerCase()}${lastName.toLowerCase()}`
                  : undefined,
            }
          : undefined,
      address:
        Math.random() > 0.4
          ? {
              city: [
                'New York',
                'San Francisco',
                'Los Angeles',
                'Chicago',
                'Boston',
                'Seattle',
                'Austin',
                'Denver',
              ][Math.floor(Math.random() * 8)],
              state: ['NY', 'CA', 'IL', 'MA', 'WA', 'TX', 'CO'][
                Math.floor(Math.random() * 7)
              ],
              country: 'USA',
            }
          : undefined,
      customFields:
        Math.random() > 0.8
          ? {
              'Lead Score': Math.floor(Math.random() * 100),
              'Account Size': ['Small', 'Medium', 'Large', 'Enterprise'][
                Math.floor(Math.random() * 4)
              ],
            }
          : undefined,
      createdAt: createdDate,
      updatedAt: new Date(
        createdDate.getTime() +
          Math.floor(Math.random() * (Date.now() - createdDate.getTime()))
      ),
      lastContactedAt: lastContactedDate,
      isFavorite: Math.random() > 0.85,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      birthday:
        Math.random() > 0.8
          ? new Date(
              1970 + Math.floor(Math.random() * 40),
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28)
            )
          : undefined,
      timezone:
        Math.random() > 0.7
          ? ['EST', 'PST', 'CST', 'MST'][Math.floor(Math.random() * 4)]
          : undefined,
      language:
        Math.random() > 0.9
          ? ['English', 'Spanish', 'French', 'German'][
              Math.floor(Math.random() * 4)
            ]
          : undefined,
      department:
        Math.random() > 0.6
          ? [
              'Engineering',
              'Sales',
              'Marketing',
              'Operations',
              'HR',
              'Finance',
            ][Math.floor(Math.random() * 6)]
          : undefined,
    }

    contacts.push(contact)
  }

  return contacts
}

const generateMockTags = (): ContactTag[] => {
  const tagData = [
    { name: 'client', color: '#4CAF50', description: 'Current clients' },
    { name: 'prospect', color: '#FF9800', description: 'Potential clients' },
    { name: 'partner', color: '#2196F3', description: 'Business partners' },
    { name: 'vendor', color: '#9C27B0', description: 'Service providers' },
    { name: 'colleague', color: '#607D8B', description: 'Work colleagues' },
    { name: 'vip', color: '#F44336', description: 'VIP contacts' },
    { name: 'hot-lead', color: '#FF5722', description: 'High-priority leads' },
    { name: 'cold-lead', color: '#795548', description: 'Low-priority leads' },
    {
      name: 'warm-lead',
      color: '#FFC107',
      description: 'Medium-priority leads',
    },
    {
      name: 'decision-maker',
      color: '#E91E63',
      description: 'Key decision makers',
    },
    {
      name: 'influencer',
      color: '#673AB7',
      description: 'Industry influencers',
    },
    { name: 'technical', color: '#00BCD4', description: 'Technical contacts' },
    { name: 'business', color: '#8BC34A', description: 'Business contacts' },
    { name: 'executive', color: '#3F51B5', description: 'Executive level' },
    { name: 'startup', color: '#CDDC39', description: 'Startup companies' },
    {
      name: 'enterprise',
      color: '#009688',
      description: 'Enterprise companies',
    },
  ]

  return tagData.map((tag, index) => ({
    id: `tag-${index + 1}`,
    name: tag.name,
    color: tag.color,
    description: tag.description,
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    ),
  }))
}

const generateMockCategories = (): ContactCategory[] => {
  return [
    {
      id: 'cat-1',
      name: 'Clients',
      description: 'Current paying clients',
      color: '#4CAF50',
      icon: 'person',
      isDefault: true,
    },
    {
      id: 'cat-2',
      name: 'Prospects',
      description: 'Potential future clients',
      color: '#FF9800',
      icon: 'visibility',
      isDefault: true,
    },
    {
      id: 'cat-3',
      name: 'Partners',
      description: 'Business partners and collaborators',
      color: '#2196F3',
      icon: 'handshake',
      isDefault: true,
    },
    {
      id: 'cat-4',
      name: 'Vendors',
      description: 'Service providers and suppliers',
      color: '#9C27B0',
      icon: 'store',
      isDefault: true,
    },
    {
      id: 'cat-5',
      name: 'Personal',
      description: 'Personal contacts and friends',
      color: '#E91E63',
      icon: 'favorite',
      isDefault: false,
    },
  ]
}

// In-memory storage for demo purposes
let mockContacts = generateMockContacts()
let mockTags = generateMockTags()
let mockCategories = generateMockCategories()

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const validateContactData = (data: Partial<ContactFormData>): void => {
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new Error('Invalid email format')
  }

  if (
    data.phone &&
    !/^[+]?[1-9]?[\d\s\-()]{7,15}$/.test(data.phone.replace(/\s/g, ''))
  ) {
    throw new Error('Invalid phone format')
  }

  if (data.firstName && data.firstName.trim().length === 0) {
    throw new Error('First name is required')
  }

  if (data.lastName && data.lastName.trim().length === 0) {
    throw new Error('Last name is required')
  }
}

const generateContactStats = (): ContactStats => {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const activeContacts = mockContacts.filter(c => c.status === 'active')
  const inactiveContacts = mockContacts.filter(c => c.status === 'inactive')
  const archivedContacts = mockContacts.filter(c => c.status === 'archived')
  const favoriteContacts = mockContacts.filter(c => c.isFavorite)
  const contactsWithEmail = mockContacts.filter(c => c.email)
  const contactsWithPhone = mockContacts.filter(c => c.phone)
  const recentlyAdded = mockContacts.filter(c => c.createdAt >= thirtyDaysAgo)
  const recentlyContacted = mockContacts.filter(
    c => c.lastContactedAt && c.lastContactedAt >= thirtyDaysAgo
  )

  // Top companies
  const companyCount: Record<string, number> = {}
  mockContacts.forEach(contact => {
    if (contact.company) {
      companyCount[contact.company] = (companyCount[contact.company] || 0) + 1
    }
  })
  const topCompanies = Object.entries(companyCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  // Top tags
  const tagCount: Record<string, number> = {}
  mockContacts.forEach(contact => {
    contact.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })
  const topTags = Object.entries(tagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  // Contacts by source
  const sourceCount: Record<ContactSource, number> = {
    manual: 0,
    import: 0,
    linkedin: 0,
    email: 0,
    referral: 0,
    event: 0,
  }
  mockContacts.forEach(contact => {
    if (contact.source) {
      sourceCount[contact.source]++
    }
  })
  const contactsBySource = Object.entries(sourceCount).map(
    ([source, count]) => ({
      source: source as ContactSource,
      count,
    })
  )

  // Contacts by priority
  const priorityCount: Record<ContactPriority, number> = {
    low: 0,
    medium: 0,
    high: 0,
  }
  mockContacts.forEach(contact => {
    if (contact.priority) {
      priorityCount[contact.priority]++
    }
  })
  const contactsByPriority = Object.entries(priorityCount).map(
    ([priority, count]) => ({
      priority: priority as ContactPriority,
      count,
    })
  )

  return {
    totalContacts: mockContacts.length,
    activeContacts: activeContacts.length,
    inactiveContacts: inactiveContacts.length,
    archivedContacts: archivedContacts.length,
    favoriteContacts: favoriteContacts.length,
    contactsWithEmail: contactsWithEmail.length,
    contactsWithPhone: contactsWithPhone.length,
    recentlyAdded: recentlyAdded.length,
    recentlyContacted: recentlyContacted.length,
    topCompanies,
    topTags,
    contactsBySource,
    contactsByPriority,
  }
}

// Main service object
export const contactsService = {
  // CRUD Operations
  async getContacts(): Promise<Contact[]> {
    await delay(300) // Simulate network delay
    return [...mockContacts]
  },

  async getContact(id: string): Promise<Contact | null> {
    await delay(200)
    return mockContacts.find(contact => contact.id === id) || null
  },

  async createContact(data: ContactFormData): Promise<Contact> {
    await delay(400)
    validateContactData(data)

    const newContact: Contact = {
      id: `contact-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      position: data.position,
      tags: data.tags || [],
      avatar: undefined,
      notes: data.notes,
      socialLinks: data.socialLinks,
      address: data.address,
      customFields: data.customFields,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastContactedAt: undefined,
      isFavorite: data.isFavorite || false,
      status: data.status || 'active',
      source: 'manual',
      priority: data.priority,
      birthday: data.birthday,
      timezone: data.timezone,
      language: data.language,
      department: data.department,
    }

    mockContacts.unshift(newContact)
    return newContact
  },

  async updateContact(
    id: string,
    data: Partial<ContactFormData>
  ): Promise<Contact> {
    await delay(300)
    validateContactData(data)

    const contactIndex = mockContacts.findIndex(contact => contact.id === id)
    if (contactIndex === -1) {
      throw new Error('Contact not found')
    }

    const updatedContact = {
      ...mockContacts[contactIndex],
      ...data,
      updatedAt: new Date(),
    }

    mockContacts[contactIndex] = updatedContact
    return updatedContact
  },

  async deleteContact(id: string): Promise<void> {
    await delay(200)
    const contactIndex = mockContacts.findIndex(contact => contact.id === id)
    if (contactIndex === -1) {
      throw new Error('Contact not found')
    }

    mockContacts.splice(contactIndex, 1)
  },

  // Tag operations
  async addTagToContact(contactId: string, tagName: string): Promise<Contact> {
    await delay(200)
    const contact = await this.getContact(contactId)
    if (!contact) {
      throw new Error('Contact not found')
    }

    if (!contact.tags.includes(tagName)) {
      contact.tags.push(tagName)
      contact.updatedAt = new Date()
    }

    return contact
  },

  async removeTagFromContact(
    contactId: string,
    tagName: string
  ): Promise<Contact> {
    await delay(200)
    const contact = await this.getContact(contactId)
    if (!contact) {
      throw new Error('Contact not found')
    }

    contact.tags = contact.tags.filter(tag => tag !== tagName)
    contact.updatedAt = new Date()

    return contact
  },

  // Tags management
  async getTags(): Promise<ContactTag[]> {
    await delay(200)
    return [...mockTags]
  },

  async createTag(data: {
    name: string
    color: string
    description?: string
  }): Promise<ContactTag> {
    await delay(300)

    if (
      mockTags.some(tag => tag.name.toLowerCase() === data.name.toLowerCase())
    ) {
      throw new Error('Tag with this name already exists')
    }

    const newTag: ContactTag = {
      id: `tag-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: data.name,
      color: data.color,
      description: data.description,
      createdAt: new Date(),
    }

    mockTags.push(newTag)
    return newTag
  },

  async updateTag(
    id: string,
    data: Partial<{ name: string; color: string; description: string }>
  ): Promise<ContactTag> {
    await delay(300)
    const tagIndex = mockTags.findIndex(tag => tag.id === id)
    if (tagIndex === -1) {
      throw new Error('Tag not found')
    }

    const updatedTag = { ...mockTags[tagIndex], ...data }
    mockTags[tagIndex] = updatedTag
    return updatedTag
  },

  async deleteTag(id: string): Promise<void> {
    await delay(200)
    const tagIndex = mockTags.findIndex(tag => tag.id === id)
    if (tagIndex === -1) {
      throw new Error('Tag not found')
    }

    // Remove tag from all contacts
    const tagName = mockTags[tagIndex].name
    mockContacts.forEach(contact => {
      contact.tags = contact.tags.filter(tag => tag !== tagName)
    })

    mockTags.splice(tagIndex, 1)
  },

  // Categories management
  async getCategories(): Promise<ContactCategory[]> {
    await delay(200)
    return [...mockCategories]
  },

  async createCategory(
    data: Omit<ContactCategory, 'id'>
  ): Promise<ContactCategory> {
    await delay(300)
    const newCategory: ContactCategory = {
      ...data,
      id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    }

    mockCategories.push(newCategory)
    return newCategory
  },

  // Statistics
  async getContactStats(): Promise<ContactStats> {
    await delay(400)
    return generateContactStats()
  },

  // Import/Export utilities
  async importContacts(contacts: Partial<Contact>[]): Promise<Contact[]> {
    await delay(1000) // Longer delay for import
    const importedContacts: Contact[] = []

    for (const contactData of contacts) {
      try {
        if (
          !contactData.firstName ||
          !contactData.lastName ||
          !contactData.email
        ) {
          continue // Skip invalid contacts
        }

        const formData: ContactFormData = {
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          position: contactData.position,
          tags: contactData.tags || [],
          notes: contactData.notes,
          socialLinks: contactData.socialLinks,
          address: contactData.address,
          customFields: contactData.customFields,
          isFavorite: contactData.isFavorite || false,
          status: contactData.status || 'active',
          priority: contactData.priority,
          birthday: contactData.birthday,
          timezone: contactData.timezone,
          language: contactData.language,
          department: contactData.department,
        }

        const newContact = await this.createContact(formData)
        importedContacts.push(newContact)
      } catch (error) {
        console.warn('Failed to import contact:', contactData, error)
      }
    }

    return importedContacts
  },

  async exportContacts(contactIds?: string[]): Promise<Contact[]> {
    await delay(500)
    if (contactIds) {
      return mockContacts.filter(contact => contactIds.includes(contact.id))
    }
    return [...mockContacts]
  },

  // Search functionality
  async searchContacts(query: string): Promise<Contact[]> {
    await delay(200)
    if (!query.trim()) return []

    const searchTerms = query.toLowerCase().split(' ')

    return mockContacts.filter(contact => {
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

  // Utility methods for development
  async resetData(): Promise<void> {
    await delay(500)
    mockContacts = generateMockContacts()
    mockTags = generateMockTags()
    mockCategories = generateMockCategories()
  },

  async seedAdditionalContacts(count: number): Promise<Contact[]> {
    await delay(800)
    const additionalContacts = generateMockContacts().slice(0, count)
    mockContacts.push(...additionalContacts)
    return additionalContacts
  },
}
