# CivicConnect

## AI-Powered Civic Issue Reporting Platform

CivicConnect is a full-stack smart civic engagement platform that enables citizens to report public infrastructure issues such as potholes, garbage accumulation, and faulty streetlights using images and location data. The platform leverages Artificial Intelligence to automatically identify and categorize reported issues, helping local authorities respond more efficiently.

---

## Problem Statement

Urban infrastructure issues often remain unresolved due to inefficient reporting systems, lack of issue categorization, and poor communication between citizens and authorities.

CivicConnect bridges this gap by providing a centralized platform where citizens can report issues, track progress, and contribute to community improvement.

---

## Key Features

### Citizen Features

* User Registration & Authentication (JWT)
* Secure Login & Profile Management
* Report Civic Issues with Images
* Location-Based Issue Reporting
* Track Issue Status
* View Community Reports

### AI-Powered Detection

* Automatic Issue Classification using YOLOv8
* Image-Based Detection of:

  * Potholes
  * Garbage Dumps
  * Faulty Streetlights
* Faster and More Accurate Issue Categorization

### Dashboard & Analytics

* Issue Statistics
* Category-wise Distribution
* Real-Time Reporting Overview
* Community Monitoring Dashboard

### Security

* JWT Authentication
* Protected Routes
* Secure API Access
* Environment Variable Configuration

---

## System Architecture

```text
+--------------------+
|  React + Vite UI   |
+---------+----------+
          |
          v
+--------------------+
| Node.js + Express  |
| Authentication API |
| Business Logic     |
+---------+----------+
          |
          +----------------+
          |                |
          v                v
+----------------+  +----------------+
|   MongoDB      |  | FastAPI AI API |
| User & Issues  |  | YOLOv8 Model   |
+----------------+  +----------------+
```

---

## Technology Stack

### Frontend

* React.js
* Vite
* Axios
* React Router

### Backend

* Node.js
* Express.js
* JWT Authentication
* Cloudinary Integration

### Database

* MongoDB
* Mongoose

### AI Service

* FastAPI
* Python
* YOLOv8
* OpenCV
* NumPy
* Ultralytics

### Deployment Ready

* Frontend Hosting
* Backend Hosting
* AI Service Deployment
* MongoDB Atlas

---

## Project Structure

```text
CivicConnect/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── ai-service/
│   ├── models/
│   ├── main.py
│   └── requirements.txt
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/civicconnect.git
cd civicconnect
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### AI Service Setup

```bash
cd ai-service

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

python -m uvicorn main:app --reload --port 8000
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

AI_SERVICE_URL=http://localhost:8000
```

---

## API Overview

### Authentication

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Issues

```http
POST /api/v1/issues
GET  /api/v1/issues
GET  /api/v1/issues/:id
```

### Dashboard

```http
GET /api/v1/dashboard/stats
```

### AI Detection

```http
POST /detect
```

---

## Future Enhancements

* Mobile Application
* Real-Time Notifications
* GIS Mapping Integration
* Government Portal Integration
* Predictive Infrastructure Analytics
* Multi-Language Support
* Smart Priority Ranking using AI

---

## Learning Outcomes

This project demonstrates:

* Full-Stack Web Development
* REST API Design
* Authentication & Authorization
* Database Design with MongoDB
* AI/ML Integration in Production Systems
* Computer Vision using YOLOv8
* Microservice-Based Architecture
* Frontend-Backend-AI Service Communication

---

## Resume Highlights

* Developed a full-stack civic issue reporting platform using React, Node.js, MongoDB, FastAPI, and YOLOv8.
* Implemented AI-powered image classification for automatic detection of potholes, garbage, and streetlight issues.
* Designed secure JWT-based authentication and RESTful APIs for user and issue management.
* Built a scalable microservice architecture integrating frontend, backend, database, and AI services.

---

## License

This project is developed for educational, research, and demonstration purposes.
