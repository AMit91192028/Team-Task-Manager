# Team Task Manager

A full-stack company task management application with:

- `backend`: Express.js + MongoDB REST API
- `frontend`: React.js + React Router + Axios + Context API

The app lets users register, create projects, add members, assign tasks, update status, and monitor overdue work from a responsive dashboard.

## Tech Stack

### Frontend

- React.js
- React Router DOM
- Axios
- Context API
- Component-wise CSS

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication with cookies
- Express Validator

## Project Structure

```text
Ethara.AI/
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── controllers/
│       ├── db/
│       ├── middlewares/
│       ├── models/
│       ├── router/
│       └── validations/
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── hooks/
        ├── layouts/
        ├── pages/
        ├── routes/
        └── utils/
```

## Main Features

- Signup and login with cookie-based authentication
- Dashboard with summary cards and overdue task view
- Project creation and project listing
- Member management inside projects
- Task creation, assignment, and status updates
- My Tasks page for personal work tracking
- Responsive layout for desktop and mobile

## Backend Review

The backend now matches the assignment more closely. I fixed the main issues that would have blocked the frontend:

- corrected broken auth route validation wiring
- fixed current user loading from JWT
- fixed MongoDB env key mismatch
- fixed dashboard controller import bug
- fixed CORS and cookie usage for React frontend
- added proper validation flow and API error handling
- improved project access so project creators and members can both see relevant data
- updated member addition so frontend can add users by email

## Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend URL:

```text
https://team-task-manager-52nx.onrender.com
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
https://team-task-manager-mocha-psi.vercel.app/
```

## Production Build

```bash
cd frontend
npm run build
```

## Important Notes

- The frontend uses `withCredentials: true` so auth cookies work with the backend.
- The backend is configured for the React frontend running on `http://localhost:5173`.
- Users can sign up directly as `member` or `admin` from the signup form.
- Admin users can create projects and assign tasks.
- Members can update the status of tasks assigned to them.
