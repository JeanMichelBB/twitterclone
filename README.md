# Twitter Clone

This repository contains the code for a Twitter clone application built with a full-stack approach using React, Vite, TypeScript, FastAPI, and MySQL. The application allows users to post tweets, follow other users, send messages, and more. The deployed application can be found [here](https://twitterclone.sacenpapier.synology.me/).

![image](header.png)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication and authorization
- Tweet creation, deletion, and liking
- Follow and unfollow users
- Send and receive direct messages
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Backend**: FastAPI
- **Database**: MySQL
- **Deployment**: Docker, Nginx

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/)
- [Python](https://www.python.org/downloads/)
- [MySQL](https://dev.mysql.com/downloads/mysql/)
- [Docker](https://www.docker.com/products/docker-desktop)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/JeanMichelBB/twitterclone.git
cd twitterclone
```

2. **Backend Setup:**

   - Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

   - Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

   - Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

   - Run the database migrations:
   ```bash
   alembic upgrade head
   ```

   - Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

3. **Frontend Setup:**

   - Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```

   - Install the dependencies:
   ```bash
   npm install
   ```

   - Start the development server:
   ```bash
   npm run dev
   ```

### Running the Application

1. **Backend:**
   - The FastAPI backend will be running at `http://localhost:8000`.

2. **Frontend:**
   - The React frontend will be running at `http://localhost:3000`.

## Folder Structure

```
twitter-clone/
│
├── backend/
│   ├── alembic/               # Database migrations
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── core/              # Core settings and configurations
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py            # Entry point for the backend
│   ├── tests/                 # Backend tests
│   ├── requirements.txt       # Python dependencies
│   └── alembic.ini            # Alembic configuration
│
├── frontend/
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # Context API
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # React pages
│   │   ├── services/          # API services
│   │   ├── App.tsx            # Main App component
│   │   └── index.tsx          # Entry point for the frontend
│   ├── vite.config.ts         # Vite configuration
│   └── tsconfig.json          # TypeScript configuration
│
└── docker-compose.yml         # Docker Compose configuration
```

## Environment Variables

Create a `.env` file in the `backend` directory and add the following environment variables:

```
DATABASE_URL=mysql://username:password@localhost:3306/twitter_clone
SECRET_KEY=your_secret_key
```

For the frontend, you can create a `.env` file in the `frontend` directory and add any necessary environment variables, such as API endpoint URLs.

## Deployment

1. **Docker:**

   - Ensure Docker is installed and running.
   - Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. **Nginx:**

   - Nginx is used as a reverse proxy to handle requests.
   - Configure Nginx with your domain and SSL certificates.
   - Restart Nginx to apply the new configuration.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## Personal Information
<!-- linktend webside  -->
- [Linkedin](http://linkedin.com/in/jeanmichelbb/)
- [Portfolio](https://jeanmichelbb.github.io/)


<!-- mysql -u root -p -->


