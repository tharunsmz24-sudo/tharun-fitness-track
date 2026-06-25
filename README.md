# 🏋️ Tharun Fitness Track

A full-stack fitness tracking web application built with the **MERN** stack (MongoDB, Express, React, Node.js). Track your workouts, monitor progress, and visualize your fitness journey.

## 🚀 Tech Stack

### Frontend
- **React 19** with React Router DOM
- **Vite** build tool
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** icons
- **jsPDF** for PDF export

### Backend
- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT** authentication
- **bcryptjs** for password hashing

---

## 📁 Project Structure

```
tharun fitness track/
├── frontend/          # React + Vite app
│   ├── src/
│   └── package.json
└── backend/           # Express REST API
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── scripts/
    ├── utils/
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/Aswinkumar-2006/tharun-fitness-track.git
cd tharun-fitness-track
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and the backend API at `http://localhost:5000`.

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

| Variable     | Description                      |
|--------------|----------------------------------|
| `PORT`       | Server port (default: 5000)      |
| `MONGO_URI`  | MongoDB connection string         |
| `JWT_SECRET` | Secret key for JWT tokens        |
| `NODE_ENV`   | `development` or `production`    |

---

## 📜 License

MIT License — feel free to use and modify.
