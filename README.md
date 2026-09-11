# Full-Stack Task Manager (Next.js + Express + MongoDB)

A clean, beginner-friendly full-stack Task Manager application built to understand the core mechanics of React, Next.js, Express, Mongoose, and MongoDB.

---

## Architecture Overview

```text
Browser
   ↓
Next.js React UI (Port 3000)
   ↓  HTTP fetch requests
Express REST API (Port 5000)
   ↓
Mongoose ODM
   ↓
MongoDB Database
```

---

## Technologies Used

- **Frontend**: Next.js 16 (App Router), React 19, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express 5, CORS, Dotenv
- **Database**: MongoDB with Mongoose 9 ODM

---

## Project Structure

```text
task-managment-full-stack-app/
├── server/                      # Express Backend Server
│   ├── config/
│   │   └── db.js                # MongoDB Mongoose connection
│   ├── models/
│   │   └── Task.js              # Mongoose Task schema & model
│   ├── routes/
│   │   └── taskRoutes.js        # REST API endpoints for /api/tasks
│   └── server.js                # Express app entry point (port 5000)
│
├── src/                         # Next.js Frontend
│   ├── app/
│   │   ├── layout.js            # Root layout with responsive Navbar
│   │   ├── globals.css          # Tailwind CSS styles & color tokens
│   │   ├── page.js              # Dashboard page (list, filter, toggle, delete)
│   │   └── tasks/
│   │       ├── new/page.js      # Create new task form page
│   │       └── [id]/page.js     # Task detail & edit page
│   │
│   ├── components/              # Reusable UI components
│   │   ├── Navbar.js            # Top navigation bar
│   │   ├── Button.js            # Styled action button (variants & sizes)
│   │   ├── TaskCard.js          # Single task presentation card
│   │   ├── TaskList.js          # Task collection container / empty state
│   │   ├── TaskForm.js          # Reusable form (Create / Edit modes)
│   │   ├── Loading.js           # Animated loading spinner
│   │   └── ErrorMessage.js      # Error alert banner
│   │
│   └── lib/
│       └── api.js               # Centralized client fetch wrapper for Express API
│
├── .env.example                 # Sample environment variables
├── .env                         # Local environment configuration
└── package.json                 # Project dependencies and run scripts
```

---

## Environment Configuration

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

Contents of `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task-manager
# Or use your MongoDB Atlas connection string:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/task-manager?retryWrites=true&w=majority
```

Optional frontend override in `.env.local` (defaults to `http://localhost:5000/api`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database with Sample Tasks (Optional)
Make sure MongoDB is running or your Atlas URI is in `.env`, then run:
```bash
npm run seed
```

### 3. Start the Express Backend Server (Port 5000)
```bash
npm run server
# or with auto-restart on changes:
npm run server:watch
```

### 4. Start the Next.js Frontend Dev Server (Port 3000)
In a separate terminal window:
```bash
npm run dev
```

### 4. Open in Browser
Visit [http://localhost:3000](http://localhost:3000).

---

## REST API Endpoints

The Express server exposes the following routes under `/api/tasks`:

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/tasks` | Fetch all tasks (newest first) | 200, 500, 503 |
| `POST` | `/api/tasks` | Create a new task (`{ title, description }`) | 201, 400, 503 |
| `GET` | `/api/tasks/:id` | Fetch single task by MongoDB ObjectId | 200, 400, 404, 503 |
| `PATCH` | `/api/tasks/:id` | Update task (`title`, `description`, `completed`) | 200, 400, 404, 503 |
| `DELETE` | `/api/tasks/:id` | Delete task by ID | 200, 400, 404, 503 |
| `GET` | `/api/health` | Server health check endpoint | 200 |

---

## How the Frontend Communicates with the API

1. **Centralized Helper (`src/lib/api.js`)**: All HTTP calls (`fetch`) are located in one file. Components don't write raw `fetch()` calls or handle boilerplate headers.
2. **Dashboard (`src/app/page.js`)**:
   - Calls `fetchTasks()` inside `useEffect` on initial mount.
   - Filtering (All, Active, Completed) is calculated client-side from the retrieved task state.
   - Status toggling triggers `updateTask(id, { completed: !task.completed })`.
   - Deletion triggers `deleteTask(id)` with a confirmation prompt.
3. **Task Creation (`src/app/tasks/new/page.js`)**:
   - Submits title and description to `createTask()`.
   - On success, redirects the user back to `/` using Next.js `useRouter`.
4. **Task Editing (`src/app/tasks/[id]/page.js`)**:
   - Fetches the existing task using `fetchTask(id)`.
   - Populates `TaskForm` in edit mode.
   - Submits changes to `updateTask(id, formData)`.
