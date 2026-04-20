# 🍔 Food Delivery App

A full-stack **Food Delivery System** built with **Spring Boot (REST API)**, **Frontend (React)**, and **PostgreSQL**, with automated CI pipeline using GitHub Actions.

This project simulates a real-world food ordering platform where users can browse restaurants, order food, and admins can manage menus and orders.

---

# 🚀 Tech Stack

## Backend
- Java 17
- Spring Boot
- Spring Data JPA
- Hibernate
- PostgreSQL

## Frontend
- React js
- HTML, CSS, JavaScript

## DevOps & Tools
- Maven
- Docker & Docker Compose
- Git & GitHub

---

# 🐳 Docker Commands

## Start All Services
```bash
docker compose up -d
```

## Start with Build (after code changes)
```bash
docker compose up -d --build
```

## Stop All Services
```bash
docker compose down
```

## Stop and Remove Volumes (reset data)
```bash
docker compose down -v
```

## View Logs
```bash
docker compose logs -f
```

---

# 🔐 Access & Credentials

## Frontend Application
- **URL**: http://localhost:5173

## API Gateway
- **URL**: http://localhost:9000

## pgAdmin (Database Management)
- **URL**: http://localhost:5051
- **Email**: admin@fooddelivery.com
- **Password**: admin

## PostgreSQL Database
- **Host**: localhost:5433
- **Database**: fooddelivery
- **Username**: postgres
- **Password**: syrine1254xxy

## Eureka Server (Service Registry)
- **URL**: http://localhost:8761

## Default Admin Account
- **Email**: admin@freshbites.tn
- **Password**: admin123
- **Role**: ADMIN

*The default admin is automatically created when the admin-service starts if it doesn't exist.*

### Change Admin Credentials
To modify the default admin credentials, edit:
```
backend/admin-service/src/main/java/com/fooddelivery/admin_service/config/DataInitializer.java
```

Change these lines (23-25):
```java
String adminEmail = "admin@freshbites.tn";
String adminPassword = "admin123";
```







