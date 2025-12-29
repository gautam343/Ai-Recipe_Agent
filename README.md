# AI Recipe Agent 🤖🍳

An intelligent recipe discovery application that uses AI to analyze food images and provide personalized recipe recommendations. Built with React frontend, Node.js backend, and powered by Google Gemini AI.

![Demo Screenshot](https://via.placeholder.com/800x400?text=AI+Recipe+Agent+Demo)

## ✨ Features

- **Image Analysis**: Upload food photos and get instant recipe suggestions
- **Smart Chef AI**: Interactive AI assistant for cooking guidance
- **Recipe Management**: Save and organize your favorite recipes
- **User Authentication**: Secure login and registration system
- **Personalized Recommendations**: AI-powered recipe suggestions based on your preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens

### Database
- **PostgreSQL** - Primary database

### AI & External Services
- **Google Gemini AI** - Image analysis and recipe generation
- **Multer** - File upload handling

### DevOps & Deployment
- **Docker** - Containerization
- **Render** - Cloud hosting platform

## 📋 Prerequisites

Before running this application, make sure you have:
- **Node.js** (v16 or higher)
- **Docker** and **Docker Compose**
- **Git**
- **Google Gemini API Key**

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/gautam343/Ai-Recipe_Agent.git
cd Ai-Recipe_Agent
```

### 2. Environment Configuration
Create environment files:

**For Local Development (.env):**
```env
# Database Configuration
DB_DIALECT=postgres
DB_HOST=postgres
DB_NAME=nebula9_db
DB_PASS=password
DB_USER=postgres

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Frontend API URL
REACT_APP_API_URL=http://backend:5000/api
```

**For Production (.env.example):**
```env
DB_DIALECT=postgres
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASS=your_db_password
DB_USER=your_db_user
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

### 3. Run with Docker Compose
```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up -d --build

# Stop services
docker compose down
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📖 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
```

### Recipe Endpoints
```
GET /api/recipes - Get all recipes
POST /api/recipes - Create new recipe
GET /api/recipes/:id - Get specific recipe
PUT /api/recipes/:id - Update recipe
DELETE /api/recipes/:id - Delete recipe
```

### AI Endpoints
```
POST /api/smart-chef - Get AI cooking recommendations
POST /api/vision/analyze - Analyze food image
```

### Request Examples

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Upload Image for Analysis:**
```bash
curl -X POST http://localhost:5000/api/vision/analyze \
  -F "image=@food_image.jpg"
```

## 🌐 Production Deployment

### Render Deployment

Your application is deployed on Render with the following live URLs:
- **Frontend**: https://ai-recipe-agent.onrender.com
- **Backend API**: https://nebula9-backend.onrender.com

#### Frontend Setup (Static Site)
1. **Create Static Site** in Render Dashboard
2. **Connect Repository**: `gautam343/Ai-Recipe_Agent`
3. **Build Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `build`
4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://nebula9-backend.onrender.com/api
   ```
5. **Deploy**: Automatic on push to `main` branch

#### Backend Setup (Web Service)
1. **Create Web Service** in Render Dashboard
2. **Connect Repository**: `gautam343/Ai-Recipe_Agent`
3. **Service Settings**:
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. **Environment Variables**:
   ```env
   DB_DIALECT=postgres
   DB_HOST=your_render_postgres_host
   DB_NAME=your_database_name
   DB_PASS=your_database_password
   DB_USER=your_database_user
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_secure_jwt_secret
   ```
5. **Database**: Create Render PostgreSQL database and use its connection details

#### Database Setup
1. **Create PostgreSQL** database in Render
2. **Note Connection Details** (host, database name, user, password)
3. **Update Backend Environment** with these credentials
4. **Database Migration**: Runs automatically on first deployment via Sequelize sync

### Deployment Workflow
- **Automatic**: Push to `main` branch triggers both frontend and backend redeployment
- **Manual**: Use Render dashboard for manual deploys
- **Monitoring**: Check logs in Render dashboard for both services

### Environment Variables for Production
```env
DB_DIALECT=postgres
DB_HOST=your_render_db_host
DB_NAME=your_db_name
DB_PASS=your_db_password
DB_USER=your_db_user
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secure_jwt_secret
```

## 🧪 Testing

### API Testing with Postman
Import the following collection to test endpoints:
- Authentication flows
- Recipe CRUD operations
- AI feature testing

### Local Testing
```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the intelligent recipe analysis
- **Render** for reliable cloud hosting
- **Open source community** for amazing tools and libraries

## � Project Assumptions

While developing and deploying this AI Recipe Agent, the following assumptions were made:

### Technical Assumptions
- **Node.js Version**: Compatible with Node.js v16+ (as specified in package.json engines)
- **Database Compatibility**: PostgreSQL is the primary database; other databases may require configuration changes
- **API Rate Limits**: Google Gemini API has reasonable rate limits for the free tier usage
- **File Upload Limits**: Image uploads are within typical web application limits (handled by Multer)
- **Browser Compatibility**: Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge)

### Deployment Assumptions
- **Render Free Tier**: Sufficient for development and light production use
- **GitHub Integration**: Repository remains public and connected to Render services
- **Environment Security**: Sensitive credentials are properly configured in Render environment variables
- **Database Persistence**: Render PostgreSQL maintains data between deployments

### Feature Assumptions
- **AI Accuracy**: Google Gemini provides reliable food image analysis and recipe generation
- **User Authentication**: JWT tokens provide sufficient security for user sessions
- **Recipe Data**: CSV seed data contains valid recipe information
- **Image Processing**: Uploaded images are valid food photos in common formats (JPG, PNG)

### Development Assumptions
- **Local Environment**: Docker and Docker Compose are available for local development
- **API Testing**: Postman or similar tools for testing backend endpoints
- **Git Workflow**: Standard Git practices with main branch for production
- **Package Management**: npm for dependency management

### Security Assumptions
- **CORS Policy**: Current CORS configuration is sufficient for the application domains
- **Input Validation**: Basic validation prevents common security issues
- **API Keys**: Google Gemini API key has appropriate permissions and quota
- **Environment Variables**: All sensitive data is stored in environment variables, not hardcoded

### Performance Assumptions
- **Response Times**: AI processing and database queries complete within reasonable time limits
- **Concurrent Users**: Application handles typical user loads for a development/demo project
- **Image Sizes**: Uploaded images are optimized for web delivery
- **Database Queries**: Sequelize models and queries are optimized for the current data volume

If any of these assumptions change, the application may require adjustments to maintain optimal performance and security.

---

**Happy Cooking! 🍽️✨**

Made with ❤️ by [Gautam](https://github.com/gautam343)