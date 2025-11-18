# 🧠 Task Management System

**A full-stack, collaborative application built to streamline project execution, task management, and team communication.**

---

## 🚀 Overview

This system allows teams and individuals to efficiently track, organize, and complete work across multiple projects. It provides a centralized dashboard where users can manage projects, assign and track tasks, set deadlines, monitor progress, and receive real-time notifications, moving beyond scattered emails and spreadsheets.

### Core Capabilities

- **Creating and managing projects**
- **Assigning tasks** to specific users
- **Tracking progress** and deadlines
- Monitoring issues and workload adjustments
- **Sending notifications** for task updates

---

## 🧩 Features

| Feature                      | Description                                                |
| :--------------------------- | :--------------------------------------------------------- |
| **Add Projects**             | Create and organize projects with title and description.   |
| **Task Assignment**          | Assign tasks to users within a project.                    |
| **Progress Tracking**        | Update task status (`PENDING`, `IN_PROGRESS`, `DONE`).     |
| **Set Deadlines**            | Add deadlines for each task and project.                   |
| **Issue Tracking**           | Mark tasks as blocked or report issues using Task Reports. |
| **Work Schedule Adjustment** | Change task assignees or due dates dynamically.            |
| **Notifications**            | Notify members when a task is assigned or updated.         |

---

## ⚙️ Tech Stack

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

1. Clone the repository
   git clone https://github.com/Naod36/Task-Management-System
   cd task-management-system

---

## 🧱 System Architecture

| Directory            | Description                                             |
| :------------------- | :------------------------------------------------------ |
| `client/`            | Contains the **React/TypeScript** frontend application. |
| `server/`            | Contains the **NestJS** backend application.            |
| `server/prisma/`     | Database schema, seeds, and migrations.                 |
| `docker-compose.yml` | Defines the local PostgreSQL database service.          |

---

## ⚡ Setup Instructions

To get this project running locally, you need **Node.js (v18+)**, **npm**, and **Docker** installed on your system.

### 1. Clone the Repository

Clone the project from your GitHub account and navigate into the directory:

```bash
git clone https://github.com/Naod36/Task-Management-System
cd Task-Management-System
```

### 2. Configure Environment

Create a .env file in the root of your project directory and add your database connection string and required secrets:

### .env

```bash
# PostgreSQL Connection URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskdb"

# JWT Secret for Authentication (Use a long, random string)
JWT_SECRET="YOUR_SUPER_SECRET_KEY"
```

### 3. Start the Database (PostgreSQL via Docker)

Start the PostgreSQL service defined in the `docker-compose.yml` file. This command will run the container in detached mode (`-d`):

```bash
docker compose up -d
```

### 4. Setup and Run the Backend (NestJS)

Navigate to the `server/` directory, install dependencies, run database migrations, and start the development server.

```bash
cd server
npm install
npx prisma migrate dev --name init # Apply the schema to the new PostgreSQL container
npm run start:dev
```

The backend server will be available at `http://localhost:3000`

### 5. Setup and Run the Frontend (React)

Open a new terminal tab/window, navigate back to the root, and then into the `client/` directory.

```bash
cd ..
cd client
npm install
npm run dev
```

The frontend application will typically start at `http://localhost:5173` (determined by Vite).

## 🧑‍💻 Example API Endpoints

| Method  | Endpoint   | Description                       |
| :------ | :--------- | :-------------------------------- |
| `POST`  | /projects  | Create new project                |
| `GET`   | /projects  | List all projects                 |
| `POST`  | /tasks     | Create a new task                 |
| `PATCH` | /tasks/id, | Update task status or assign user |
| `GET`   | /users     | List all users                    |

and so on...

### 🚀 My very first project with nestjs
