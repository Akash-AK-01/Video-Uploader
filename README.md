 # 🚀 Video Upload, Sensitivity Processing & Streaming Application

A full-stack production-ready system that allows users to upload videos, processes them for content sensitivity, and provides real-time progress updates and secure video streaming.

This project is built as part of the **Pulse Talent Team Full-Stack Assignment**.

---

# 📌 Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Architecture](#architecture)
* [Live Demo](#live-demo)
* [Tech Stack](#tech-stack)
* [Folder Structure](#folder-structure)
* [Installation & Setup](#installation--setup)
* [Environment Variables](#environment-variables)
* [Seeding Demo Accounts](#seeding-demo-accounts)
* [User Roles](#user-roles)
* [API Endpoints](#api-endpoints)
* [Sensitivity Analysis Workflow](#sensitivity-analysis-workflow)
* [Streaming Service](#streaming-service)
* [Deployment](#deployment)
* [Assignment Requirements Checklist](#assignment-requirements-checklist)
* [License](#license)

---

# 📘 Overview

This application demonstrates a complete video management workflow:

✔ Video upload (Editors & Admins)
✔ Sensitivity analysis with scoring (Safe / Flagged / Rejected)
✔ Real-time processing updates via Socket.io
✔ Video streaming using HTTP range requests
✔ Role-based access control (Viewer / Editor / Admin)
✔ Multi-tenant style user isolation
✔ Deployed full-stack (Frontend + Backend + Database)

The system is fully aligned with the assignment requirements.

---

# ⭐ Features

### 🔐 Authentication & Authorization

* JWT-based login system
* Role-based access: Viewer, Editor, Admin
* Multi-tenant-like user isolation

### 🎥 Video Upload & Processing

* Upload up to **500MB**
* Real-time progress updates
* FFmpeg-based video metadata extraction
* Sensitivity scoring:

  * Duration check
  * File size check
  * Filename keyword scan
  * Random analyzer (demo purposes)

### 📡 Real-Time Updates

* Upload progress
* Processing
* Analysis
* Completed or failed

### 🎬 Video Streaming

* HTTP Range requests
* Seamless playback experience
* Modal video player in UI

### 🧹 Clean Architecture

* Clear folder structure
* Services layer
* Controllers & routes separated
* Mongoose models for strong consistency

---

# 🏗 Architecture

```
┌──────────────────┐        ┌────────────────────┐        ┌─────────────┐
│    React Frontend │ <────> │   Express Backend   │ <────> │   MongoDB    │
│ (Vercel Hosting)  │        │ (Render + Docker)   │        │   Atlas      │
└─────────┬─────────┘        └──────────┬─────────┘        └─────────────┘
          │                               │
          └────────── Socket.io ──────────┘
```

---

# 🌐 Live Demo

### **Frontend**

🔗 [https://videouploaderfrontend.vercel.app/](https://videouploaderfrontend.vercel.app/)

### **Backend API**

🔗 [https://video-backend-dd6l.onrender.com](https://video-backend-dd6l.onrender.com)

### **GitHub Repository**

🔗 [https://github.com/Akash-AK-01/Video-Uploader](https://github.com/Akash-AK-01/Video-Uploader)

---

# 🧰 Tech Stack

### **Frontend**

* React + Vite
* Axios
* Socket.io-client
* Custom UI (orange theme)

### **Backend**

* Node.js + Express
* MongoDB + Mongoose
* Multer (video uploads)
* FFmpeg (metadata extraction)
* Socket.io (real-time updates)
* JWT & bcrypt
* Docker (Render deployment)

### **Database**

* MongoDB Atlas (cloud)

---

# 📁 Folder Structure

```
VideoUploader/
├── frontend/               # React + Vite
│   └── src/
│       ├── components/
│       ├── context/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│
└── backend/
    ├── config/
    ├── models/
    ├── middleware/
    ├── controllers/
    ├── routes/
    ├── services/
    ├── uploads/
    ├── server.js
    ├── seedUsers.js
    └── Dockerfile
```

---

# 🛠 Installation & Setup

## 1️⃣ Clone repository

```bash
git clone https://github.com/Akash-AK-01/Video-Uploader.git
cd Video-Uploader
```

## 2️⃣ Install backend

```bash
cd backend
npm install
```

## 3️⃣ Install frontend

```bash
cd ../frontend
npm install
```

---

# 🔧 Environment Variables

### Backend `.env`

```
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost:5174
NODE_ENV=development
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

# 🌱 Seeding Demo Accounts

```bash
cd backend
npm run seed
```

Creates:

| Role   | Email                                     | Password |
| ------ | ----------------------------------------- | -------- |
| Admin  | [admin@test.com](mailto:admin@test.com)   | demo123  |
| Editor | [editor@test.com](mailto:editor@test.com) | demo123  |
| Viewer | [viewer@test.com](mailto:viewer@test.com) | demo123  |

---

# 👥 User Roles

### Viewer

* See safe videos
* Watch videos
* No uploads

### Editor

* Upload videos
* See only own videos
* Delete own videos

### Admin

* See all videos
* Upload & delete any
* Full control

---

# 📡 API Endpoints (Summary)

### Auth

* `POST /api/auth/login`
* `GET /api/auth/me`

### Videos

* `POST /api/videos/upload`
* `GET /api/videos`
* `GET /api/videos/:id/stream`
* `DELETE /api/videos/:id`

### Utility

* `GET /api/health`

---

# 🔍 Sensitivity Analysis Workflow

Pipeline:

1. ⏳ **Upload**
2. 🛠 **Processing**
3. 🔍 **Analysis**
4. ✅ **Classification** (Safe/Flagged/Rejected)

Factors include:

* Video duration
* File size
* Filename keywords
* Random factor (demo feature)

---

# 🎬 Streaming Service

Uses **HTTP Range Requests** to support:

* Seeking
* Fast loading
* Streaming large files

---

# 🚀 Deployment

### **Frontend (Vercel)**

* Build: `npm run build`
* Output: `dist`
* ENV:

  ```
  VITE_API_URL=https://video-backend-dd6l.onrender.com/api
  VITE_SOCKET_URL=https://video-backend-dd6l.onrender.com
  ```

### **Backend (Render + Docker)**

* Dockerfile includes FFmpeg
* ENV:

  ```
  PORT=10000
  MONGODB_URI=your-atlas-uri
  JWT_SECRET=your-secret
  ```
* Deployed at:
  [https://video-backend-dd6l.onrender.com](https://video-backend-dd6l.onrender.com)

### **Database**

* MongoDB Atlas cluster
* User created + IP access configured

---

# 📋 Assignment Requirements Checklist

### Core

✔ Full Stack Architecture
✔ Video Upload
✔ Sensitivity Analysis
✔ Real-time Updates
✔ HTTP Range Streaming
✔ RBAC Roles
✔ Multi-Tenant Isolation

### Technical

✔ REST API
✔ MongoDB + Mongoose
✔ Socket.io
✔ JWT Authentication
✔ Multer
✔ FFmpeg
✔ Clean Folder Structure

### Deployment

✔ Public URL (Frontend)
✔ Public URL (Backend)
✔ MongoDB Atlas
✔ Demo Accounts

### Docs

✔ Setup Guide
✔ Architecture
✔ API Summary
✔ User Guide

---

# 📄 License

MIT License
Free to use for interview and learning purposes.

---

# 🎉 Final Note

This project is fully completed and deployed end-to-end, meeting all assignment requirements.
Demo accounts and all features work on the live environment.

 
