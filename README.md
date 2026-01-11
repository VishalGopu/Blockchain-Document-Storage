# Blockchain-Document-Storage

## EduChain - Secure Document Management System

A blockchain-powered document management system for educational institutions with AI-powered document verification.

## 🌟 Key Features

### 🔐 Blockchain Security
- Document integrity verification using blockchain
- Immutable audit trail for all uploads
- Tamper-proof document storage

### 🤖 AI Document Verification (NEW!)
- **Google Gemini Vision API** integration for automatic document type verification
- Validates that uploaded documents match their declared type
- Prevents fraudulent or incorrect document submissions
- Configurable confidence threshold (default: 75%)
- Support for PDF, JPG, and PNG files

### 👥 Role-Based Access
- **Admin/College**: Upload documents for students with AI verification
- **Student**: View and download their documents
- Document type classification (Certificate, Transcript, Diploma, etc.)

### 🔒 Security Features
- reCAPTCHA integration for authentication
- Session-based authentication
- Admin-only document upload
- Server-side validation

## 📋 Prerequisites

- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Node.js 14+ and npm
- Google Gemini API Key (for AI verification)
- Google reCAPTCHA keys

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Clone repository
git clone https://github.com/VishalGopu/Blockchain-Document-Storage.git
cd Blockchain-Document-Storage

# Configure environment variables
cp .env.example .env
# Edit .env with your actual credentials

# Set up database
# Create MySQL database: educhain_db

# Build and run
mvn clean install
mvn spring-boot:run
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 3. Configure Google Gemini API (for AI Verification)

See [GEMINI_SETUP.md](GEMINI_SETUP.md) for detailed instructions.

Quick steps:
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set environment variable: `GEMINI_API_KEY=your_key_here`
3. Restart application

## 📚 Documentation

- **[GEMINI_SETUP.md](GEMINI_SETUP.md)** - Complete guide for setting up AI document verification
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[SECRET_KEY_PLACEMENT.md](SECRET_KEY_PLACEMENT.md)** - Security configuration guide

## 🔧 Configuration

### Environment Variables

```properties
# Database
DATABASE_URL=jdbc:mysql://localhost:3306/educhain_db
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_password

# Google Gemini AI (Optional - disables verification if not set)
GEMINI_API_KEY=your_gemini_api_key

# reCAPTCHA
RECAPTCHA_SECRET_KEY=your_recaptcha_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Server Port
PORT=8080
```

### Application Properties

See `src/main/resources/application.properties` for all configuration options.

## 🎯 How AI Verification Works

1. **Admin selects** student and document type
2. **Uploads** PDF/JPG/PNG file
3. **System validates** file type and size
4. **AI analyzes** document structure, content, and authenticity
5. **Verification decision** based on confidence threshold
6. **If verified**: Document uploaded to blockchain
7. **If not verified**: Upload blocked with detailed reason

## 🧪 Testing

### Run Backend Tests
```bash
mvn test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

## 🏗️ Tech Stack

### Backend
- Spring Boot 3.1.5
- Spring Data JPA
- MySQL 8.0
- Web3j (Blockchain)
- Google Gemini API (AI Verification)
- Jackson (JSON processing)

### Frontend
- React 18
- Lucide React (Icons)
- Google reCAPTCHA

## 📊 Project Structure

```
Blockchain-Document-Storage/
├── src/
│   ├── main/
│   │   ├── java/com/educhain/document_system/
│   │   │   ├── controller/         # REST API endpoints
│   │   │   │   └── DocumentController.java
│   │   │   ├── service/            # Business logic
│   │   │   │   ├── GeminiVerificationService.java (NEW)
│   │   │   │   ├── DocumentService.java
│   │   │   │   └── UserService.java
│   │   │   ├── model/              # Data models
│   │   │   │   ├── VerificationResult.java (NEW)
│   │   │   │   ├── Document.java
│   │   │   │   └── User.java
│   │   │   └── repository/         # Data access
│   │   └── resources/
│   │       └── application.properties
│   └── test/                       # Unit tests
├── frontend/
│   └── src/
│       └── App.js                  # React application (Updated)
├── GEMINI_SETUP.md                 # AI setup guide (NEW)
├── IMPLEMENTATION_SUMMARY.md       # Implementation details (NEW)
├── .env.example                    # Environment template (NEW)
└── README.md                       # This file
```

## 🔒 Security

- ✅ API keys stored in environment variables
- ✅ Server-side validation and verification
- ✅ Role-based access control
- ✅ Session management with secure cookies
- ✅ File type and size validation
- ✅ reCAPTCHA bot protection
- ✅ CodeQL security scanning (0 vulnerabilities)

## 🚀 Deployment

### Railway/DigitalOcean Deployment

1. Set environment variables in platform dashboard
2. Deploy backend with `mvn clean install`
3. Build frontend with `npm run build`
4. Configure frontend to point to backend API

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check auth status

### Documents
- `POST /api/documents/upload` - Upload document (Admin only, with AI verification)
- `GET /api/documents/my-documents` - Get user's documents
- `GET /api/documents/download/{id}` - Download document
- `GET /api/documents/verify/{id}` - Verify document integrity
- `GET /api/documents/students` - Get all students (Admin only)
- `DELETE /api/documents/{id}` - Delete document (Admin only)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Vishal Gopu**
- GitHub: [@VishalGopu](https://github.com/VishalGopu)

## 🙏 Acknowledgments

- Google Gemini API for AI-powered verification
- Web3j for blockchain integration
- Spring Boot team for the excellent framework
- React team for the frontend library

## 📞 Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/VishalGopu/Blockchain-Document-Storage/issues)
- Check [GEMINI_SETUP.md](GEMINI_SETUP.md) for AI verification setup
- Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details
