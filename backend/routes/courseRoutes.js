const express = require("express");
const CourseModel = require("../models/Course");
const FormModel = require("../models/Form");
const UserModel = require("../models/User"); // Import User model
const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Helper function to create a user
const createUser = async (email, password, role, courseId) => {
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    if (existingUser.role === role && existingUser.courses.includes(courseId)) {
      return existingUser; // User already exists and is assigned
    }
    if (!existingUser.courses.includes(courseId)) {
      existingUser.courses.push(courseId);
    }
    await existingUser.save();
    return existingUser;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new UserModel({
    name: email.split('@')[0],
    email,
    password: hashedPassword,
    role,
    courses: [courseId],
    verified: true,
  });
  await newUser.save();
  return newUser;
};

// Fetch all courses (filtered for content admins by assignedTo email, requires authentication)
router.get("/", auth, async (req, res) => {
  try {
    let courses;
    if (req.user.role === "content_admin") {
      courses = await CourseModel.find({ contentAdmin: req.user._id });
    } else if (req.user.role === "verification_admin") {
      courses = await CourseModel.find({ verificationAdmin: req.user._id });
    } else if (req.user.role === "admin" || req.user.role === "student") {
      courses = await CourseModel.find();
    } else {
      return res.status(403).json({ message: "Access denied. Invalid role." });
    }
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Error fetching courses", error: error.message });
  }
});

// Fetch a course by ID (no auth required)
router.get("/:courseId", async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Error fetching course", error: error.message });
  }
});

