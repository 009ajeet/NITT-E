const mongoose = require("mongoose");

const ApplicationFormSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Form data is required"],
      validate: {
        validator: function (v) {
          if (!v.documents || !Array.isArray(v.documents)) return false;
          return v.documents.every((doc) =>
            doc.type &&
            doc.filename &&
            doc.path &&
            doc.originalName &&
            doc.mimetype &&
            doc.size
          );
        },
        message: "Documents must include type, filename, path, originalName, mimetype, and size",
      },
    },
    educationDetails: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Education details are required"],
    },
    programType: {
      type: String,
      enum: ["UG", "PG"],
      required: [true, "Program type is required"],
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "verified"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ApplicationFormSchema.index({ courseId: 1 });
ApplicationFormSchema.index({ studentId: 1 });

const ApplicationForm = mongoose.model("ApplicationForm", ApplicationFormSchema);
module.exports = ApplicationForm;