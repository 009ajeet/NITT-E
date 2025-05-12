const express = require("express");
const mongoose = require("mongoose"); // Added mongoose import
const CourseModel = require("../models/Course");
const FormModel = require("../models/Form");
const UserModel = require("../models/User"); // Import User model
const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Helper function to create or update a user and assign them a role for a specific course
const createUser = async (email, password, roleToAssign, courseId, session) => {
  console.log(`[createUser] Called with Email: ${email}, RoleToAssign: ${roleToAssign}, CourseID: ${courseId}`);
  let user = await UserModel.findOne({ email }).session(session);

  if (user) {
    console.log(`[createUser] Existing user found: ${email}. Current Role: ${user.role}. Current Courses: ${user.courses.join(', ')}`);
    // Update the user's role to the one being assigned for this course context.
    // This is critical for ensuring their permissions are scoped correctly later.
    user.role = roleToAssign;
    user.verified = true; // Ensure users assigned these roles are marked as verified.

    // Add course to user's list if not already present
    if (!user.courses.map(String).includes(String(courseId))) {
      user.courses.push(courseId);
      console.log(`[createUser] Added CourseID ${courseId} to user ${email}.`);
    } else {
      console.log(`[createUser] CourseID ${courseId} already in user ${email}'s list.`);
    }

    console.log(`[createUser] Attempting to save existing user ${email} with New Role: ${user.role}, Courses: ${user.courses.join(', ')}`);
    try {
      await user.save({ session });
      console.log(`[createUser] Successfully saved existing user ${email}.`);
    } catch (saveError) {
      console.error(`[createUser] Error saving existing user ${email}:`, saveError);
      throw saveError; // Propagate error to abort transaction
    }
  } else {
    console.log(`[createUser] No existing user found for ${email}. Creating new user.`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new UserModel({
      name: email.split('@')[0], // Basic name generation
      email,
      password: hashedPassword,
      role: roleToAssign,
      courses: [courseId],
      verified: true, // New admins are verified by default
    });
    console.log(`[createUser] Attempting to save new user ${email} with Role: ${user.role}, Courses: ${user.courses.join(', ')}`);
    try {
      await user.save({ session });
      console.log(`[createUser] Successfully saved new user ${email}.`);
    } catch (saveError) {
      console.error(`[createUser] Error saving new user ${email}:`, saveError);
      throw saveError; // Propagate error to abort transaction
    }
  }
  return user;
};

// Admin adds a new course and assigns Content Admin and Verification Admin
router.post("/newCourse", auth, authorize(["admin"]), async (req, res) => {
  console.log("[POST /newCourse] Received request. Body:", req.body);
  const {
    title, description, duration, fee, requirement, contact, subjectCode,
    contentAdminEmail, contentAdminPassword,
    verificationAdminEmail, verificationAdminPassword,
    // Optional fields from CourseModel
    details, programDescription, image1, image2, vision, mission,
    yearsOfDepartment, syllabus, programEducationalObjectives, programOutcomes, programType
  } = req.body;

  // Basic Validation (ensure this is comprehensive as per your needs)
  const requiredFields = { title, description, duration, fee, requirement, contact, subjectCode, contentAdminEmail, contentAdminPassword, verificationAdminEmail, verificationAdminPassword };
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      console.log(`[POST /newCourse] Validation Error: Missing or empty required field: ${field}`);
      return res.status(400).json({ message: `Field '${field}' is required.` });
    }
  }
  // Add more specific validation for email format, password length, numeric types, etc. if not already handled robustly on frontend

  const session = await mongoose.startSession();
  session.startTransaction();
  console.log("[POST /newCourse] MongoDB session started and transaction begun.");

  try {
    // 1. Prepare Course Data (excluding admin IDs for now)
    const courseData = {
      title: title.trim(),
      description: description.trim(),
      duration: Number(duration),
      fee: Number(fee),
      requirement: requirement.trim(),
      contact: contact.trim(),
      subjectCode: subjectCode.trim(),
      // Optional fields
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
    // Remove undefined optional fields
    Object.keys(courseData).forEach(key => courseData[key] === undefined && delete courseData[key]);

    // 2. Create and Save Initial Course Document (to get its _id)
    const newCourse = new CourseModel(courseData);
    await newCourse.save({ session });
    const courseId = newCourse._id;
    console.log(`[POST /newCourse] Initial course document saved. CourseID: ${courseId}`);

    // 3. Create/Update Content Admin User
    console.log(`[POST /newCourse] Processing Content Admin: ${contentAdminEmail}`);
    const contentAdminUser = await createUser(contentAdminEmail, contentAdminPassword, "content_admin", courseId, session);
    console.log(`[POST /newCourse] Content Admin user processed. UserID: ${contentAdminUser._id}, Role: ${contentAdminUser.role}`);

    // 4. Create/Update Verification Admin User
    console.log(`[POST /newCourse] Processing Verification Admin: ${verificationAdminEmail}`);
    const verificationAdminUser = await createUser(verificationAdminEmail, verificationAdminPassword, "verification_admin", courseId, session);
    console.log(`[POST /newCourse] Verification Admin user processed. UserID: ${verificationAdminUser._id}, Role: ${verificationAdminUser.role}`);

    // 5. Update Course Document with Admin ObjectIds
    newCourse.contentAdmin = contentAdminUser._id;
    newCourse.verificationAdmin = verificationAdminUser._id;
    console.log(`[POST /newCourse] Attempting to save course with admin IDs. ContentAdminID: ${newCourse.contentAdmin}, VerificationAdminID: ${newCourse.verificationAdmin}`);
    const finalCourse = await newCourse.save({ session });
    console.log(`[POST /newCourse] Course successfully updated with admin IDs.`);

    // 6. Commit Transaction
    await session.commitTransaction();
    console.log("[POST /newCourse] Transaction committed successfully.");

    res.status(201).json({
      message: "Course created and admins assigned successfully.",
      course: finalCourse,
    });

  } catch (error) {
    console.error("[POST /newCourse] Error during course creation:", error);
    await session.abortTransaction();
    console.log("[POST /newCourse] Transaction aborted due to error.");
    // Provide more specific error messages based on error type if possible
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation error during save.", error: error.message, details: error.errors });
    }
    res.status(500).json({ message: "Failed to create course.", error: error.message });
  } finally {
    await session.endSession();
    console.log("[POST /newCourse] MongoDB session ended.");
  }
});