// Admin adds a course
router.post("/newCourse", auth, authorize(["admin"]), async (req, res) => {
  const {
    title, description, duration, fee, requirement, contact, subjectCode,
    contentAdminEmail, contentAdminPassword,
    verificationAdminEmail, verificationAdminPassword
  } = req.body;

  console.log("Received course data:", req.body);

  const missingFields = [];
  if (!title?.trim()) missingFields.push("title");
  if (!description?.trim()) missingFields.push("description");
  if (!duration || isNaN(duration) || Number(duration) <= 0) missingFields.push("duration");
  if (!fee || isNaN(fee) || Number(fee) <= 0) missingFields.push("fee");
  if (!requirement?.trim()) missingFields.push("requirement");
  if (!contact?.trim()) missingFields.push("contact");
  if (!subjectCode?.trim()) missingFields.push("subjectCode");
  if (!contentAdminEmail?.trim()) missingFields.push("contentAdminEmail");
  if (!contentAdminPassword?.trim()) missingFields.push("contentAdminPassword");
  if (!verificationAdminEmail?.trim()) missingFields.push("verificationAdminEmail");
  if (!verificationAdminPassword?.trim()) missingFields.push("verificationAdminPassword");

  if (missingFields.length > 0) {
    console.log("Missing or invalid fields:", missingFields);
    return res.status(400).json({
      message: "All fields are required",
      missingFields,
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contentAdminEmail)) missingFields.push("invalid contentAdminEmail format");
  if (!emailRegex.test(verificationAdminEmail)) missingFields.push("invalid verificationAdminEmail format");

  if (contentAdminPassword.length < 6) missingFields.push("contentAdminPassword too short (min 6 chars)");
  if (verificationAdminPassword.length < 6) missingFields.push("verificationAdminPassword too short (min 6 chars)");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: "Validation errors",
      errors: missingFields,
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tempCourse = new CourseModel({ title: "temp" });
    const savedTempCourse = await tempCourse.save({ session });
    const courseId = savedTempCourse._id;

    const contentAdminUser = await createUser(contentAdminEmail, contentAdminPassword, "content_admin", courseId);
    const verificationAdminUser = await createUser(verificationAdminEmail, verificationAdminPassword, "verification_admin", courseId);

    const updatedCourse = await CourseModel.findByIdAndUpdate(
      courseId,
      {
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration),
        fee: Number(fee),
        requirement: requirement.trim(),
        contact: contact.trim(),
        subjectCode: subjectCode.trim(),
        contentAdmin: contentAdminUser._id,
        verificationAdmin: verificationAdminUser._id,
      },
      { new: true, session }
    );

    console.log("New course saved with admins:", updatedCourse);

    await session.commitTransaction();

    res.status(201).json({
      message: "Course added successfully, and admin accounts created/assigned.",
      course: updatedCourse,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding course and creating admins:", error);
    res.status(500).json({
      message: "Error adding course and creating admins",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

// Edit a course (Admin only)
router.put("/:courseId", auth, authorize(["admin"]), async (req, res) => {
  const { courseId } = req.params;
  const { title, description, duration, fee, requirement, contact, subjectCode } = req.body;

  console.log("PUT /api/courses/:courseId - Request Body:", req.body);

  const missingFields = [];
  if (!title) missingFields.push("title");
  if (!description) missingFields.push("description");
  if (!duration) missingFields.push("duration");
  if (!fee) missingFields.push("fee");
  if (!requirement) missingFields.push("requirement");
  if (!contact) missingFields.push("contact");
  if (!subjectCode) missingFields.push("subjectCode");

  if (missingFields.length > 0) {
    console.log("Missing fields:", missingFields);
    return res.status(400).json({ message: `All fields are required. Missing: ${missingFields.join(", ")}` });
  }

  try {
    const course = await CourseModel.findByIdAndUpdate(
      courseId,
      { title, description, duration, fee, requirement, contact, subjectCode },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Error updating course", error: error.message });
  }
});

// Delete a course (Admin only)
router.delete("/:courseId", auth, authorize(["admin"]), async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await CourseModel.findByIdAndDelete(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Error deleting course", error: error.message });
  }
});

// Content admin adds course description and program type
router.post("/:courseId/add-description", auth, authorize(["content_admin"]), async (req, res) => {
  const { courseId } = req.params;
  const {
    programDescription,
    image1,
    image2,
    vision,
    mission,
    yearsOfDepartment,
    syllabus,
    programEducationalObjectives,
    programOutcomes,
    programType,
  } = req.body;

  if (
    !programDescription ||
    !image1 ||
    !image2 ||
    !vision ||
    !mission ||
    !yearsOfDepartment ||
    !syllabus ||
    !programEducationalObjectives ||
    !programOutcomes ||
    !programType
  ) {
    return res.status(400).json({ message: "All fields, including program type, are required" });
  }

  try {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.contentAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. You are not assigned to this course." });
    }

    course.programDescription = programDescription;
    course.image1 = image1;
    course.image2 = image2;
    course.vision = vision;
    course.mission = mission;
    course.yearsOfDepartment = yearsOfDepartment;
    course.syllabus = syllabus;
    course.programEducationalObjectives = programEducationalObjectives;
    course.programOutcomes = programOutcomes;
    course.programType = programType;

    await course.save();

    let form = await FormModel.findOne({ courseId });
    if (form) {
      form.programType = programType;
      await form.save();
    } else {
      form = new FormModel({
        courseId,
        programType,
      });
      await form.save();
    }

    res.status(200).json({ message: "Course description and program type added successfully!", course, form });
  } catch (error) {
    console.error("Error adding course description and program type:", error);
    res.status(500).json({ message: "Error adding course description and program type", error: error.message });
  }
});

// Verify course code (Content Admin only)
router.post("/verify-code", auth, authorize(["content_admin"]), async (req, res) => {
  const { subjectCode } = req.body;

  if (!subjectCode) {
    return res.status(400).json({ message: "Course code is required" });
  }

  try {
    const course = await CourseModel.findOne({
      subjectCode: { $regex: `^${subjectCode}$`, $options: "i" }
    });
    if (!course) {
      return res.status(404).json({ message: "Invalid course code" });
    }
    if (course.contentAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. You are not the content admin for this course." });
    }

    res.status(200).json({ courseId: course._id });
  } catch (error) {
    console.error("Error verifying course code:", error);
    res.status(500).json({ message: "Error verifying course code", error: error.message });
  }
});

module.exports = router;