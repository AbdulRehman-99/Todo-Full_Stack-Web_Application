# Full-Stack Todo Application

A comprehensive full-stack todo application built with Next.js 16+, FastAPI, and Neon PostgreSQL, featuring real-time task management with authentication and responsive UI.

## 🚀 Features

- **Full CRUD Operations**: Create, Read, Update, and Delete tasks
- **User Authentication Ready**: JWT-based authentication system prepared for future implementation
- **Real-time Updates**: Instant task management with responsive UI
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Neon PostgreSQL Database**: Cloud-hosted PostgreSQL with SQLModel ORM
- **CORS Enabled**: Secure cross-origin resource sharing for frontend-backend communication

## 🛠️ Tech Stack

### Frontend
- **Next.js 16+**: React framework with App Router
- **TypeScript 5+**: Type-safe JavaScript
- **Tailwind CSS 3.4+**: Utility-first CSS framework
- **React Hooks**: State management and side effects

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLModel**: SQL toolkit and ORM with Pydantic integration
- **Python 3.11+**: Modern Python with async support
- **Pydantic**: Data validation and settings management

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL with auto-scaling
- **SQLModel**: SQL toolkit with SQLAlchemy and Pydantic integration

## 📁 Project Structure

```
├── Backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py          # Application configuration
│   │   ├── db/
│   │   │   └── session.py         # Database session management
│   │   ├── models/
│   │   │   └── task.py            # Task model definitions
│   │   ├── routes/
│   │   │   └── tasks.py           # Task API routes
│   │   ├── schemas/
│   │   │   └── task.py            # Pydantic schemas
│   │   ├── services/
│   │   │   └── task_service.py    # Business logic
│   │   └── main.py                # Main application entry point
│   ├── requirements.txt            # Python dependencies
│   └── .env                       # Environment variables
├── Frontend/
│   ├── app/
│   │   ├── page.tsx               # Home page
│   │   └── tasks/
│   │       ├── [id]/page.tsx      # Edit task page
│   │       └── new/page.tsx       # New task page
│   ├── components/
│   │   ├── TaskForm.tsx           # Task form component
│   │   ├── TaskItem.tsx           # Individual task component
│   │   └── TaskList.tsx           # Task list component
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   ├── types.ts               # TypeScript types
│   │   └── taskStore.tsx          # Global state management
│   ├── public/                    # Static assets
│   ├── styles/                    # Global styles
│   ├── package.json               # Node.js dependencies
│   └── next.config.js             # Next.js configuration
├── specs/                         # Project specifications
├── .env                          # Environment variables
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Navigate to the Backend directory and install Python dependencies:
```bash
cd Backend
pip install -r requirements.txt
```

3. Set up environment variables in `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
BACKEND_CORS_ORIGINS=["http://localhost:3005"]
SECRET_KEY=your-secret-key-here
NEON_DATABASE_URL=your-neon-database-url
```

4. Navigate to the Frontend directory and install Node.js dependencies:
```bash
cd ../Frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd Backend
uvicorn app.main:app --reload
```

2. In a new terminal, start the frontend server:
```bash
cd Frontend
npm run dev
```

3. Access the application:
- Frontend: [http://localhost:3005](http://localhost:3005)
- Backend API: [http://localhost:8000](http://localhost:8000)
- Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📝 API Endpoints

### Task Management
- `GET /api/{user_id}/` - Get all tasks for a user
- `POST /api/{user_id}/` - Create a new task
- `GET /api/{user_id}/{task_id}` - Get a specific task
- `PUT /api/{user_id}/{task_id}` - Update a specific task
- `DELETE /api/{user_id}/{task_id}` - Delete a specific task

## 🔐 Authentication

The application is prepared for JWT-based authentication. The `get_current_user` function in the backend is ready to validate tokens when authentication is implemented.

## 🗄️ Database Schema

The application uses SQLModel to define the task schema:
- `id`: Unique identifier for each task
- `user_id`: Identifier for the user who owns the task
- `title`: Task title (required)
- `description`: Task description (optional)
- `completed`: Boolean indicating completion status
- `created_at`: Timestamp when the task was created
- `updated_at`: Timestamp when the task was last updated

## 🧪 Testing

Backend tests can be run with:
```bash
cd Backend
pytest
```

## 🚀 Deployment

### Backend Deployment
Deploy the FastAPI application to any platform that supports Python applications (Heroku, AWS, Google Cloud, etc.)

### Frontend Deployment
Deploy the Next.js application to Vercel, Netlify, or any static hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact [your-email@example.com] or open an issue in the repository.