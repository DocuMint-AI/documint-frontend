# Changelog

All notable changes to this project will be documented in this file.

The format is based on "Keep a Changelog" and adheres to semantic versioning where practical.

## [Unreleased]

- Pending features: advanced AI model integration, document parsing improvements, comprehensive tests.

## [v0.2.0] - 2025-09-08
### Added
- **Material 3 (Material You) Design System Integration**
  - Dynamic color generation with Material Color Utilities
  - 6 customizable accent colors (Blue, Green, Purple, Orange, Red, Teal)
  - OS theme sync with automatic light/dark mode detection
  - Complete Material 3 typography scale and color tokens
  - Enhanced Material 3 component styling and animations

- **Interactive Resizable Panel System**
  - Three-panel workspace layout (Document, AI Insights, Q&A)
  - Smooth drag-to-resize functionality with visual feedback
  - Touch and keyboard accessibility support
  - Panel state persistence with localStorage
  - Responsive breakpoints for mobile, tablet, and desktop
  - Panel expand/collapse and minimize functionality

- **Enhanced User Experience Features**
  - Framer Motion animations throughout the interface
  - Micro-interactions and hover effects
  - Advanced theme customization in settings page
  - Improved upload area with gradient animations
  - Professional Material 3 styled components

- **Accessibility Improvements**
  - ARIA roles and labels for screen readers
  - Keyboard navigation support for panels
  - High contrast support preparation
  - Focus management and visual indicators

### Changed
- **Complete UI Redesign**: Transformed from Material Design to Material 3 (Material You)
- **Workspace Page**: Replaced static layout with interactive resizable panels
- **Settings Page**: Added theme customization with accent color picker
- **Upload Page**: Enhanced with Material 3 styling and animations
- **Component Architecture**: Modular panel system with context-based state management

### Fixed
- **Server-Side Rendering (SSR) Compatibility**
  - Fixed `window` usage errors during build
  - Resolved custom palette property references
  - Ensured proper theme hydration on server and client
  - Import/export statement corrections for Next.js compatibility

### Technical
- Added Material Color Utilities dependency for dynamic theming
- Implemented PanelContext for state management
- Created ResponsiveLayout component for adaptive layouts
- Enhanced TypeScript support with proper interfaces
- Optimized build output with static generation support

### Notes
- This release focuses on the user interface and interaction design
- Backend API integration remains planned for future releases
- All core UI components now follow Material 3 design principles

## [v0.1.0] - 2025-08-27
### Added
- Comprehensive Material Design UI overhaul with proper color schemes and typography
- Enhanced theme provider with Material Design color palette and component customizations
- Improved Layout component with Material Design navigation patterns and active states
- Enhanced UploadArea with drag-and-drop visual feedback, icons, and better UX
- Material Design chat interface with message bubbles, timestamps, and proper styling
- Enhanced DocumentPreview with sectioned content display and hover effects
- Floating Insights panel with Material Design cards and comprehensive data visualization
- Hero section and feature cards on home page with smooth animations
- Material Design workspace layout with proper sidebars and content areas
- Comprehensive settings page with organized cards and form controls
- Proper Material Design icons, chips, badges, and interactive elements throughout
- Responsive design improvements and better mobile compatibility

### Changed
- Complete UI redesign following Material Design principles
- Improved color consistency across light and dark themes
- Enhanced typography hierarchy and spacing
- Better component elevation and shadow usage
- Improved accessibility with proper ARIA labels and keyboard navigation

## [v0.0.1] - 2025-08-27
### Added
- Initial frontend scaffold (Next.js, page-based routing).
- Material UI theme provider with dark/light mode toggle and localStorage persistence.
- Pages: `/` (Upload), `/workspace` (Workspace skeleton), `/settings` (Preferences).
- Components: `Layout`, `UploadArea` (drag/drop + file picker), `DocumentPreview`, `ChatPanel` (FAQ tiles), `InsightsPanel` (compact + overlay).
- `docs/plan.md` with roadmap and Phase 1 todo list.
- `README.md` with run instructions and `.gitignore`.

### Changed
- N/A (initial release)

### Fixed
- N/A

### Notes
- This release is a UI scaffold only. Backend APIs for file upload, parsing, and AI assistant are planned for subsequent releases (see Unreleased).
