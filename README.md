# Formify - Professional Form Builder Platform

A modern, full-stack form builder application built with React, NestJS, and PostgreSQL. Create, manage, and analyze forms with a beautiful user interface and powerful backend API.

## 🚀 Features

- **Modern React Frontend** with Tailwind CSS
- **Robust NestJS Backend** with TypeORM
- **PostgreSQL Database** for reliable data storage
- **Real-time Form Submissions** with Socket.io
- **File Upload Support** for form attachments
- **Responsive Design** works on all devices
- **Form Analytics** and response management
- **Professional UI/UX** with glassmorphism effects

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Git

## 🏗️ Project Structure

```
FormBuilder/
├── form-builder-backend/     # NestJS API server
├── form-builder-frontend/    # React frontend app
└── README.md                # This file
```

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd FormBuilder
```

### 2. Backend Setup

```bash
cd form-builder-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Install PostgreSQL if not already installed
# Create a database named 'formify'

# Run database migrations(not mandatory)
npm run migration:run

# Start the development server
npm run start:dev
```

The backend will be running at: `http://localhost:4000`

### 3. Frontend Setup

```bash
cd form-builder-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at: `http://localhost:3000`

## ⚙️ Environment Variables

### Backend (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_DATABASE=formify

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=4000
NODE_ENV=development

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:4000
REACT_APP_SOCKET_URL=http://localhost:4000

# Application Configuration
REACT_APP_NAME=Formify
REACT_APP_VERSION=1.0.0
```

## 📚 Technology Stack

### Backend Technologies

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **TypeORM** - Modern ORM for TypeScript/JavaScript
- **PostgreSQL** - Powerful open-source database
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **bcrypt** - Password hashing
- **class-validator** - Input validation
- **@nestjs/config** - Configuration management

### Frontend Technologies

- **React 18** - Modern JavaScript library for building UIs
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Declarative routing for React
- **Axios** - HTTP client for API requests
- **Socket.io-client** - Real-time client library
- **Framer Motion** - Animation library for React
- **React Hook Form** - Performant forms library
- **React Hot Toast** - Beautiful toast notifications
- **@tanstack/react-table** - Headless UI for building tables

## 🗄️ Database Schema

The application uses the following main entities:

- **Users** - User authentication and management
- **Forms** - Form definitions and metadata
- **FormFields** - Form field configurations (stored as JSON)
- **FormResponses** - User-submitted form responses
- **Roles** - User role management (admin, user)

## 🔧 Development Commands

### Backend Commands

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start in debug mode
npm run start:prod         # Start production build

# Database
npm run migration:generate # Create new migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Building
npm run build              # Build for production
```

### Frontend Commands

```bash
# Development
npm start                  # Start development server
npm run dev                # Alternative start command

# Building
npm run build              # Build for production
npm run build:analyze      # Build with bundle analyzer

# Testing
npm test                   # Run tests
npm run test:coverage      # Run tests with coverage

# Linting
npm run lint               # Run ESLint
npm run lint:fix           # Fix linting issues
```

## 🌐 API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token

### Forms

- `GET /forms` - Get all user forms
- `POST /forms` - Create new form
- `GET /forms/:id` - Get form by ID
- `PUT /forms/:id` - Update form
- `DELETE /forms/:id` - Delete form
- `GET /forms/public/:slug` - Get public form by slug

### Form Responses

- `GET /forms/:id/responses` - Get form responses
- `POST /forms/:slug/responses` - Submit form response
- `GET /forms/:id/responses/export` - Export responses as CSV

### File Uploads

- `POST /upload` - Upload file
- `GET /uploads/:filename` - Serve uploaded file

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Comprehensive input sanitization
- **CORS Protection** - Cross-origin resource sharing controls
- **File Upload Security** - File type and size validation
- **Rate Limiting** - Prevent abuse and attacks
- **SQL Injection Protection** - TypeORM parameterized queries

## 📱 Features Overview

### Form Builder
- Drag-and-drop form builder interface
- Multiple field types (text, textarea, select, radio, checkbox, file, etc.)
- Field validation and conditional logic
- Real-time form preview
- Form customization options

### Form Management
- Create, edit, and delete forms
- Form status management (active/inactive)
- Form analytics and insights
- Response management and export
- Form sharing via public links

### User Experience
- Modern, responsive design
- Real-time form submissions
- File upload support
- Form progress indicators
- Mobile-friendly interface

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment**

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

2. **Frontend Deployment**

```bash
# Build the React app
npm run build

# Deploy the build folder to your hosting service
```

3. **Environment Setup**

- Configure production environment variables
- Set up PostgreSQL database
- Configure reverse proxy (nginx)
- Set up SSL certificates
- Configure file upload storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in .env
   - Verify database exists

2. **CORS Issues**
   - Check frontend URL in backend .env
   - Ensure CORS is properly configured

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure disk space is available

4. **Socket.io Connection Issues**
   - Check firewall settings
   - Verify socket URL configuration
   - Ensure WebSocket support

### Getting Help

- Check the logs for detailed error messages
- Review environment variable configuration
- Ensure all dependencies are installed
- Verify database schema is up to date

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

**Sathish** - *Full Stack Developer*
- GitHub: [@your-username]
- Email: your.email@example.com

## 🙏 Acknowledgments

- React team for the amazing library
- NestJS team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- Open source community for inspiration and libraries

---

**Built with ❤️ by Sathish**
