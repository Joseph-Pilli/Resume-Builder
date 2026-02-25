# ATS Resume Builder

A modern, ATS-friendly Resume Builder web application with **Live Preview**, **PDF/Word export**, and **AI-powered Resume Optimizer**.

## Features

### Resume Builder
- **Live Preview** - Real-time resume preview as you type
- **Form Sections** - Personal info, summary, skills, experience, projects, education, certifications
- **Download** - Export as PDF or Word (.docx)
- **ATS-Friendly** - Single column, no tables, standard fonts (Arial), clean formatting
- **Local Storage** - Resume data auto-saves in browser

### Resume Optimizer
- **Job Description Analysis** - Extract keywords and required skills from JD
- **Resume Parsing** - Upload PDF, DOCX, or TXT resumes
- **Smart Optimization** - Reorder skills, improve bullet points, add missing keywords
- **ATS Score** - Before/after match percentage
- **AI-Powered** - Uses OpenAI GPT-4o-mini when `OPENAI_API_KEY` is set (falls back to rule-based optimization)

## Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Node.js, Express
- **PDF**: jsPDF
- **Word**: docx
- **Resume Parsing**: pdf-parse, mammoth

## Setup

### Prerequisites
- Node.js 18+

### Install

```bash
npm run install:all
```

### Development

```bash
npm run dev
```

Runs both backend (port 5000) and frontend (port 3000).

### Production Build

```bash
npm run build
cd server && npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Optional. Enables AI-powered resume optimization |

## Sample Files

- `samples/sample-resume.txt` - Sample resume for testing
- `samples/sample-job-description.txt` - Sample job description

## Project Structure

```
Resume_Builder/
├── client/           # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── utils/
├── server/           # Express backend
│   └── src/
│       ├── routes/
│       ├── services/
│       └── utils/
├── samples/
└── package.json
```
