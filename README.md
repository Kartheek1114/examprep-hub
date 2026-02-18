# Prepnovus - Competitive Exam Preparation Hub

Prepnovus is a comprehensive MERN stack web application designed to help students prepare for competitive exams. It provides a robust platform for practice, topic-wise learning, and performance tracking.

## 🚀 Features

- **Topic-wise Practice:** Targeted questions for specific subjects.
- **Previous Year Questions (PYQ):** Real exam questions to build confidence.
- **Real-time Analytics:** Track your progress with detailed performance visualizations.
- **Auth System:** Secure signup, login, and Google OAuth integration.
- **Admin Dashboard:** Tools for easy question uploads and management.

## 🛠️ Technology Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend:** Node.js, Express.
- **Database:** MongoDB (via Mongoose).
- **Other:** Axios, Recharts, Lucide React.

## 📦 Installation & Local Development

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Kartheek1114/examprep-hub.git
   ```

2. **Frontend Setup:**
   ```sh
   cd examprep-hub
   npm install
   npm run dev
   ```

3. **Backend Setup:**
   ```sh
   cd backend
   npm install
   # Create a .env file with MONGO_URI, JWT_SECRET, etc.
   node server.js
   ```

## 🌐 Deployment

The project is designed to be deployed with:
- **Frontend:** Vercel / Netlify
- **Backend:** Render / Railway
- **Database:** MongoDB Atlas
