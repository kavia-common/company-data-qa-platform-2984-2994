# company-data-qa-platform-2984-2994

This workspace includes the React frontend for the Company Q&A platform.

Important:
- The backend Django API base path is `/api/`. Ensure any environment variable or proxy configuration points the frontend to a base URL that ends with `/api/`, e.g. `http://localhost:3001/api/`.
- Using `/apiqa/` will result in 404 errors because the backend does not expose that route.

See `qanda_frontend/.env.example` for configuration.