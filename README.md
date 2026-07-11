# CSV AI Exporter

AI-powered CSV importer converting arbitrary CSVs into GrowEasy CRM format using Google Gemini.

Tech stack

- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, React Hook Form, PapaParse, Axios, TanStack Table, shadcn/ui, Lucide Icons
- Backend: Node.js, Express, TypeScript, Multer, PapaParse, Google Gemini API, dotenv, cors, helmet, morgan

Features

- Client-side CSV parsing and preview (PapaParse)
- Normalization, batching and AI-powered extraction (server-side)
- Retry, validation and robust error handling
- Modern responsive dashboard with dark mode

Repository layout

```
project/
  frontend/   # Next.js app
  backend/    # Express API
  README.md
```

Environment
Create `.env` files set:

```
We provide example env files in the repo. Copy the appropriate example and fill in secrets:

Backend (create `backend/.env` from `backend/.env.example`):

```

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
PORT=5000

```

Frontend (create `frontend/.env.local` from `frontend/.env.example`):

```

NEXT_PUBLIC_API_URL=http://localhost:5000

```

Important: do NOT commit your real `.env` files. The repo includes `*.example` files safe to commit.
```

Local development

- Frontend: `cd frontend && npm install && npm run dev`
- Backend: `cd backend && npm install && npm run dev`

Docker

- `docker-compose up --build` will run both services (when docker files are present)

Testing

- Unit tests for backend services will live in `backend/src/__tests__` and run with `npm test`.

Current implemented extras

- Drag & Drop CSV upload with streaming parsing (frontend UploadBox)
- Parsing progress indicator and incremental preview
- Batch import with retry logic for transient failures
- Lightweight table virtualization to handle large CSVs in the preview
- Dark mode toggle in the header (class-based Tailwind dark mode)
- Dockerfiles for frontend and backend and `docker-compose.yml`

Next steps (optional enhancements)

- Add a full unit/integration test suite for frontend and backend (Jest + React Testing Library)
- Replace lightweight virtualization with `react-window` for better performance
- Implement server-sent progress events for live AI processing updates

Contributing

- Follow TypeScript strict mode
- Use ESLint + Prettier configuration included

License

- MIT
