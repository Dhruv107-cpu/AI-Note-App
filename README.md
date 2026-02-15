# 🧠 AI Voice Notes App

An AI-powered voice note application that allows users to:

- 🎙 Record voice notes
- 📝 Convert speech to text (Whisper STT)
- 🧠 Generate semantic embeddings
- 🔍 Perform vector similarity search (Qdrant)
- 🤖 Ask questions over saved notes (Grok API)
- 💾 Store structured notes (PostgreSQL)
- 🐳 Run everything using Docker Compose

---

## 🚀 Tech Stack

### Backend
- FastAPI
- PostgreSQL
- Qdrant (Vector Database)
- Faster-Whisper (Speech-to-Text)
- Sentence-Transformers (Embeddings)
- Grok API (LLM)
- SQLAlchemy

### Frontend
- React (Vite)

- TailwindCSS
- MediaRecorder API

### DevOps
- Docker
- Docker Compose

---

## 📦 Project Structure

AI-Note-App/
│
├── backend/
│ ├── app/
│ │ ├── routes/
│ │ ├── services/
│ │ ├── models.py
│ │ ├── schemas.py
│ │ └── main.py
│ ├── Dockerfile
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ ├── Dockerfile
│ └── package.json
│
├── docker-compose.yml
└── README.md


---

## 🧠 How It Works

1. User records audio in frontend.
2. Audio is sent to FastAPI backend.
3. Whisper transcribes speech → text.
4. Text is saved in PostgreSQL.
5. Embedding is generated.
6. Embedding is stored in Qdrant.
7. User can ask questions.
8. Similar notes retrieved from Qdrant.
9. Grok API generates contextual answer.

---

# 🐳 Running with Docker (Recommended)

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-note-app.git
cd ai-note-app
2️⃣ Add Environment Variables
Create a .env file inside backend/:

DATABASE_URL=postgresql://voiceuser:voicepass@postgres:5432/voicedb
GROK_API_KEY=your_grok_api_key_here
3️⃣ Start Docker Engine
Make sure Docker Desktop is running.

4️⃣ Run the Application
docker compose up --build
🌐 Access the App
Frontend:

http://localhost:5173
Backend Docs:

http://localhost:8000/docs
Qdrant Dashboard:

http://localhost:6333/dashboard



🛠 Local Development (Without Docker)

Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Frontend
cd frontend
npm install
npm run dev


🔍 Features
✅ Create & edit notes
✅ Voice recording
✅ Speech-to-text
✅ Semantic search
✅ AI Q&A over notes
✅ Delete notes
✅ Clear all notes
✅ Dockerized infrastructure

📌 Future Improvements
User authentication

Cloud deployment (AWS / Render)

Real-time transcription preview

Mobile optimization

Dark/light theme toggle

Production-grade CI/CD

⚠️ Important Notes
First Docker build may take time (downloads ML models).

Make sure Docker has at least 4GB RAM allocated.

Whisper model is downloaded during first build.

👨‍💻 Author
Built by Dhruv Gupta
AI Engineer | Full Stack Developer

⭐ If You Like This Project
Give it a star on GitHub ⭐