// Fetch all courses (filtered for content admins by assignedTo email, requires authentication)
router.get("/", auth, async (req, res) => {
  console.log("[GET /api/courses] User making request:", JSON.stringify(req.user));
  try {
    let courses;
    console.log(`[GET /api/courses] User role from req.user: ${req.user.role}`);

    // Add Cache-Control Headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.user.role === "content_admin") {
      console.log(`[GET /api/courses] User is content_admin. Fetching courses for contentAdmin ID: ${req.user.userId}`); // Changed to req.user.userId
      courses = await CourseModel.find({ contentAdmin: req.user.userId }); // Changed to req.user.userId
    } else if (req.user.role === "verification_admin") {
      console.log(`[GET /api/courses] User is verification_admin. Fetching courses for verificationAdmin ID: ${req.user.userId}`); // Changed to req.user.userId
      courses = await CourseModel.find({ verificationAdmin: req.user.userId }); // Changed to req.user.userId
    } else if (req.user.role === "admin" || req.user.role === "student") {
      console.log(`[GET /api/courses] User is ${req.user.role}. Fetching all courses.`);
      courses = await CourseModel.find();
    } else {
      console.log(`[GET /api/courses] User role ${req.user.role} has no specific course view. Access denied.`);
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
  console.log(`[/:courseId/add-description] User making request: ${JSON.stringify(req.user)}, Course ID: ${req.params.courseId}`);
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
      console.log(`[/:courseId/add-description] Access Denied. Course ContentAdmin: ${course.contentAdmin}, User ID: ${req.user._id}`);
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
  console.log(`[verify-code] User making request: ${JSON.stringify(req.user)}, Subject Code: ${req.body.subjectCode}`);
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
      console.log(`[verify-code] Access Denied. Course ContentAdmin: ${course.contentAdmin}, User ID: ${req.user._id}`);
      return res.status(403).json({ message: "Access denied. You are not the content admin for this course." });
    }

    res.status(200).json({ courseId: course._id });
  } catch (error) {
    console.error("Error verifying course code:", error);
    res.status(500).json({ message: "Error verifying course code", error: error.message });
  }
});

module.exports = router;