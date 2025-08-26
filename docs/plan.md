# DocuMint — Implementation Plan

Goal: Build a Next.js (page-based) frontend using React + Material UI to help users demystify legal documents. This plan outlines phases, todos, and the initial implementation details.

## High-level approach
- Use Next.js pages/ routing.
- Use Material UI for UI primitives and theming. Provide a custom theme to match a clean Notion/Apple-inspired aesthetic.
- Theme state handled via React Context (persisted to localStorage).
- Build modular components: UploadArea, DocumentPreview, ChatPanel, InsightsPanel, Layout.

## Phases

Phase 1 — Scaffold & core UI (this commit)
- Create project skeleton (pages, components, context, styles).
- Implement theme provider and dark/light toggle in the top nav.
- Implement upload page with drag-and-drop + file picker and simple validation for PDF/DOCX.
- Implement workspace page layout with left (DocumentPreview), center (placeholder main area), right (ChatPanel + FAQ tiles), and compact Insights panel.
- Implement settings page for theme and language placeholder.

Phase 2 — Features (follow-up)
- Add document parsing pipeline (client/server integration) to extract insights.
- Integrate AI assistant for chat queries (backend or API integration).
- Wire up document preview highlighting and clickable FAQ tiles to trigger chat/insights.
- Add accessibility tweaks, keyboard navigation tests.

Phase 3 — Polish & testing
- Add animations (Framer Motion) and smooth route transitions.
- Add unit tests, accessibility testing, end-to-end smoke tests.
- Performance tuning and responsive refinements.

## Todo (Phase 1)
```markdown
- [x] Create docs/plan.md
- [x] Add package.json with necessary dependencies and scripts
- [x] Add Next.js pages: _app.jsx, index.jsx (upload), workspace.jsx, settings.jsx
- [x] Add ThemeContext and MUI theme overrides
- [x] Add components: Layout, UploadArea, DocumentPreview, ChatPanel, InsightsPanel
- [x] Add basic CSS
- [x] Provide run instructions
```

## Contract (small)
- Inputs: PDF/DOCX file upload via drag/drop or file picker.
- Outputs: UI showing parsed document placeholder, chat UI, extracted insights panel (static in Phase 1).
- Error modes: File type rejected, large file warning (UI feedback), theme persistence failure (fallback to default).

## Edge cases
- Unsupported file types -> validation message.
- No file uploaded but user opens workspace -> show empty state and call-to-action to upload.
- Very large file -> show upload progress and allow cancellation (placeholder in v1).

---
Saved: Phase 1 scaffold committed to repo. Next steps: implement parsing + AI integration (Phase 2).
