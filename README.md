# VocabVenture

## Backend Setup and Running Instructions

This document provides instructions on how to set up and run the VocabVenture backend application.

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
