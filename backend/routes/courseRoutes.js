const express = require("express");
const mongoose = require("mongoose"); // Added mongoose import
const CourseModel = require("../models/Course");
const FormModel = require("../models/Form");
const UserModel = require("../models/User"); // Import User model
const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Helper function to create a user
const createUser = async (email, password, role, courseId, session) => { // Added session parameter
  const existingUser = await UserModel.findOne({ email }).session(session); // Use session
  if (existingUser) {
    if (!existingUser.courses.includes(courseId)) {
      existingUser.courses.push(courseId);
    }
    await existingUser.save({ session }); // Use session
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
  await newUser.save({ session }); // Use session
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
    verificationAdminEmail, verificationAdminPassword,
    details, programDescription, image1, image2, vision, mission,
    yearsOfDepartment, syllabus, programEducationalObjectives, programOutcomes, programType
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
  const validationErrors = [];
  if (!emailRegex.test(contentAdminEmail)) validationErrors.push("invalid contentAdminEmail format");
  if (!emailRegex.test(verificationAdminEmail)) validationErrors.push("invalid verificationAdminEmail format");

  if (contentAdminPassword.length < 6) validationErrors.push("contentAdminPassword too short (min 6 chars)");
  if (verificationAdminPassword.length < 6) validationErrors.push("verificationAdminPassword too short (min 6 chars)");

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: "Validation errors",
      errors: validationErrors,
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const courseData = {
      title: title.trim(),
      description: description.trim(),
      duration: Number(duration),
      fee: Number(fee),
      requirement: requirement.trim(),
      contact: contact.trim(),
      subjectCode: subjectCode.trim(),
      details: details?.trim(),
      programDescription: programDescription?.trim(),
      image1: image1?.trim(),
      image2: image2?.trim(),
      vision: vision?.trim(),
      mission: mission?.trim(),
      yearsOfDepartment: yearsOfDepartment ? Number(yearsOfDepartment) : undefined,
      syllabus: syllabus,
      programEducationalObjectives: programEducationalObjectives,
      programOutcomes: programOutcomes,
      programType: programType?.trim()
    };

    Object.keys(courseData).forEach(key => courseData[key] === undefined && delete courseData[key]);

    const initialCourse = new CourseModel(courseData);
    const savedCourse = await initialCourse.save({ session });
    const courseId = savedCourse._id;

    const contentAdminUser = await createUser(contentAdminEmail, contentAdminPassword, "content_admin", courseId, session);
    const verificationAdminUser = await createUser(verificationAdminEmail, verificationAdminPassword, "verification_admin", courseId, session);

    savedCourse.contentAdmin = contentAdminUser._id;
    savedCourse.verificationAdmin = verificationAdminUser._id;

    const finalCourse = await savedCourse.save({ session });

    console.log("New course saved with admins:", finalCourse);

    await session.commitTransaction();

    res.status(201).json({
      message: "Course added successfully, and admin accounts created/assigned.",
      course: finalCourse,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding course and creating admins:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error while saving course.",
        error: error.message,
        details: error.errors
      });
    }
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