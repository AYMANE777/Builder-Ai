## AI-Powered Resume Analyzer

AI-powered system that analyzes resumes and matches them to job descriptions using NLP and Machine Learning. Built as an industry-grade, portfolio-ready project using .NET 8, ML.NET, React 18, and modern DevOps practices.

### Tech Stack
- **Backend**: .NET 8, ASP.NET Core Web API (Minimal APIs + Controllers), Entity Framework Core, SQL Server, Clean Architecture, JWT Auth, Serilog, Swagger
- **AI & NLP**: ML.NET, TF-IDF, cosine similarity, multi-class classification (Junior/Mid/Senior/Reject)
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Dark/Light mode
- **DevOps & Quality**: Docker, Docker Compose, xUnit, CI-ready structure

### Solution Structure
- `src/Backend/AIResumeAnalyzer.Api` – ASP.NET Core API (presentation layer)
- `src/Backend/AIResumeAnalyzer.Application` – Application layer (use cases, DTOs, interfaces)
- `src/Backend/AIResumeAnalyzer.Domain` – Domain models and core logic contracts
- `src/Backend/AIResumeAnalyzer.Infrastructure` – EF Core, SQL Server, ML.NET, file parsing, auth, logging
- `src/Frontend/ai-resume-analyzer-ui` – React 18 + TypeScript + Tailwind SPA

### High-Level Features
- Resume parsing (PDF/DOCX/TXT)
- NLP preprocessing (normalization, tokenization, stop-word removal, simple lemmatization)
- Skill extraction (dictionary + heuristic ML features)
- Job description vs resume skill matching and scoring (0–100)
- ML.NET model for candidate level classification
- JWT-secured API with role-based access (Admin/Recruiter)

### Quick Start

#### Option 1: Docker Compose (Recommended)

```powershell
cd docker
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`

#### Option 2: Run Locally

**Backend:**
```powershell
cd "C:\Users\user\Desktop\AI RESUME ANALYSER"
dotnet restore .\AIResumeAnalyzer.sln
dotnet run --project .\src\Backend\AIResumeAnalyzer.Api\AIResumeAnalyzer.Api.csproj
```

**Frontend (new terminal):**
```powershell
cd "C:\Users\user\Desktop\AI RESUME ANALYSER\src\Frontend\ai-resume-analyzer-ui"
npm install
npm run dev
```

### Database Setup

For local development without Docker, ensure SQL Server is running and update the connection string in `src/Backend/AIResumeAnalyzer.Api/appsettings.Development.json`.

To create the database:
```powershell
dotnet ef migrations add InitialCreate -p src/Backend/AIResumeAnalyzer.Infrastructure -s src/Backend/AIResumeAnalyzer.Api
dotnet ef database update -p src/Backend/AIResumeAnalyzer.Infrastructure -s src/Backend/AIResumeAnalyzer.Api
```

### Testing the API

1. Open Swagger UI: `http://localhost:5000/swagger`
2. Use the `/api/resume/analyze` endpoint
3. Upload a resume file (PDF/DOCX/TXT) and provide job description
4. Get analysis results with compatibility score, skill matching, and predicted candidate level

Detailed documentation is provided in `docs/ARCHITECTURE.md` and `docs/AI_PIPELINE.md`.


