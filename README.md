# ☠️ Awop Chat - One Piece Themed Real-time Chat App

Awop Chat is a real-time chat application where users can create or join rooms using room codes. Designed with an anime-inspired One Piece theme, this app brings a fun pirate twist to your chatting experience!


---

## 🚀 Features

- 🌊 Create or Join chat rooms using a unique room code
- 🧑‍🤝‍🧑 View online users in each room (shows admin/captain)
- ✨ Real-time message exchange using **Socket.IO**
- 🎨 Fully responsive and One Piece-themed UI
- 🧭 Admin/Captain automatically assigned to the first user
- 📜 Simple and clean UX with pirate flair!

---

## 📦 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Query-string

### Backend (Hosted)
- Node.js
- Express.js
- Socket.IO

> Backend Repo / Endpoint: `https://awop.onrender.com`

---


## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/awop-chat.git
cd awop-chat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm start
```

App runs on: [http://localhost:3000](http://localhost:3000)

> Make sure your backend (Node.js + Socket.IO) is deployed and working at the URL configured in the frontend.

---

## 🔐 Environment Variables

If you want to self-host the backend, update the backend URL in the `socket.io` connection:

```js
const socket = io("https://your-deployment-url.com");
```

---

## 👥 Contributing

Got pirate vibes or UI magic to add? Contributions are welcome!  
Feel free to fork the repo and submit a pull request.

---

## 📜 License

This project is licensed under the **MIT License**.

---

## ☎️ Contact

Made with ❤️ by **Balaji R**  
📧 balaji648balaji@gmail.com
🐙 GitHub: [github.com/balaji-r-2007](https://github.com/balaji-r-2007)

---

> “**I’m gonna be the Pirate King!**” – Monkey D. Luffy  