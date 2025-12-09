# 📘 Vocabventure

Vocabventure is a full-stack learning platform featuring spelling challenges, four-pics-one-word games, feedback tools, and role-based dashboards for students, teachers, and administrators.

---

# 🚀 Tech Stack

## **Frontend**
| Technology | Version |
|-----------|---------|
| React | 18.3.1 |
| Create React App | 5.x |
| MUI (Material UI) | 5.16.7 |
| Axios | 1.7.2 |
| Node.js | 18.20.4 |
| npm | 10.7.0 |

Frontend folder: `/vocabia-game`

---

## **Backend (Spring Boot)**
| Technology | Version |
|-----------|---------|
| Spring Boot | 3.3.4 |
| Java (OpenJDK) | 17 |
| Maven | 3.9.8 |
| JPA / Hibernate | 6.5.3.Final |
| MySQL JDBC Driver | 8.0.33 |

Backend JAR name: `vocab-0.0.1-SNAPSHOT.jar`

---

## **Database**
| Technology | Version |
|-----------|---------|
| MySQL (AWS RDS) | Managed |
| MySQL Workbench | GUI client |

---

## **Infrastructure**
| Component | Details |
|----------|---------|
| AWS EC2 | Amazon Linux 2023 |
| Nginx | Reverse proxy serving React build |
| Java Runtime | OpenJDK 17 |

---

# 🔐 Sample / Demo Accounts

| Role | Email | Password |
|------|--------|-----------|
| Admin | admin@vocabia.com | admin123 |
| Teacher | testteacher@gmail.com | 123 |
| Student | tim@gmail.com | 123 |

---

# 🧩 Local Development Setup

## 1️⃣ Clone the repository
```bash
git clone https://github.com/your-repo/vocabventure.git



🎯 Backend Setup (Spring Boot)
1. Navigate to backend folder
cd Vocabventure

2. Build the project
mvn clean install

3. Run the backend
mvn spring-boot:run


Backend runs at:

http://localhost:8080

🎨 Frontend Setup (React)
1. Navigate to the frontend folder
cd vocabia-game

2. Install dependencies
npm install

3. Start dev server
npm start


Frontend runs at:

http://localhost:3000

☁️ Deployment Guide (AWS EC2)
1. Build the React frontend
cd vocabia-game
npm run build

2. Deploy the Spring Boot backend

Upload your JAR to the server and run:

java -jar vocab-0.0.1-SNAPSHOT.jar


Run in background:

nohup java -jar vocab-0.0.1-SNAPSHOT.jar &

3. Configure Nginx for React + API proxy

Example configuration:

server {
    listen 80;
    server_name your-domain.com;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080/;
    }
}


Reload:

sudo nginx -s reload

🛢️ Database Setup (MySQL RDS)
Create database
CREATE DATABASE vocabventure;

Configure Spring Boot

application.properties:

spring.datasource.url=jdbc:mysql://your-rds-endpoint/vocabventure
spring.datasource.username=youruser
spring.datasource.password=yourpass
spring.jpa.hibernate.ddl-auto=update

📄 License

This project is for educational and portfolio purposes
