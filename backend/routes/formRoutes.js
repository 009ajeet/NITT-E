const express = require("express");
const router = express.Router();
const Form = require("../models/Form");
const Course = require("../models/Course");
const { auth, authorize } = require("../middleware/auth");

/**
 * Save or update form structure (Content Admin only)
 */
router.post("/save-form-structure", auth, authorize(["content_admin"]), async (req, res) => {
  try {
    const { courseId } = req.body; // courseId is at the root of the payload
    const formStructureData = req.body.formStructure; // The rest of the form data is in this nested object

    console.log("Received save-form-structure request body:", JSON.stringify(req.body, null, 2));

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }
    if (!formStructureData) {
      return res.status(400).json({ message: "formStructure object is required in the payload" });
    }

    // Destructure fields from formStructureData
    const {
      educationFields,
      sections,
      requiredAcademicFields,
      requiredAcademicSubfields,
      requiredDocuments,
      programType // This will now be correctly extracted
    } = formStructureData;

    // Validate programType specifically, as it's critical
    if (!programType || !["UG", "PG"].includes(programType)) {
      return res.status(400).json({ message: "Valid programType ('UG' or 'PG') is required within formStructure." });
    }

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if form structure exists
    let form = await Form.findOne({ courseId });
    if (form) {
      // Update existing form
      form.programType = programType; // Always update from formStructureData
      form.educationFields = educationFields !== undefined ? educationFields : form.educationFields;
      form.sections = sections !== undefined ? sections : form.sections;
      form.requiredAcademicFields = requiredAcademicFields !== undefined ? requiredAcademicFields : form.requiredAcademicFields;
      form.requiredAcademicSubfields = requiredAcademicSubfields !== undefined ? requiredAcademicSubfields : form.requiredAcademicSubfields;
      form.requiredDocuments = requiredDocuments !== undefined ? requiredDocuments : form.requiredDocuments;

      console.log("Attempting to update form with data:", JSON.stringify(form.toObject(), null, 2));
      await form.save();
      console.log("Updated form with subfields:", form.requiredAcademicSubfields);
      return res.status(200).json({ message: "Form structure updated successfully", form });
    }

    // Create new form structure
    form = new Form({
      courseId,
      programType, // From formStructureData
      educationFields: educationFields || { tenth: false, twelth: false, ug: false, pg: false },
      sections: sections || [],
      requiredAcademicFields: requiredAcademicFields || [],
      requiredAcademicSubfields: requiredAcademicSubfields || {
        tenth: {
          percentage: false,
          yearOfPassing: false,
          board: false,
          schoolName: false,
          customFields: [],
        },
        twelth: {
          percentage: false,
          yearOfPassing: false,
          board: false,
          schoolName: false,
          customFields: [],
        },
        graduation: {
          percentage: false,
          yearOfPassing: false,
          university: false,
          collegeName: false,
          customFields: [],
        },
        postgraduate: {
          percentage: false,
          yearOfPassing: false,
          university: false,
          collegeName: false,
          customFields: [],
        },
      },
      requiredDocuments: requiredDocuments || [],
    });
    console.log("Attempting to create new form with data:", JSON.stringify(form.toObject(), null, 2));
    await form.save();
    console.log("Created new form with subfields:", form.requiredAcademicSubfields);
    res.status(201).json({ message: "Form structure saved successfully", form });
  } catch (error) {
    console.error("Error saving form structure. Details:", error); // Log the full error
    // Send a more detailed error message if it's a validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Form validation failed. Please check the provided data.",
        error: error.message, // Mongoose's detailed validation error message
        errors: error.errors // Detailed breakdown of field errors
      });
    }
    res.status(500).json({ message: "Server error while saving form structure", error: error.message });
  }
});

/**
 * Get form structure for a course
 */
router.get("/get-form-structure/:courseId", auth, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    console.log(`Fetching form structure for courseId: ${courseId}`);
    const form = await Form.findOne({ courseId });
    if (!form) {
      console.log(`No form found for courseId: ${courseId}`);
      return res.status(404).json({ message: "Form structure not found" });
    }

    // Return the full form structure for both content admins and students
    res.status(200).json({
      programType: form.programType,
      educationFields: form.educationFields || { tenth: false, twelfth: false, ug: false, pg: false },
      sections: form.sections || [],
      requiredAcademicFields: form.requiredAcademicFields || [],
      requiredAcademicSubfields: form.requiredAcademicSubfields || {
        tenth: {
          percentage: false,
          yearOfPassing: false,
          board: false,
          schoolName: false,
          customFields: [],
        },
        twelth: {
          percentage: false,
          yearOfPassing: false,
          board: false,
          schoolName: false,
          customFields: [],
        },
        graduation: {
          percentage: false,
          yearOfPassing: false,
          university: false,
          collegeName: false,
          customFields: [],
        },
        postgraduate: {
          percentage: false,
          yearOfPassing: false,
          university: false,
          collegeName: false,
          customFields: [],
        },
      },
      requiredDocuments: form.requiredDocuments || [],
    });
  } catch (error) {
    console.error("Error fetching form structure:", error);
    res.status(500).json({ message: "Server error while fetching form structure" });
  }
});

module.exports = router;