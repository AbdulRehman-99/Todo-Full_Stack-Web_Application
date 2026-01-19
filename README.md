# Full-Stack Todo Application

A comprehensive full-stack todo application built with Next.js 16+, FastAPI, and Neon PostgreSQL, featuring real-time task management with authentication and responsive UI.

## 🚀 Features

- **Full CRUD Operations**: Create, Read, Update, and Delete tasks
- **User Authentication**: JWT-based authentication system with login/signup
- **Welcome Landing Page**: Attractive landing page with slogan when visiting the homepage
- **Real-time Updates**: Instant task management with responsive UI
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Neon PostgreSQL Database**: Cloud-hosted PostgreSQL with SQLModel ORM
- **CORS Enabled**: Secure cross-origin resource sharing for frontend-backend communication
- **Account Switching**: Floating login button for easy account switching

## 🛠️ Tech Stack

### Frontend
- **Next.js 16+**: React framework with App Router
- **TypeScript 5+**: Type-safe JavaScript
- **Tailwind CSS 3.4+**: Utility-first CSS framework
- **React Hooks**: State management and side effects
- **Axios**: HTTP client for API requests

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLModel**: SQL toolkit and ORM with PyDantic integration
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
│   │   ├── page.tsx               # Home page with welcome message
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
│   ├── src/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── utils/
│   │   └── pages/
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
BACKEND_CORS_ORIGINS=["http://localhost:3005","http://localhost:3000","http://127.0.0.1:3005","http://127.0.0.1:3000"]
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

### Authentication
- `POST /api/v1/sign-in/email` - Login endpoint
- `POST /api/v1/sign-up/email` - Signup endpoint
- `POST /api/v1/refresh` - Token refresh
- `POST /api/v1/logout` - Logout endpoint
- `GET /api/v1/me` - Get current user info

## 🔐 Authentication

The application features a JWT-based authentication system:
- When visiting the homepage, users see a welcome message with a "Get Started" button
- Clicking the button reveals the login/signup forms
- A floating login button is available for account switching
- Tokens are securely stored in the browser
- Automatic token refresh functionality

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
Deploy the Next.js application to Vercel, Netlify, or any static hosting platform. The application is configured for easy deployment to Vercel.

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

## 🎯 User Experience

When users visit the application:
1. They see a welcoming landing page with the slogan "Stay Organized, Get Things Done"
2. A prominent "Get Started" button leads to the login/signup flow
3. After authentication, they gain access to their personalized task management dashboard
4. The floating login button allows for easy account switching at any time