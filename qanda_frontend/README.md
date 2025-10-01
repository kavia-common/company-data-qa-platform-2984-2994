# Company Q&A Frontend (Ocean Professional)

Modern, responsive React UI for the Q&A platform. Clean layout with header, sidebar, central Q&A panel, and modals for document upload and user account.

## Quick start

1. Copy environment example and adjust if needed:
   cp .env.example .env
   # Ensure REACT_APP_BACKEND_API_URL points to your backend API ROOT, e.g. http://localhost:3001/api/
   # In cloud preview use HTTPS and the backend preview hostname, e.g.:
   # REACT_APP_BACKEND_API_URL=https://<your-backend-host>:3001/api/

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

- REACT_APP_BACKEND_API_URL in .env (must end with /api/ and include a trailing slash).
  - Correct: http://localhost:3001/api/
  - Correct (cloud): https://vscode-internal-<BACKEND-ID>-beta.beta01.cloud.kavia.ai:3001/api/
  - Incorrect: http://localhost:3001/api  (missing slash)
  - Incorrect: http://localhost:3001/apiqa/ (invalid base, will cause 404s)

## Troubleshooting

- Network error / Failed to fetch:
  - Ensure REACT_APP_BACKEND_API_URL is set and uses HTTPS if the frontend is served over HTTPS (cloud previews).
  - Make sure REACT_APP_BACKEND_API_URL points to the backend container’s actual host (not the frontend’s host).
  - Confirm the backend is reachable: open <API_BASE>/health/ in your browser (should return JSON with {"message": "..."}).
  - CORS: Backend must allow the frontend origin. If you control the backend, enable CORS for the preview domain.
- 404 Not Found on API calls:
  - Verify REACT_APP_BACKEND_API_URL ends with `/api/` and not `/apiqa/`.
  - Check network tab requests such as `/api/health/`, `/api/qa/`, `/api/documents/`, `/api/users/` return 200s.

## Notes

- No heavy UI libs; pure CSS in src/App.css aligned to the Ocean Professional guide.
- All public functions and key modules are documented inline.
