# 🎓 NITT-ECAMPUS

**NITT-ECAMPUS** is a comprehensive web-based campus management platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This platform streamlines administrative and academic operations for students, faculty, and administrators at NIT Trichy through an intuitive, role-based interface.

---

## 🚀 Key Features

- 🔐 **User Authentication**: Secure JWT-based login and registration for users.
- 🛠️ **Admin Panel**: Admins can manage users, view data, and perform various system operations.
- 🎓 **Student Dashboard**: Students can manage their profile, view courses, and access important campus-related information.
- 🏠 **Public Homepage**: An informative landing page for the platform.
- 📑 **Document Verification**: Multi-step verification workflow for student documents.
- 🧑‍🏫 **Faculty Dashboard**: Manage students, update grades, and post announcements.

---

## 🧰 Tech Stack

| Layer     | Tools / Frameworks               |
|-----------|----------------------------------|
| **Frontend** | React.js, Redux, Tailwind CSS    |
| **Backend**  | Node.js, Express.js              |
| **Database** | MongoDB, Mongoose ORM            |
| **Authentication** | JWT (JSON Web Tokens)            |
| **File Storage** | Local/AWS S3 (configurable) |

---

## 📦 Installation Guide

### ✅ Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### 📥 Clone the Repository

First, clone the repository to your local machine:


    git clone https://github.com/009ajeet/NITT-ECAMPUS.git
    cd NITT-ECAMPUS

📂 Install Dependencies
Install backend and frontend dependencies:

# Backend dependencies
    cd backend
    npm install

# Frontend dependencies
    cd ../frontend
    npm install

🔧 Configure Environment Variables
In the backend folder, create a .env file and configure your environment variables:

    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    PORT=5000
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    Replace your_mongodb_connection_string with your MongoDB URI and your_jwt_secret_key with a secure secret key for JWT authentication.

🧪 Run the Project
Once the dependencies are installed and environment variables are set, run the project:

# Start backend server
    cd backend
    npm start

# In a separate terminal, start frontend
    cd frontend
    npm start

The app will be live at http://localhost:5173.

# 📡 API Endpoints
# 🔐 Authentication
        POST /api/auth/register: Register a new user.
        POST /api/auth/login: Login and receive a JWT token.
        POST /api/auth/forgot-password: Request password reset.
        POST /api/auth/reset-password: Reset password with token.

# 👤 User Routes
    GET /api/users/me: Fetch user details (protected route, JWT required).
    PUT /api/users/me: Update current user profile (protected).
    🧑‍💼 Admin Routes
    GET /api/admin/dashboard: Fetch admin-specific data (protected route, JWT required).
    GET /api/admin/users: List all users (admin only).
    DELETE /api/admin/users/:id: Delete user (admin only).
# 📚 Course Management
    GET /api/courses: List available courses.
    POST /api/courses: Create new course (admin/content admin only).
    PUT /api/courses/:id: Update course (admin/content admin only).
# 📝 Form Management
    POST /api/forms/save-form-structure: Save form structure.
    GET /api/forms/get-form-structure/:courseId: Get form structure.
# 📄 Applications
    POST /api/applications/submit: Submit application.
    GET /api/applications/:id: Get application details.
    PUT /api/applications/:id/verify: Verify application documents.
# 🤝 Contributing
    We welcome contributions to the NITT-ECAMPUS project! Here's how you can contribute:
    Fork the repository.
    Create a new branch (git checkout -b feature-xyz).
    Make your changes.
    Commit your changes (git commit -m 'Add new feature').
    Push to your forked repository (git push origin feature-xyz).
    Open a Pull Request.
# 📄 License
    This project is licensed under the MIT License.

# 📬 Contact
    For any questions or feedback:

    📧 Email: as7641012@gmail.com
    🔗 GitHub: @009ajeet
Built with ❤️ for the NIT community.


