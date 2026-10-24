<div align="center">

# 💬 Chat App

**A full-stack, real-time chat application built with the MERN stack and Socket.IO.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)

[Live Demo](https://chat-app23.onrender.com) · [Report a Bug](../../issues)

</div>

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture](#-architecture)
5. [Project Structure](#-project-structure)
6. [Getting Started](#-getting-started)
7. [Environment Variables](#-environment-variables)
8. [Available Scripts](#-available-scripts)
9. [API Reference](#-api-reference)
10. [Socket Events](#-socket-events)
11. [Data Models](#-data-models)
12. [Security](#-security)
13. [Deployment](#-deployment)
14. [Roadmap](#-roadmap)
15. [Author](#-author)

---

## 🔎 Overview

Chat App lets registered users talk one-to-one in real time. Messages are stored in MongoDB and pushed instantly to the recipient over Socket.IO. Beyond basic messaging it supports file attachments, editing, self-destructing messages, smart reply suggestions, 24-hour text statuses and switchable themes.

---

## ✨ Features

| Area | What you get |
| --- | --- |
| **Authentication** | Signup, login and logout with JWT stored in an httpOnly cookie |
| **Messaging** | Real-time one-to-one chat, persisted history, per-chat drafts |
| **Presence** | Online / offline indicator for every contact (multi-tab safe) |
| **Attachments** | Images, PDF  uploads (10 MB limit, type allow-list) |
| **Message tools** | Edit within 5 minutes, delete for me |
| **Self-destruct** | Messages that vanish after 30 seconds, 1 minute or 5 minutes |
| **Smart replies** | One-tap suggested replies based on the last incoming message |
| **Status** | Text statuses that expire automatically after 24 hours |
| **Themes** | Switchable chat themes and a resizable sidebar |

---

## 🛠️ Tech Stack

**Frontend**

- React 18 (Create React App)
- Redux Toolkit and redux-persist
- React Router 6
- Tailwind CSS 3 and daisyUI 4
- Socket.IO client, Axios, React Hot Toast

**Backend**

- Node.js and Express (ES modules)
- MongoDB with Mongoose
- Socket.IO
- JSON Web Tokens, bcryptjs
- Multer, Helmet, CORS, express-rate-limit, cookie-parser

---

## 🏗️ Architecture

```
┌──────────────┐   HTTP (REST, cookies)   ┌──────────────────┐        ┌──────────┐
│   React app  │ ───────────────────────▶ │  Express server  │ ─────▶ │ MongoDB  │
│ Redux store  │                          │  controllers     │        └──────────┘
│              │ ◀─────────────────────── │  middleware      │
└──────┬───────┘                          └────────┬─────────┘
       │            WebSocket (Socket.IO)          │
       └───────────────────────────────────────────┘
              newMessage · messageEdited · messageExpired · getOnlineUsers
```

**Message flow**

1. The sender posts the message to the REST API.
2. The server saves it in MongoDB and adds it to the conversation.
3. The server emits `newMessage` to the receiver's private socket room.
4. The receiver's client adds it to the Redux store and the UI updates.

---

## 📁 Project Structure

```
Chat-app-project/
├── backend/
│   ├── config/
│   │   ├── database.js         MongoDB connection
│   │   ├── env.js              Loads .env regardless of launch directory
│   │   └── origins.js          Allowed CORS origins
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── messageController.js
│   │   └── statusController.js
│   ├── middleware/
│   │   ├── isAuthenticated.js  JWT cookie check
│   │   └── multer.js           Upload rules
│   ├── models/                 user, message, conversation, status
│   ├── routes/                 userRoute, messageRoute, statusRoutes
│   ├── socket/socket.js        Socket.IO server and rooms
│   ├── uploads/                Uploaded files (git-ignored)
│   └── index.js                Server entry point
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/         UI, plus status/ sub-folder
│       ├── context/            Theme provider and theme definitions
│       ├── hooks/              Data-fetching and real-time hooks
│       ├── redux/              user, message and socket slices
│       ├── utils/              smartReplies.js
│       ├── config.js           API base URL
│       └── index.js            App entry point
├── package.json                Backend dependencies and scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A MongoDB database (local or MongoDB Atlas)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd Chat-app-project

# 2. Install backend dependencies (from the project root)
npm install

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

### Configuration

Create `backend/.env` using the variables in the next section.

### Run in development

Use two terminals:

```bash
# Terminal 1: backend on http://localhost:8080
npm run dev

# Terminal 2: frontend on http://localhost:3000
cd frontend
npm run dev
```

Open <http://localhost:3000>, create two accounts in two browsers, and start chatting.

---

## 🔐 Environment Variables

### `backend/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET_KEY` | Yes | Long random string used to sign tokens |
| `PORT` | No | Server port (default `8080`) |
| `ALLOWED_ORIGINS` | No | Extra browser origins, comma-separated |
| `NODE_ENV` | No | Set to `production` to serve the built frontend |

```env
PORT=8080
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/chat_app
JWT_SECRET_KEY=replace_with_a_long_random_string
ALLOWED_ORIGINS=http://192.168.1.5:3000
```

### `frontend/.env` (optional)

| Variable | Description |
| --- | --- |
| `REACT_APP_API_URL` | Backend URL. Defaults to `http://localhost:8080` in development and to the page's own origin in production |

> ⚠️ Never commit `.env` files. They are already listed in `.gitignore`.

---

## 📜 Available Scripts

### Project root (backend)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the server with nodemon |
| `npm start` | Start the server with node |
| `npm run build` | Install and build the frontend for production |

### `frontend/`

| Command | Description |
| --- | --- |
| `npm run dev` / `npm start` | Start the development server |
| `npm run build` | Create a production build in `build/` |
| `npm test` | Run tests |

---

## 📡 API Reference

Base path: `/api/v1`. Routes marked 🔒 require the login cookie.

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/user/register` | Create an account |
| POST | `/user/login` | Log in and receive the auth cookie |
| GET | `/user/logout` | Log out and clear the cookie |
| GET 🔒 | `/user` | List all other users |

### Messages

| Method | Endpoint | Description |
| --- | --- | --- |
| POST 🔒 | `/message/send/:id` | Send a message (multipart: `message`, `expiresIn`, optional `file`) |
| GET 🔒 | `/message/:id` | Get the conversation with a user |
| PUT 🔒 | `/message/edit/:id` | Edit your message (within 5 minutes) |
| DELETE 🔒 | `/message/delete-for-me/:id` | Hide a message for yourself |
| POST 🔒 | `/message/react/:id` | Add or change a reaction |

### Status

| Method | Endpoint | Description |
| --- | --- | --- |
| POST 🔒 | `/status` | Create a text status |
| GET 🔒 | `/status` | List active statuses |
| POST 🔒 | `/status/view/:id` | Mark a status as viewed |

---

## 🔌 Socket Events

The client connects with the auth cookie (`withCredentials: true`). The server identifies the user from it and joins them to a private room.

| Event | Direction | Payload |
| --- | --- | --- |
| `getOnlineUsers` | Server → all clients | Array of online user ids |
| `newMessage` | Server → receiver | The saved message |
| `messageEdited` | Server → receiver | `{ messageId, message, editedAt }` |
| `messageReaction` | Server → other participant | `{ messageId, reactions }` |
| `messageExpired` | Server → both participants | `{ messageId }` |

---

## 🗄️ Data Models

| Model | Key fields |
| --- | --- |
| **User** | `fullName`, `username` (unique), `password` (hashed), `profilePhoto`, `gender` |
| **Message** | `senderId`, `receiverId`, `message`, `image`, `fileType`, `expiresAt`, `editedAt`, `reactions[]`, `deletedFor[]` |
| **Conversation** | `participants[]`, `messages[]` |
| **Status** | `userId`, `type`, `text`, `backgroundColor`, `viewers[]`, `expiresAt` (TTL index) |

---

## 🛡️ Security

- Passwords hashed with bcrypt
- JWT in an httpOnly cookie, with `sameSite` and `secure` set per environment
- Socket connections authenticated through the same cookie
- CORS allow-list with credentials
- Helmet security headers
- Rate limiting on login and register
- Input sanitisation against NoSQL injection, plus type validation
- Upload allow-list by MIME type, 10 MB limit and sanitised filenames
- Ownership checks on edit, delete and react actions

---

## ☁️ Deployment

The backend can serve the built frontend, so one service is enough (for example on Render).

1. Set the environment variables above, including `NODE_ENV=production`.
2. Build command: `npm run build`
3. Start command: `npm start`

The frontend then calls the API on the same origin automatically.

> Socket.IO needs a long-lived server, so serverless platforms such as Vercel are not suitable for the backend.

---

## 🗺️ Roadmap

- [ ] Group chats
- [ ] Reactions interface (backend already supports it)
- [ ] Typing indicators and read receipts
- [ ] Image statuses
- [ ] Push notifications
- [ ] Message pagination
- [ ] Automated tests and CI/CD

---

## 👨‍💻 Author

**Saurabh Kumar**
Final-year B.Tech Computer Science student, MNIT Jaipur

---

<div align="center">

If you find this project useful, consider giving it a ⭐

</div>
