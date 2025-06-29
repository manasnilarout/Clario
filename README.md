# Clario - Modern Productivity App

A comprehensive productivity application built with React, TypeScript, and Material-UI that seamlessly integrates travel management, contact organization, meeting planning, and goal tracking.

## 🚀 Features

- **Travel Management**: Plan trips, track itineraries, and manage travel checklists
- **Contact Organization**: Smart contact management with insights and analytics
- **Meeting Planner**: Schedule meetings, manage agendas, and track action items
- **Task Management**: Kanban boards, lists, and calendar views for task tracking
- **Insights & Analytics**: Data-driven insights across all modules
- **OGSM Planning**: Strategic planning with Objectives, Goals, Strategies, and Measures
- **Dark/Light Theme**: Beautiful, responsive design with theme switching

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **State Management**: Zustand
- **UI Framework**: Material-UI v7
- **Styling**: Emotion (CSS-in-JS)
- **Build Tool**: Vite
- **Code Quality**: ESLint + Prettier + Husky
- **Routing**: React Router v6

## 📁 Project Structure

```
src/
├── assets/              # Static assets (images, icons, fonts)
├── components/          # React components
│   ├── common/         # Reusable UI components
│   ├── layout/         # App layout components
│   └── features/       # Feature-specific components
│       ├── dashboard/
│       ├── travel/
│       ├── contacts/
│       ├── meetings/
│       ├── tasks/
│       ├── insights/
│       ├── ogsm/
│       └── settings/
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services and data layer
│   ├── api/           # API integration
│   └── mock/          # Mock data services
├── store/              # Zustand stores
├── styles/             # Global styles and theme
├── types/              # TypeScript definitions
├── utils/              # Utility functions
└── config/             # App configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

### Building

Build for production:
```bash
npm run build
```

### Code Quality

Run linting:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## 🎨 Design System

### Colors
- **Primary**: Professional blue palette (#1976d2, #1565c0)
- **Secondary**: Accent orange (#ff9800, #f57c00)
- **Typography**: Inter font family with 7 size variants
- **Spacing**: 8px grid system
- **Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)

### Components
- Consistent 8px border radius
- Smooth 200-300ms transitions
- Material Design 3.0 principles
- Full accessibility support (WCAG 2.1 AA)

## 📱 Features Overview

### Dashboard
- Customizable widget layout
- Quick action buttons
- Activity feed
- Upcoming events and tasks

### Contact Management
- Import from multiple sources
- Smart categorization and tagging
- Engagement tracking
- Relationship insights

### Meeting Planner
- Calendar integration
- Pre-meeting preparation
- Real-time collaboration
- Action item tracking

### Travel Management
- Multi-destination planning
- Integrated checklists
- Meeting linkage
- Expense preparation

### Task Management
- Multiple view modes (Kanban, List, Calendar)
- Advanced filtering and search
- Goal alignment
- Progress tracking

### Analytics & Insights
- Contact engagement metrics
- Meeting efficiency analysis
- Travel patterns
- Productivity trends

### OGSM Planning
- Strategic goal hierarchy
- Progress visualization
- Milestone tracking
- Achievement celebrations

## 🔧 Development Guidelines

### Code Standards
- TypeScript strict mode
- Functional components with hooks
- Consistent error handling
- Performance optimization through memoization

### Component Guidelines
- Single responsibility principle
- Props interface documentation
- Accessibility from the start
- Proper error boundaries

### Git Workflow
- Feature branch development
- Automated linting and formatting via Husky
- Conventional commit messages

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

Built with ❤️ using modern web technologies for the ultimate productivity experience.