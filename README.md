# 📈 Finesse : Finance Essentials - Gamified Financial Education Platform 

A modern, gamified learning platform that makes financial education engaging and accessible for beginners.

## 🚀 Features

### 🎓 Interactive Lessons
- **4 Comprehensive Lessons** covering investing fundamentals
- **Step-by-step learning** with progress tracking
- **Interactive quizzes** with instant feedback
- **Progress persistence** with localStorage fallback

### 🏆 Gamification
- **XP System** - Earn points for completing lessons
- **Daily Streaks** - Maintain your learning momentum
- **Leaderboard** - Compete with other learners
- **Achievements** - Unlock badges for milestones

### 🤖 AI-Powered Tutor
- **Ask any investing question** and get concise answers
- **Gemini AI Integration** for accurate, up-to-date information
- **Context-aware responses** based on your current lesson

### 📱 Modern UI/UX
- **Responsive design** works on all devices
- **Dark/Light mode** support
- **Intuitive navigation** and progress tracking
- **Beautiful animations** and transitions

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Modern CSS with responsive design
- Axios for API communication
- React Router for navigation

**Backend:**
- FastAPI (Python 3.9+)
- PostgreSQL with SQLAlchemy ORM
- JWT Authentication
- Google Gemini AI Integration
- CORS enabled

**Development:**
- Docker Compose for containerization
- Hot reload for both frontend/backend
- Environment-based configuration

## 🚀 Cloud Deployment

### Backend (Render)
1. **Create a Render Account**
   - Go to [render.com](https://render.com/) and sign up
   - Click "New" → "Web Service"

2. **Connect GitHub**
   - Select your repository
   - Set the root directory to `backend`

3. **Configure Service**
   - **Name**: `finesse-backend`
   - **Region**: Choose closest to you (e.g., Singapore)
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables**
   - `DATABASE_URL`: (Will be provided after creating PostgreSQL)
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `SECRET_KEY`: Generate a random string (e.g., `openssl rand -hex 32`)
   - `GEMINI_MODEL`: `gemini-1.5-flash`

5. **Add PostgreSQL**
   - In Render Dashboard, click "New" → "PostgreSQL"
   - Copy the connection string
   - Go back to your Web Service → Environment → Add `DATABASE_URL`
   - Run migrations:
     - In the Render Dashboard, go to your Web Service
     - Open the "Shell" tab
     - Run: `python migrate_db.py`
     - Run: `python seed_lessons.py`

6. **Get Backend URL**
   - After deployment, find your backend URL (e.g., `https://finesse-backend.onrender.com`)
   - Your API will be at: `https://finesse-backend.onrender.com/api`

### Frontend (Vercel)
1. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Set root directory to `frontend`

2. **Configure Project**
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Environment Variables**
   - `REACT_APP_API_BASE_URL`: Your Render backend URL (e.g., `https://finesse-backend.onrender.com/api`)

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at: `https://your-project.vercel.app`

## 🚀 Local Development

### Prerequisites
- Docker and Docker Compose
- Node.js 16+ and npm
- Python 3.9+

### Running with Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup

#### Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
# Create a .env file with:
# DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/finesse
# GEMINI_API_KEY=your_gemini_api_key

# Run migrations
python migrate_db.py

# Start server
docker-compose up -d backend #preferred
#then run this
docker-compose up -d --build  
#uvicorn app.main:app --reload --port 8000 #not preferred

```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 📱 Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📚 Lessons Included
1. **Introduction to Investing** - The basics of investing
2. **Stocks: Building Blocks of Wealth** - Understanding stocks
3. **Fundamental Analysis** - Evaluating companies
4. **Risk Management** - Protecting your investments

## 🔒 Authentication
- Secure JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- Protected routes

## 🌟 Features in Detail

### AI Tutor
- Powered by Google's Gemini AI
- Context-aware responses
- Rate-limited API calls
- Error handling and fallbacks

### Leaderboard
- Top 6 users displayed
- XP and streak tracking
- Visual ranking system
- Real-time updates

### Daily Challenges
- Earn bonus XP
- Track your streak
- Compete with friends

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License
This project is a functional MVP.

---

**Built for SEBI Hackathon** - Making financial literacy accessible and engaging for everyone.
