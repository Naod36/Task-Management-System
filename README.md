🧠 Task Management System

A full-stack task and project management application built with NestJS, React, and PostgreSQL.

🚀 Overview

This system allows teams to manage projects, assign and track tasks, set deadlines, monitor progress, and receive notifications — all in one centralized dashboard.

It supports:

Creating and managing projects

Assigning tasks to specific users

Tracking progress and deadlines

Monitoring issues and workload adjustments

Sending notifications for task updates

🧩 Features
Feature Description
Add Projects Create and organize projects with title and description.
Task Assignment Assign tasks to users within a project.
Progress Tracking Update task status (To-Do, In-Progress, Done).
Set Deadlines Add deadlines for each task and project.
Issue Tracking Mark tasks as blocked or report issues.
Work Schedule Adjustment Change task assignees or due dates dynamically.
Notifications Notify members when a task is assigned or updated.
⚙️ Tech Stack
Layer Technology
Backend NestJS (Node.js Framework)
Database PostgreSQL + Prisma ORM
Frontend React + TypeScript + Tailwind CSS
Containerization Docker & Docker Compose
🧱 System Architecture
client/ → React frontend
server/ → NestJS backend
├── src/
│ ├── projects/ → Project management logic
│ ├── tasks/ → Task management logic
│ ├── users/ → Authentication & roles
└── prisma/ → Database schema & migrations
docker-compose.yml → Local PostgreSQL setup

⚡ Setup Instructions

1. Clone the repository
   git clone https://github.com/Naod36/Task-Management-System
   cd task-management-system

2. Start PostgreSQL via Docker
   docker compose up -d

3. Setup Backend
   cd server
   npm install
   npx prisma migrate dev
   npm run start:dev

Server will start at http://localhost:3000

4. Setup Frontend
   cd ../client
   npm install
   npm start

Frontend will start at http://localhost:5173 or http://localhost:3000

🧑‍💻 Example API Endpoints
Method Endpoint Description
POST /projects Create new project
GET /projects List all projects
POST /tasks Create a new task
PATCH /tasks/:id Update task status or assign user
GET /users List all users
