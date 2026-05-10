# Think Clash - Online Quiz Contest Engine

Think Clash is a full-stack, real-time quiz platform that allows users to create, manage, and participate in interactive quiz contests. The platform is separated into a Node.js/Express backend and a React/Vite frontend.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** Vanilla CSS (Responsive Design)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Architecture:** RESTful API

---

## 📁 Project Structure

```text
.
├── backend/               # Node.js Express server
│   ├── config/            # Database and environment configurations
│   ├── controllers/       # Route request handlers
│   ├── middleware/        # Custom Express middleware (Auth, Error handling)
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express API routes
│   ├── utils/             # Helper functions
│   └── server.js          # Entry point for the backend
│
└── frontend/              # React application
    ├── src/
    │   ├── api/           # Axios instance and API calls
    │   ├── components/    # Reusable UI components
    │   ├── context/       # React Context providers (Global state)
    │   ├── hooks/         # Custom React hooks
    │   ├── pages/         # Top-level page components
    │   ├── App.jsx        # Main application component
    │   └── main.jsx       # React DOM entry point
    └── vite.config.js     # Vite configuration
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Local instance or MongoDB Atlas cluster)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Dineshsdh/Online-quiz.git
cd "Online quiz"
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory based on the provided `.env.example` (or configure it manually):
```env
# backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/thinkclash  # Or your MongoDB Atlas URL
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```
*The server will start on `http://localhost:5000`.*

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The React app will be available at `http://localhost:5173`.*

> **Note on Local Proxying:** The frontend's `vite.config.js` is configured to automatically proxy API requests (`/api`) to `http://localhost:5000` during local development to avoid CORS issues.

---

## 🌐 Deployment

The application is configured to be deployed as two separate services.

### Backend Deployment (Render / Heroku)
1. Create a new Web Service and connect your repository.
2. Set the **Root Directory** (or build context) to `backend`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add the environment variables (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`) in the service dashboard.

### Frontend Deployment (Netlify / Vercel)
1. Connect your repository to your hosting provider.
2. Set the **Base directory** to `frontend`.
3. **Build Command:** `npm run build`
4. **Publish directory:** `frontend/dist`
5. *Important:* Update the `baseURL` in `frontend/src/api/axios.js` to point to your deployed backend URL before pushing.

---

## 📄 License
ISC License
