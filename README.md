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

| Layer                | Technology                                                                          |
| :------------------- | :---------------------------------------------------------------------------------- |
| **Backend**          | [NestJS](https://nestjs.com/) (Node.js Framework)                                   |
| **Database**         | PostgreSQL                                                                          |
| **ORM**              | [Prisma ORM](https://www.prisma.io/)                                                |
| **Frontend**         | [React](https://react.dev/) + TypeScript + [Tailwind CSS](https://tailwindcss.com/) |
| **Containerization** | Docker & Docker Compose                                                             |

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

````bash
git clone [https://github.com/Naod36/Task-Management-System.git](https://github.com/Naod36/Task-Management-System.git)
cd Task-Management-System

That's a fantastic starting point! A clear, detailed README is crucial for adoption. Since your project uses Docker for the database and separate client/ and server/ directories, the installation instructions need to be very explicit.

Here is the complete, formatted README.md file, combining your content and adding precise installation steps:

Markdown

# 🧠 Task Management System

**A full-stack, collaborative application built to streamline project execution, task management, and team communication.**

---

## 🚀 Overview

This system allows teams and individuals to efficiently track, organize, and complete work across multiple projects. It provides a centralized dashboard where users can manage projects, assign and track tasks, set deadlines, monitor progress, and receive real-time notifications, moving beyond scattered emails and spreadsheets.

### Core Capabilities

* **Creating and managing projects**
* **Assigning tasks** to specific users
* **Tracking progress** and deadlines
* Monitoring issues and workload adjustments
* **Sending notifications** for task updates

---

## 🧩 Features

| Feature | Description |
| :--- | :--- |
| **Add Projects** | Create and organize projects with title and description. |
| **Task Assignment** | Assign tasks to users within a project. |
| **Progress Tracking** | Update task status (`PENDING`, `IN_PROGRESS`, `DONE`). |
| **Set Deadlines** | Add deadlines for each task and project. |
| **Issue Tracking** | Mark tasks as blocked or report issues using Task Reports. |
| **Work Schedule Adjustment** | Change task assignees or due dates dynamically. |
| **Notifications** | Notify members when a task is assigned or updated. |

---

## ⚙️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | [NestJS](https://nestjs.com/) (Node.js Framework) |
| **Database** | PostgreSQL |
| **ORM** | [Prisma ORM](https://www.prisma.io/) |
| **Frontend** | [React](https://react.dev/) + TypeScript + [Tailwind CSS](https://tailwindcss.com/) |
| **Containerization** | Docker & Docker Compose |

---

## 🧱 System Architecture

| Directory | Description |
| :--- | :--- |
| `client/` | Contains the **React/TypeScript** frontend application. |
| `server/` | Contains the **NestJS** backend application. |
| `server/prisma/` | Database schema, seeds, and migrations. |
| `docker-compose.yml` | Defines the local PostgreSQL database service. |

---

## ⚡ Setup Instructions

To get this project running locally, you need **Node.js (v18+)**, **npm**, and **Docker** installed on your system.

### 1. Clone the Repository

Clone the project from your GitHub account and navigate into the directory:

```bash
git clone [https://github.com/Naod36/Task-Management-System.git](https://github.com/Naod36/Task-Management-System.git)
cd Task-Management-System

2. Configure Environment
Create a .env file in the root of your project directory and add your database connection string and required secrets:

.env

# PostgreSQL Connection URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskdb"

# JWT Secret for Authentication (Use a long, random string)
JWT_SECRET="YOUR_SUPER_SECRET_KEY"
````
