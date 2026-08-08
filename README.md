# 📚 LibrarySys - Modern Library Management System

A full-stack, enterprise-grade library management dashboard built with React, Vite, Node.js, Express, and SQLite. It features a sleek "Liquid Glass" inspired dark-sidebar UI, robust role-based authentication, and real-time fine calculation.

## ✨ Features

- **Role-Based Access Control:** Separate flows for `admin` and `student` users.
- **Book Catalog:** Real-time catalog with debounced searching by Title, Author, or Genre.
- **Borrowing & Returning:** Students can borrow available books (14-day checkout).
- **Automated Fine Calculation:** Overdue books automatically incur a $2/day fine applied to the user's account upon return.
- **Member Directory:** Admins can view all registered members, their roles, and outstanding fines.
- **Zero-Config Database:** Uses a local SQLite database (`library.sqlite`) via Sequelize—no external database servers required!
- **Fluid UI:** Powered by Framer Motion for smooth page transitions and responsive interactions.

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, React Router v6, Axios, Framer Motion, Lucide React.
- **Backend:** Node.js, Express.js.
- **Database:** SQLite3 with Sequelize ORM.
- **Authentication:** JWT (JSON Web Tokens) and bcryptjs.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sriram1576/LibrarySys.git
   cd LibrarySys
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   *Note: On the first run, the SQLite database (`library.sqlite`) is automatically created and a default admin user is seeded.*

3. **Setup the Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application:**
   Open your browser and navigate to `http://localhost:5173/`.

### Default Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`

---
*Developed with a focus on seamless enterprise UX and zero-config deployment.*
