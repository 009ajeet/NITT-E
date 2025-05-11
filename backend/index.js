const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require('path');
const listEndpoints = require("express-list-endpoints"); // Optional
require("dotenv").config();

// Import the centralized configuration
const config = require('./config');

// Import models
const UserModel = require("./models/User");
const ApplicationForm = require("./models/ApplicationForm");
const FormModel = require("./models/Form");

// Import routes
const courseRoutes = require("./routes/courseRoutes");
const formRoutes = require("./routes/formRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const facultyRoutes = require("./routes/faculty");
const studentRoutes = require("./routes/student");
const verificationOfficerRoutes = require("./routes/VerificationOfficerRoutes");
const verificationAdminRoutes = require("./routes/VerificationAdminRoutes");

// Import middlewares
const { auth, authorize } = require("./middleware/auth");

// Initialize express app
const app = express();

// Configure middleware
app.use(express.json({ limit: "50mb" }));

// Configure CORS for both development and production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://nitt-e-fronted.onrender.com",
      "https://nitt-e.onrender.com",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001"
    ];

    console.log('Request origin:', origin);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  console.log('Handling preflight request for:', req.path);
  console.log('Preflight headers:', JSON.stringify(req.headers, null, 2));

  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://nitt-e-fronted.onrender.com",
    "https://nitt-e.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');

  // Send 204 for preflight requests
  res.status(204).end();
});

// Error handling middleware for CORS
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    console.error('CORS Error:', {
      origin: req.headers.origin,
      path: req.path,
      method: req.method,
      headers: req.headers
    });
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Not allowed by CORS',
      origin: req.headers.origin
    });
  }
  next(err);
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  res.on("finish", () => {
    console.log(`Response Status: ${res.statusCode} for ${req.url}`);
  });
  next();
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Use JWT secret from config
const JWT_SECRET = config.jwtSecret;

// Mount routes
app.use("/api/courses", courseRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/verification-admin", verificationAdminRoutes);
app.use("/api/verification-officer", verificationOfficerRoutes);

// Serve static files from the uploads directory
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Add CORS headers again for static files
// Add CORS headers for static files
app.use('/api/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://nitt-e-fronted.onrender.com",
    "https://nitt-e.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000"
  ];

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', 'https://nitt-e-fronted.onrender.com');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  next();
});

// Log registered routes (optional)
console.log("Registered Routes:");
console.log(listEndpoints(app));

// Authorization middlewares
const authorizeAdmin = (req, res, next) => {
  console.log("User role:", req.user.role);
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

const authorizeContentAdmin = (req, res, next) => {
  if (req.user.role !== "content_admin") {
    return res.status(403).json({ message: "Access denied. Content Admins only." });
  }
  next();
};

// Authentication routes
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const userRole = "student"; //keep it student by default

  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json("Already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const mailOptions = {
      from: config.email.user,
      to: email,
      subject: "Welcome to NITT E-Campus!",
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for registering on NITT E-Campus! 🎉</p>
        <p>You can now log in using your registered email.</p>
        <p><strong>Happy Learning! 🚀</strong></p>
        <br>
        <p>Best Regards,</p>
        <p><strong>NITT E-Campus Team</strong></p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({
      userId: newUser._id,
      token,
      role: newUser.role,
      message: `Registered successfully as ${newUser.role}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/users/create", auth, authorizeAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  const allowedRoles = ["admin", "content_admin", "verification_officer", "verification_admin"];

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const mailOptions = {
      from: config.email.user,
      to: email,
      subject: "Welcome to NITT E-Campus!",
      html: `
        <h2>Hi ${name},</h2>
        <p>You have been registered as a ${role} on NITT E-Campus! 🎉</p>
        <p>Please log in using your email and the provided password.</p>
        <p><strong>Best Regards,</strong></p>
        <p><strong>NITT E-Campus Team</strong></p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({ message: `User created successfully as ${role}` });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
});

app.post("/api/login", async (req, res) => { // Changed from app.post("/login", ...)
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No user found with this email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Generated JWT Token:", token);
    return res.status(200).json({ token, userId: user._id, role: user.role, jwt_token: token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login error", error });
  }
});

app.get("/api/users", auth, authorizeAdmin, async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
});

app.get("/api/users/:id", auth, async (req, res) => {
  const { id } = req.params;

  console.log(`Fetching user ${id} - Requested by ${req.user.userId} (Role: ${req.user.role})`);

  try {
    if (req.user.role === "admin" || req.user.userId === id) {
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    }

    return res.status(403).json({ message: "Access denied." });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user", error });
  }
});

app.delete("/api/users/:id", auth, authorizeAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error });
  }
});

app.get("/api/applications", auth, authorizeAdmin, async (req, res) => {
  try {
    const applications = await ApplicationForm.find();
    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Error fetching applications", error });
  }
});

app.get("/api/application/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const application = await ApplicationForm.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Error fetching application", error });
  }
});

app.delete("/api/application/:id", auth, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const application = await ApplicationForm.findByIdAndDelete(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ message: "Error deleting application", error });
  }
});

app.post("/api/forms/create", auth, async (req, res) => {
  if (req.user.role !== "content_admin") {
    return res.status(403).json({ message: "Access denied. Content admins only." });
  }

  try {
    const { courseId, fields } = req.body;

    if (!courseId || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: "Invalid form data." });
    }

    const newForm = new FormModel({
      courseId,
      createdBy: req.user.userId,
      fields,
    });

    await newForm.save();
    res.status(201).json({ message: "Form created successfully!", form: newForm });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ message: "Error creating form", error: error.message });
  }
});

app.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    const userId = req.user.userId;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Something went wrong. Try again later." });
  }
});

// Add health check endpoint for Render
// Root endpoint for browser testing
app.get("/", (req, res) => {
  res.status(200).json({
    message: "NITT-ECAMPUS API Server",
    status: "online",
    cors: "enabled",
    time: new Date().toISOString()
  });
});

// Use port from config with fallback to 3001
const PORT = process.env.PORT || config.port || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
