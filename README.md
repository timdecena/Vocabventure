# VocabVenture

VocabVenture is a gamified vocabulary learning application with an adventure theme. The application helps users improve their vocabulary through interactive quests and challenges.

The project consists of two main components:
1. A Spring Boot backend API
2. A React frontend application

## Backend Setup and Running Instructions

This section provides instructions on how to set up and run the VocabVenture backend application.

### Prerequisites

- Java 11 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher
- Git (optional, for cloning the repository)

### Database Setup

1. Install XAMPP(MySQL) if you haven't already
2. Create a new database for the application:
   ```sql
   CREATE DATABASE vocabventure;
   ```
3. Create a MySQL user or use an existing one with permissions to access this database

### Application Setup

1. Clone or download the repository
2. Navigate to the backend directory:
   ```
   cd Vocabventure/backend
   ```
3. Configure the database connection in `src/main/resources/application.properties`:
   - Ensure the database URL, username, and password are correctly set
   - The default port for the application is 8081

### Running the Application

#### Using Maven

```bash
mvn spring-boot:run
```

#### Using the JAR file

1. Build the application:
   ```bash
   mvn clean package
   ```
2. Run the generated JAR file:
   ```bash
   java -jar target/VocabVenture-0.0.1-SNAPSHOT.jar
   ```

## Frontend Setup and Running Instructions

This section provides instructions on how to set up and run the VocabVenture frontend application.

### Prerequisites

- Node.js 14 or higher
- npm 6 or higher

### Application Setup

1. Navigate to the frontend directory:
   ```
   cd VocabVenture/frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

```bash
npm start
```

The application will be available at http://localhost:3000

### Building for Production

```bash
npm run build
```

This will create a production-ready build in the `build` directory.

## Features

- User authentication with JWT
- Profile management with customizable profile pictures
- Gamified learning experience with levels and achievements
- Responsive design for both desktop and mobile devices

### Verifying the Application

1. Once started, the application will be available at: `http://localhost:8081`
2. Access the Swagger documentation at: `http://localhost:8081/swagger-ui.html`

### Authentication

The application uses JWT for authentication:
1. Register a new user or use existing credentials
2. Obtain a JWT token by logging in
3. Include the token in the Authorization header for subsequent requests

### User Roles

The application supports two roles:
- STUDENT: Regular user with limited permissions
- TEACHER: Administrative user with extended permissions

### Troubleshooting

- If you encounter connection issues, ensure MySQL is running and accessible
- Check the application logs for detailed error messages
- Verify that port 8081 is not being used by another application
