# Chat Application - CI/CD Pipeline with GitHub Actions

[![GitHub Actions](https://github.com/HARIHARANk2007/cicd-pipeline-automation-/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/HARIHARANk2007/cicd-pipeline-automation-/actions)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://hub.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack chat application with automated CI/CD deployment using GitHub Actions and Docker.

**Live Repository:** https://github.com/HARIHARANk2007/cicd-pipeline-automation-

## 🚀 Features

- User authentication (signup/login)
- Real-time messaging between users
- Online user status tracking
- Avatar selection
- MongoDB database integration
- Automated CI/CD pipeline with GitHub Actions
- Docker containerization

## 📋 Prerequisites

- Node.js 18 or higher
- MongoDB
- Docker and Docker Hub account (for deployment)
- GitHub account

## 🛠️ Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/HARIHARANk2007/cicd-pipeline-automation-.git
   cd cicd-pipeline-automation-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   ```

5. **Run the application**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

6. **Access the application**
   - Open browser at `http://localhost:3000`

## 🐳 Docker Setup

### Build Docker Image Locally

```bash
docker build -t chatapp:latest .
```

### Run with Docker

```bash
# Run MongoDB container
docker run -d --name mongo -p 27017:27017 mongo:latest

# Run the application
docker run -d -p 3000:3000 --name chatapp \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/chatapp \
  chatapp:latest
```

### Using Docker Compose (Recommended)

The repository includes a `docker-compose.yml` file. Simply run:

```bash
docker-compose up -d
```

This will start both MongoDB and the application with proper networking.

## 🔄 CI/CD Pipeline Setup

### GitHub Actions Workflow

The CI/CD pipeline is configured in [`.github/workflows/main.yml`](.github/workflows/main.yml:1) and includes:

1. **Test Stage**: Runs automated tests
2. **Build Stage**: Builds Docker image
3. **Push Stage**: Pushes image to Docker Hub
4. **Deploy Stage**: Deployment notification

### Pipeline Triggers

- **Push to main branch**: Runs full pipeline (test → build → push)
- **Pull requests**: Runs tests only

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password or access token

### Setting Up Docker Hub Access Token

1. Log in to [Docker Hub](https://hub.docker.com)
2. Go to **Account Settings** → **Security**
3. Click **New Access Token**
4. Give it a name (e.g., "GitHub Actions")
5. Copy the token and add it as `DOCKER_PASSWORD` secret in GitHub

## 📦 Deployment Process

### Automatic Deployment

1. **Push code to main branch**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **GitHub Actions automatically**:
   - Runs tests
   - Builds Docker image
   - Tags image with branch name, commit SHA, and 'latest'
   - Pushes to Docker Hub

3. **Pull and run the deployed image**:
   ```bash
   docker pull <your-dockerhub-username>/chatapp:latest
   docker run -d -p 3000:3000 \
     -e MONGODB_URI=mongodb://your-mongo-host:27017/chatapp \
     <your-dockerhub-username>/chatapp:latest
   ```

### Manual Deployment

Build and push manually:

```bash
# Build the image
docker build -t <your-dockerhub-username>/chatapp:latest .

# Login to Docker Hub
docker login

# Push the image
docker push <your-dockerhub-username>/chatapp:latest
```

## 🔍 Pipeline Stages Explained

### 1. Test Stage
- Checks out code
- Sets up Node.js environment
- Installs dependencies
- Runs test suite

### 2. Build Stage
- Only runs on push to main branch
- Sets up Docker Buildx
- Logs in to Docker Hub
- Builds multi-platform image
- Uses layer caching for faster builds
- Tags with multiple versions

### 3. Deploy Stage
- Confirms successful deployment
- Provides pull command for the image

## 📊 Monitoring Pipeline

1. Go to your GitHub repository
2. Click on **Actions** tab
3. View workflow runs and logs
4. Check build status and deployment details

## 🔧 Customization

### Modify Docker Image Name

Edit [`.github/workflows/main.yml`](.github/workflows/main.yml:10):
```yaml
env:
  DOCKER_IMAGE_NAME: your-custom-name
```

### Add More Test Steps

Edit [`package.json`](package.json:8):
```json
"scripts": {
  "test": "jest --coverage",
  "test:unit": "jest --testPathPattern=unit",
  "test:integration": "jest --testPathPattern=integration"
}
```

### Environment Variables

Add environment variables in the workflow file or use GitHub Secrets for sensitive data.

## 🐛 Troubleshooting

### Pipeline Fails at Test Stage
- Check test logs in GitHub Actions
- Ensure all dependencies are installed
- Verify test scripts in [`package.json`](package.json:8)

### Docker Build Fails
- Check [`Dockerfile`](Dockerfile:1) syntax
- Verify all required files are present
- Check [`.dockerignore`](.dockerignore:1) isn't excluding necessary files

### Docker Push Fails
- Verify Docker Hub credentials in GitHub Secrets
- Check Docker Hub repository exists
- Ensure you have push permissions

### Application Won't Start
- Check MongoDB connection string
- Verify environment variables
- Check application logs: `docker logs <container-id>`

## 📝 Project Structure

```
chatapp/
├── .github/
│   └── workflows/
│       └── main.yml          # CI/CD pipeline configuration
├── models/
│   ├── User.js               # User model
│   └── Message.js            # Message model
├── public/
│   └── avatars/              # User avatar images
├── views/
│   ├── index.ejs             # Users list page
│   ├── login.ejs             # Login page
│   ├── signup.ejs            # Signup page
│   └── chat.ejs              # Chat interface
├── .dockerignore             # Docker ignore file
├── .env.example              # Environment variables template
├── Dockerfile                # Docker configuration
├── package.json              # Node.js dependencies
├── server.js                 # Main application file
└── README.md                 # This file
```

## 🎯 Next Steps

1. **Add Real Tests**: Replace placeholder test with actual unit/integration tests
2. **Add Kubernetes Deployment**: Create K8s manifests for production deployment
3. **Set Up Monitoring**: Add logging and monitoring tools
4. **Implement WebSockets**: Add real-time messaging with Socket.io
5. **Add Database Migrations**: Implement schema versioning
6. **Security Hardening**: Add rate limiting, input validation, HTTPS

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to your fork
5. Create a Pull Request

The CI/CD pipeline will automatically run tests on your PR!