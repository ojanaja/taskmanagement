# Task Management System

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

A modern, full-stack task management application designed for efficient team collaboration. Built with a robust Spring Boot backend and a responsive React frontend, orchestrated via Docker Compose.

---

## Features

- **Kanban-Style Board**: Drag-and-drop tasks between "To Do", "In Progress", and "Done" columns.
- **Rich Task Details**: Create, edit, and delete tasks with priorities, due dates, and descriptions.
- **File Attachments**: Support for file uploads with size validation and preview.
- **User Assignment**: Assign tasks to specific users with visual avatars.
- **Optimistic Updates**: Immediate UI feedback for status changes.
- **Responsive Design**: Mobile-friendly interface built with Shadcn UI and Tailwind CSS.
- **Dockerized**: Fully containerized environment for consistent development and deployment.

---

## Architecture

```mermaid
graph TD
    Client[React Frontend] -->|REST API| Server[Spring Boot Backend]
    Server -->|JDBC| DB[(PostgreSQL Database)]
    Server -->|FileSystem| Storage[File Storage]
    
    subgraph Docker Network
    Server
    DB
    end
```

---

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: PostgreSQL 15
- **Build Tool**: Maven

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: Redux Toolkit
- **Drag & Drop**: @dnd-kit

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) installed.

### Quick Start (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```
   *This command builds both backend and frontend images and spins up the database.*

3. **Access the Application**
   - **Frontend**: [http://localhost:5173](http://localhost:5173) used in development or [http://localhost:5173](http://localhost:5173) mapped from container.
   - **Backend API**: [http://localhost:8080](http://localhost:8080)
   - **Database**: Port `5433` (mapped from `5432`)

### Manual Setup (Development)

#### Backend
```bash
cd backend
./mvnw spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

The application comes pre-configured for Docker usage. 

**Backend (`backend/src/main/resources/application.properties`):**
- `spring.datasource.url`: Database connection URL.
- `server.port`: 8080 (Default).

**Docker Compose (`docker-compose.yml`):**
- `POSTGRES_USER`: `postgres`
- `POSTGRES_PASSWORD`: `postgres`
- `POSTGRES_DB`: `taskdb`

---
