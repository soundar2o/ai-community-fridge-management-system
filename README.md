# Digital Community Fridge Management System

A professional full-stack web application designed to eliminate food waste by connecting food donors, community fridges, volunteers, and receivers.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Custom Glassmorphic CSS Theme System
- **Backend**: Java 17, Spring Boot 3, Spring Data JPA, Spring Security, JWT Auth, Hibernate
- **Database**: MySQL (Primary DDL in `schema.sql`) / H2 (Development Fallback Profile)
- **Architecture**: Model-View-Controller (MVC) & REST API Architecture

---

## 📁 Project Directory Structure

```
community-fridge-system/
├── backend/                              # Java Spring Boot Backend
│   ├── src/main/java/com/communityfridge/
│   │   ├── config/                       # Security, JWT & CORS Config
│   │   ├── controller/                   # REST Controllers (Auth, Fridge, Food, Reservation, Admin)
│   │   ├── dto/                          # Data Transfer Objects
│   │   ├── model/                        # JPA Entities (User, CommunityFridge, FoodDonation, Reservation, etc.)
│   │   ├── repository/                   # Spring Data JPA Repositories
│   │   ├── security/                     # UserDetailsService & JWT Filters
│   │   ├── service/                      # Business Logic Interfaces & Implementations
│   │   └── util/                         # File Storage & Expiry Cron Scheduler (@Scheduled)
│   └── src/main/resources/
│       ├── application.properties        # DB & JWT settings
│       └── schema.sql                    # MySQL Table Schema DDL
│
└── frontend/                             # React Frontend (Vite)
    ├── src/
    │   ├── components/                   # Navbar, FridgeCard, ProtectedRoute
    │   ├── context/                      # AuthContext (JWT & Role State)
    │   ├── pages/                        # Role-Based Views (Admin, Donor, Receiver, Volunteer)
    │   ├── services/                     # Axios API Client Interceptor
    │   ├── index.css                     # Glassmorphic Dark UI Theme System
    │   └── App.jsx                       # Client Route Authorization
```

---

## 🚀 How to Run the Application

### 1. Database Setup (MySQL)
1. Ensure MySQL Server is running on `localhost:3306`.
2. Create database or execute `backend/src/main/resources/schema.sql`:
   ```sql
   CREATE DATABASE community_fridge_db;
   ```
3. Update `backend/src/main/resources/application.properties` credentials if necessary:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

### 2. Launch Spring Boot Backend
From `backend/` directory:
```bash
mvn spring-boot:run
```
Backend REST API will run on `http://localhost:8080`.

### 3. Launch React Frontend
From `frontend/` directory:
```bash
npm install
npm run dev
```
Frontend Web Application will open on `http://localhost:3000`.

---

## 👥 User Roles & Features Summary

| Role | Capabilities |
| :--- | :--- |
| **ADMIN** | System analytics dashboard, user role management, community fridge CRUD. |
| **DONOR** | Donate food with photo upload, quantity, expiry date & time, donation tracking. |
| **RECEIVER** | Search/filter food catalog by category & fridge, reserve food, get 6-digit pickup code. |
| **VOLUNTEER** | Quality inspection queue, verify pickup code `RES-XXXXXX`, discard expired food. |
