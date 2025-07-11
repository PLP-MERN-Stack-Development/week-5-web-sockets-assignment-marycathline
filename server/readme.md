# 💬 Real-Time Chat App – Week 5 Assignment

This is a real-time chat application built using **Socket.io**, **React**, and **Node.js/Express**. It supports public chat rooms, private messaging, reactions, file sharing, notifications, and performance optimizations like pagination and delivery acknowledgment.

---

## 🚀 Features Implemented

### ✅ Task 1: Real-Time Messaging
- Send/receive messages in real time using Socket.io
- Multiple chat rooms (general, support, random)
- User joins and leaves are broadcasted to the room

### ✅ Task 2: File Sharing
- Users can upload and share images in chat
- Images are displayed inline in the chat window

### ✅ Task 3: Reactions and Read Receipts
- Users can react to messages with emojis (❤️, 👍, 😂)
- Read receipts show who has seen each message

### ✅ Task 4: Real-Time Notifications
- Sound notification on new message
- Browser notification when a new message arrives or a user joins/leaves
- Unread message counter for inactive users

### ✅ Task 5: Performance & UX Optimization
- **Pagination**: Load messages in chunks
- **Message Search**: Search through previous messages by text
- **Reconnection Logic**: Automatically reconnect to server after disconnect
- **Delivery Acknowledgment**: Visual confirmation of delivery
- **Mobile Friendly**: Responsive UI built with Tailwind CSS

---

## 🛠️ Tech Stack

| Frontend              | Backend              | Real-time          |
|-----------------------|----------------------|---------------------|
| React + Tailwind CSS  | Express.js (Node.js) | Socket.io (v4.x)    |

---

## 📁 Folder Structure

chat-app/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/
│ │ │ └── PrivateChat.jsx
│ │ ├── context/
│ │ │ └── ChatContext.jsx
│ │ ├── pages/
│ │ │ └── Login.jsx
│ │ ├── socket/
│ │ │ └── socket.js
│ │ ├── App.jsx
│ │ └── main.jsx
│ └── public/
│ ├── ping.mp3 # Sound for notifications
│ └── chat-icon.png # Icon for browser notifications
│
├── server/ # Node.js backend
│ ├── api/
│ │ └── messages.js # Pagination + search API
│ ├── data/
│ │ └── memoryStore.js # In-memory DB store
│ └── server.js # Main Express + Socket.io server
│
├── .env
└── README.md


---

## ⚙️ Setup Instructions

### 1. Clone the Repo
```bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app

2. Install Dependencies

For server
bash
cd server
npm install

For client
bash
cd ../client
npm install

3. Set Up Environment Variables
In server/.env:
in
PORT=5000
CLIENT_URL=http://localhost:5173

4. Run the App
In one terminal (server):
bash

cd server
node server.js

In another terminal (client):
bash
cd client
npm run dev

📚 Available API Endpoints
Method	Endpoint	Description
GET	/api/messages	Get paginated messages
GET	/api/messages/search?q=...	Search messages by text
GET	/api/users	Get list of online users

📌 Known Limitations
Messages are stored in memory; data is lost on server restart

No authentication (open access)

Image uploads are not saved persistently

🧠 Future Improvements
Use MongoDB for persistent message/user storage

Add JWT authentication and user management

Add dark mode and chat themes

🧑‍💻 Author
Mary Cathline – PLP MERN Stack Week 5 Assignment
Mentored by PLP Academy | Built with ❤️ using Vite + Socket.io

📄 License
This project is for educational purposes as part of PLP Training and is free to use and adapt.