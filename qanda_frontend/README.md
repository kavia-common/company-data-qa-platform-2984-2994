# Company Q&A Frontend (Ocean Professional)

Modern, responsive React UI for the Q&A platform. Clean layout with header, sidebar, central Q&A panel, and modals for document upload and user account.

## Quick start

1. Copy environment example and adjust if needed:
   cp .env.example .env
   # Ensure REACT_APP_BACKEND_API_URL points to your backend, e.g. http://localhost:3001/api/

2. Install and run:
   npm install
   npm start

Open http://localhost:3000 in your browser.

## Features

- Ocean Professional theme (blue primary, amber accents)
- Header with health indicator and quick actions
- Sidebar tabs: History and Documents
- Central Q&A panel with references display
- Bottom input for questions
- Upload/Create document modal (title, description, optional initial content)
- User account modal (create minimal user profile)
- REST API integration:
  - GET /health/
  - POST /qa/
  - CRUD for /documents/
  - Minimal /users/ create/list

## Configuration

- REACT_APP_BACKEND_API_URL in .env (must end with /api/)

## Notes

- No heavy UI libs; pure CSS in src/App.css aligned to the Ocean Professional guide.
- All public functions and key modules are documented inline.
