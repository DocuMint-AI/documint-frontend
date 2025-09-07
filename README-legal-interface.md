# Legal Document AI Interface

A comprehensive, modern React/TypeScript interface for AI-powered legal document analysis featuring Material 3 design, resizable panels, and responsive layouts.

## ✨ Features

### 🎨 Material 3 Design System
- **Dynamic Color Schemes**: Material You theming with 6 accent color options
- **Adaptive Theming**: Light/Dark/Auto modes with OS preference sync
- **Pixel OS Aesthetics**: Google Pixel-inspired design language
- **Smooth Animations**: Framer Motion-powered transitions

### 📱 Responsive Layout
- **Desktop**: 3-panel horizontal layout with resizable dividers
- **Tablet**: Hybrid layout with 2 panels side-by-side and 1 below
- **Mobile**: Stacked grid layout with touch-friendly interactions

### 🔧 Interactive Panels
- **Document Panel**: Contract viewer with expandable sections
- **AI Insights Panel**: Risk analysis with categorized insights
- **Q&A Panel**: Interactive chat interface with AI assistant
- **Panel Management**: Expand, minimize, restore with state persistence

### ♿ Accessibility
- **ARIA Compliance**: Proper roles, labels, and landmarks
- **Keyboard Navigation**: Full keyboard support with focus management
- **Screen Reader Support**: Optimized for assistive technologies
- **Touch Support**: Mobile-friendly interactions

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Usage

```tsx
import LegalDocumentAIInterface from './legal-document-ai-interface';

function App() {
  return <LegalDocumentAIInterface />;
}
```

### Theme Customization

The interface automatically adapts to your preferred color scheme. You can customize:

- **Accent Colors**: Blue, Green, Purple, Orange, Red, Teal
- **Theme Mode**: Light, Dark, or Auto (follows OS preference)
- **Panel Layout**: Desktop, tablet, and mobile responsive breakpoints

## 🏗️ Architecture

### Component Structure

```
LegalDocumentAIInterface/
├── src/
│   ├── theme/
│   │   ├── material3Theme.ts           # Material 3 design tokens
│   │   └── Material3ThemeProvider.tsx  # Theme context provider
│   ├── context/
│   │   └── PanelContext.tsx           # Panel state management
│   ├── components/
│   │   ├── panels/
│   │   │   ├── DocumentPanel.tsx      # Document viewer
│   │   │   ├── InsightsPanel.tsx      # AI insights display
│   │   │   └── QAPanel.tsx           # Q&A chat interface
│   │   ├── Header.tsx                # App header with controls
│   │   ├── ResizeHandle.tsx          # Draggable panel dividers
│   │   ├── ResponsiveLayout.tsx      # Layout orchestrator
│   │   ├── MinimizedPanelBar.tsx     # Minimized panel controls
│   │   └── ThemeSettings.tsx         # Theme customization UI
│   └── ...
└── legal-document-ai-interface.tsx    # Main component
```

### Key Technologies

- **React 18** with TypeScript
- **Material-UI v5** with Material 3 design tokens
- **Framer Motion** for animations
- **Material Color Utilities** for dynamic theming
- **Lucide React** for icons

## 🎯 Panel Features

### Document Panel
- 📄 Contract document viewer
- 📖 Expandable sections with smooth animations
- 🔍 Section-by-section navigation
- 💾 Reading state persistence

### AI Insights Panel
- 🧠 Automated risk analysis
- 🏷️ Categorized insights (Risk, Compliance, Legal, etc.)
- ⚡ Priority levels (High, Medium, Low)
- 💡 Actionable recommendations

### Q&A Panel
- 💬 Interactive chat interface
- 🎤 Voice input support (UI ready)
- ⏱️ Real-time responses
- 📚 Conversation history

## 🔧 Customization

### Theme Configuration

```tsx
import { Material3ThemeProvider } from './src/theme/Material3ThemeProvider';

// Custom accent color and mode
<Material3ThemeProvider>
  <YourApp />
</Material3ThemeProvider>
```

### Panel Configuration

```tsx
import { PanelProvider } from './src/context/PanelContext';

// Custom panel behavior
<PanelProvider>
  <ResponsiveLayout />
</PanelProvider>
```

## 📱 Responsive Behavior

### Desktop (≥1024px)
- 3-panel horizontal layout
- Resizable dividers with drag handles
- Smooth expand/minimize animations
- Keyboard navigation support

### Tablet (768px - 1023px)
- 2 panels side-by-side
- 3rd panel stacked below
- Touch-friendly interactions
- Adaptive grid layout

### Mobile (<768px)
- Single-column stack
- Full-screen panel expansion
- Touch gestures
- Optimized for portrait/landscape

## 🎨 Material 3 Features

### Color System
- **Primary**: Main brand color with variants
- **Secondary**: Supporting colors
- **Tertiary**: Accent colors for highlights
- **Surface**: Background and container colors
- **Outline**: Border and divider colors

### Typography Scale
- **Display**: Large headings (3.5rem - 2.25rem)
- **Headline**: Section headers (1.75rem - 1.125rem)
- **Title**: Subsection titles (1.375rem - 1rem)
- **Body**: Main content (1rem - 0.875rem)
- **Label**: UI labels (0.875rem - 0.6875rem)

### Animation System
- **Panel Transitions**: 300-400ms easing
- **Hover Effects**: 200ms transitions
- **Resize Operations**: Smooth spring animations
- **State Changes**: Coordinated motion

## ♿ Accessibility Features

### ARIA Implementation
- `role="separator"` for resize handles
- `aria-label` for all interactive elements
- `aria-expanded` for collapsible content
- `aria-controls` for panel relationships

### Keyboard Navigation
- **Tab**: Navigate between interactive elements
- **Arrow Keys**: Resize panels (Shift for larger steps)
- **Enter/Space**: Activate buttons and controls
- **Escape**: Close modals and menus

### Screen Reader Support
- Descriptive labels for all controls
- Live regions for dynamic content
- Logical tab order
- High contrast support

## 📊 Performance

### Optimizations
- **React.memo** for panel components
- **useCallback** for event handlers
- **Lazy Loading** for large content
- **Efficient Animations** with Framer Motion

### Bundle Size
- Core: ~45KB gzipped
- With all dependencies: ~180KB gzipped
- Tree-shakeable Material-UI components

## 🔒 Browser Support

- **Chrome/Edge**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **iOS Safari**: 14+
- **Android Chrome**: 88+

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Built with ❤️ using Material 3 Design and modern React patterns**