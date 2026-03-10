# Backend Database — Local Setup & Modifications

## Overview

The backend uses **MongoDB** with **Mongoose**. There are no migration files; the schema is defined in the models and applied when the app runs.

---

## 1. Database connection

| Item | Location |
|------|----------|
| Connection logic | `config/db.js` |
| Connection string | From **`MONGODB_URI`** in `.env` |
| Retries | 3 attempts, 5s delay |

**Local MongoDB URI:**

```env
MONGODB_URI=mongodb://localhost:27017/thinkclash
```

Use this in your `.env` to point the backend at a **local** MongoDB instance. The database name is `thinkclash`.

---

## 2. Collections (Mongoose models)

| Model | File | Collection (default) | Purpose |
|-------|------|----------------------|--------|
| **User** | `models/User.js` | `users` | Hosts/admins: email, hashed password, name, role |
| **ContestRoom** | `models/ContestRoom.js` | `contestrooms` | Quiz rooms: roomCode, hostId, title, duration, status, etc. |
| **Question** | `models/Question.js` | `questions` | Questions per contest: prompt, 4 options, correctOption, points, order |
| **Submission** | `models/Submission.js` | `submissions` | Per-contest answers: participantId, responses, score, etc. |

Relationships:

- `ContestRoom.hostId` → `User`
- `Question.contestId` → `ContestRoom`
- `Submission.contestId` → `ContestRoom`, `Submission.questionId` (in responses) → `Question`

---

## 3. Modifying the database locally

### Option A: Use local MongoDB

1. **Install MongoDB** (if not installed):  
   [MongoDB Community Server](https://www.mongodb.com/try/download/community) or via package manager.

2. **Start MongoDB** (e.g. local service or):
   ```bash
   mongod
   ```

3. **Point backend to local DB** — in `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/thinkclash
   ```
   Comment or remove any Atlas/remote `MONGODB_URI` so only this line is used.

4. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```
   On first run, Mongoose will create the `thinkclash` database and collections when you create documents.

### Option B: Keep using MongoDB Atlas

Leave `MONGODB_URI` in `.env` as your Atlas connection string. All “modifications” below still apply; they just affect the Atlas database you’re connected to.

---

## 4. Changing the schema (adding/editing fields)

1. **Edit the right model** in `models/`:
   - `User.js` — user fields, roles
   - `ContestRoom.js` — room settings, status, limits
   - `Question.js` — question format, options, scoring
   - `Submission.js` — response shape, scoring fields

2. **Restart the server** so the new schema is loaded.

3. **Existing data:**  
   Mongoose does not auto-migrate. For new **required** fields either:
   - Add `default` in the schema, or  
   - Run a one-off script to backfill existing documents, or  
   - Use a separate DB (e.g. local) for testing schema changes.

---

## 5. Resetting / clearing local data

**Dropping the whole database (local only):**

- In **mongosh** (MongoDB shell):
  ```bash
  mongosh
  use thinkclash
  db.dropDatabase()
  ```
- Or delete the data directory MongoDB uses for this instance (e.g. `data/db`), then restart `mongod` (this wipes all DBs on that server).

**Dropping a single collection (e.g. for testing):**

```bash
mongosh
use thinkclash
db.submissions.deleteMany({})
db.contestrooms.deleteMany({})
# etc.
```

---

## 6. Quick reference — .env for local

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/thinkclash

# Optional
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
FRONTEND_URL=http://localhost:5173
```

After changing `.env`, restart the backend (`npm run dev`).
