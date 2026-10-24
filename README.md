# 💬 Chat Application (MERN + Socket.IO)

A full-stack **real-time chat application** built with **React, Redux Toolkit, Node.js, Express, MongoDB and Socket.IO**.

## 🚀 Features

* 🔐 JWT (httpOnly cookie) authentication — signup / login / logout
* 💬 Real-time one-to-one messaging with Socket.IO
* 🟢 Online / offline presence (multi-tab safe)
* 📎 File attachments (images, PDF, audio)
* ✏️ Edit messages (5-minute window) and delete-for-me
* 🔥 Self-destructing messages (30s / 1m / 5m)
* 🧠 Smart reply suggestions
* 📸 Text statuses that expire after 24 hours
* 🎨 Switchable chat themes (Tailwind CSS + daisyUI)

---

## 🛠️ Tech Stack

**Frontend:** React (Create React App), Redux Toolkit + redux-persist, Tailwind CSS 3, daisyUI 4, Socket.IO client, Axios

**Backend:** Node.js, Express, MongoDB + Mongoose, Socket.IO, JWT, bcrypt, multer, helmet, express-rate-limit

---

## 📁 Project Structure

```
Chat-app-project/
├── backend/
│   ├── config/        env.js, database.js, origins.js
│   ├── controllers/   userController, messageController, statusController
│   ├── middleware/    isAuthenticated, multer
│   ├── models/        user, message, conversation, status
│   ├── routes/        userRoute, messageRoute, statusRoutes
│   ├── socket/        socket.js
│   ├── uploads/       uploaded files (git-ignored)
│   └── index.js
├── frontend/
│   └── src/
│       ├── components/   (incl. status/)
│       ├── context/      ThemeContext, themes
│       ├── hooks/        useGetMessages, useGetOtherUsers, useGetRealTimeMessage
│       ├── redux/        user, message, socket slices + store
│       ├── utils/        smartReplies.js
│       └── config.js     BASE_URL
├── package.json          (backend dependencies + scripts — use this one)
└── .gitignore
```

---

## 🔐 Environment Variables

Create `backend/.env` (a `.env` in the project root also works):

```env
PORT=8080
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/chat_app?retryWrites=true&w=majority
JWT_SECRET_KEY=use_a_long_random_string
# Optional: extra allowed browser origins, comma-separated
ALLOWED_ORIGINS=http://192.168.1.5:3000
# Production only
NODE_ENV=production
```

Optional `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8080
```

⚠️ Never commit `.env` files.

---

## ⚙️ Setup

```bash
git clone <your-repo-url>
cd Chat-app-project

# backend (run from the project root)
npm install
npm run dev          # http://localhost:8080

# frontend (second terminal)
cd frontend
npm install
npm run dev          # http://localhost:3000
```

### Production

```bash
npm run build        # installs + builds the frontend
NODE_ENV=production npm start
```

The backend then serves `frontend/build` itself, and the frontend talks to the same origin automatically.

---

## 🔄 Real-Time Flow

1. User logs in → JWT stored in an httpOnly cookie
2. Socket connects with that cookie; the server identifies the user from it
3. Each user joins a private room, so messages reach all of their tabs
4. Messages are saved in MongoDB and pushed to the receiver instantly

---

## 📌 Security Practices

* bcrypt password hashing, JWT in httpOnly cookie
* Authenticated Socket.IO connections
* CORS allow-list, helmet, rate limiting on login/register
* NoSQL-injection sanitisation and input validation
* Upload allow-list (type + 10 MB size limit)

---

## 🚧 Future Enhancements

* 👥 Group chats
* 😀 Message reactions UI (backend is ready)
* 🔔 Notifications
* 🧑‍💻 Typing indicators
* 🌍 CI/CD

---

## 👨‍💻 Author

**Saurabh Kumar** — B.Tech CSE
