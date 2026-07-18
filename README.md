# CSV AI Importer

AI-powered CSV importer that intelligently converts arbitrary CSV files into the **GrowEasy CRM** format using the **Groq AI** model.

---

## 📌 Overview

CSV AI Importer enables users to upload CSV files from various sources with different column names and structures. Instead of relying on fixed headers, the application uses AI to understand the meaning of each column and automatically maps it to the required GrowEasy CRM fields.

---

## 🚀 Tech Stack

### Frontend

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- PapaParse
- Axios
- TanStack Table
- shadcn/ui
- Lucide Icons

### Backend

- Node.js
- Express
- TypeScript
- Multer
- PapaParse
- Groq API
- dotenv
- cors
- helmet
- morgan

---

## ✨ Features

- AI-powered CSV field mapping using Groq LLM
- Supports CSV files with arbitrary column names
- Client-side CSV parsing and preview
- Drag & Drop CSV upload
- Streaming CSV parsing
- Incremental preview generation
- Batch processing for large CSV files
- Retry mechanism for transient AI failures
- Data normalization and validation
- Robust error handling
- Lightweight table virtualization
- Responsive dashboard
- Dark mode support

---

## 📁 Repository Structure

```text
project/
│
├── frontend/          # Next.js application
├── backend/           # Express API
└── README.md
```

---

## ⚙️ Environment Variables

Example environment files are included in the repository.

### Backend

Copy:

```bash
backend/.env.example → backend/.env
```

Add the following values:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
PORT=5000
```

### Frontend

Copy:

```bash
frontend/.env.example → frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production:

```env
NEXT_PUBLIC_API_URL=https://groweasyassignment-1.onrender.com
```

> **Note:** Never commit your actual `.env` files. Only commit the provided `.env.example` files.

---

## 🛠 Local Development

### Clone the Repository

```bash
git clone <repository-url>
cd project
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

Backend unit tests will be located in:

```text
backend/src/__tests__
```

Run tests using:

```bash
npm test
```

---

## 📈 Current Implemented Extras

- Drag & Drop CSV upload
- Streaming CSV parsing
- Incremental preview generation
- Batch AI processing
- Retry logic for transient failures
- Lightweight table virtualization
- Dark mode toggle (Tailwind CSS class-based)

---

## 🚀 Future Enhancements

- Full frontend and backend test suite (Jest + React Testing Library)
- Replace lightweight virtualization with `react-window`
- Server-Sent Events (SSE) for real-time AI processing progress
- Import history and audit logs
- Advanced validation rules
- Multiple AI model support

---

## 🤝 Contributing

- Follow TypeScript strict mode
- Follow the existing project structure
- Use the included ESLint and Prettier configuration

---

## 📄 License

This project is licensed under the **MIT License**.
