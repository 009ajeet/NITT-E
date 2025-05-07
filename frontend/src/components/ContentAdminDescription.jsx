import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./ContentAdminDescription.css";

const ContentAdminDescription = () => {
  const { courseId } = useParams();
  const [user, setUser] = useState(null);
  const [programDescription, setProgramDescription] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [yearsOfDepartment, setYearsOfDepartment] = useState("");
  const [syllabus, setSyllabus] = useState([{ semester: "", subjects: [] }]);
  const [programEducationalObjectives, setProgramEducationalObjectives] = useState("");
  const [programOutcomes, setProgramOutcomes] = useState("");
  const [programType, setProgramType] = useState("");
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // State for temporary alert
  const [requiredAcademicFields, setRequiredAcademicFields] = useState([]);
  const [requiredAcademicSubfields, setRequiredAcademicSubfields] = useState({
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
  });
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [newField, setNewField] = useState({ academicField: "", name: "", label: "", type: "text" });

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  // Academic and document options
  const academicOptions = {
    UG: ["tenth", "twelth"],
    PG: ["tenth", "twelth", "graduation", "postgraduate"],
  };

  const documentOptions = {
    UG: [
      "10th Marksheet",
      "12th Marksheet",
      "Aadhaar",
      "PAN",
      "Driving License",
      "Image (Passport Photo)",
      "Signature",
    ],
    PG: [
      "10th Marksheet",
      "12th Marksheet",
      "Graduation Marksheet",
      "Postgraduate Marksheet",
      "Aadhaar",
      "PAN",
      "Driving License",
      "Image (Passport Photo)",
      "Signature",
    ],
  };

  // Subfield labels for display
  const subfieldLabels = {
    percentage: "Percentage",
    yearOfPassing: "Year of Passing",
    board: "Board",
    university: "University",
    schoolName: "School Name",
    collegeName: "College Name",
  };

  // Field type options
  const fieldTypeOptions = ["text", "number", "date", "dropdown"];

  // Fetch logged-in user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        console.log("Decoded user:", decodedUser);
      } catch (err) {
        console.error("Token decoding failed:", err);
        setUser(null);
      }
    }
  }, []);

  // Fetch course and form structure
  useEffect(() => {
    if (user && user.role === "content_admin" && courseId) {
      // Fetch course details to get programType
      axios
        .get(`http://127.0.0.1:3001/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          console.log("Fetched course:", res.data);
          if (res.data.programType) {
            setProgramType(res.data.programType);
          }
        })
        .catch((err) => console.error("Error fetching course:", err));

      // Fetch form structure
      axios
        .get(`http://127.0.0.1:3001/api/get-form-structure/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          console.log("Fetched form structure:", res.data);
          setRequiredAcademicFields(res.data.requiredAcademicFields || []);
          const fetchedSubfields = res.data.requiredAcademicSubfields || {};
          setRequiredAcademicSubfields({
            tenth: {
              percentage: fetchedSubfields.tenth?.percentage || false,
              yearOfPassing: fetchedSubfields.tenth?.yearOfPassing || false,
              board: fetchedSubfields.tenth?.board || false,
              schoolName: fetchedSubfields.tenth?.schoolName || false,
              customFields: fetchedSubfields.tenth?.customFields || [],
            },
            twelth: {
              percentage: fetchedSubfields.twelth?.percentage || false,
              yearOfPassing: fetchedSubfields.twelth?.yearOfPassing || false,
              board: fetchedSubfields.twelth?.board || false,
              schoolName: fetchedSubfields.twelth?.schoolName || false,
              customFields: fetchedSubfields.twelth?.customFields || [],
            },
            graduation: {
              percentage: fetchedSubfields.graduation?.percentage || false,
              yearOfPassing: fetchedSubfields.graduation?.yearOfPassing || false,
              university: fetchedSubfields.graduation?.university || false,
              collegeName: fetchedSubfields.graduation?.collegeName || false,
              customFields: fetchedSubfields.graduation?.customFields || [],
            },
            postgraduate: {
              percentage: fetchedSubfields.postgraduate?.percentage || false,
              yearOfPassing: fetchedSubfields.postgraduate?.yearOfPassing || false,
              university: fetchedSubfields.postgraduate?.university || false,
              collegeName: fetchedSubfields.postgraduate?.collegeName || false,
              customFields: fetchedSubfields.postgraduate?.customFields || [],
            },
          });
          setRequiredDocuments(res.data.requiredDocuments || []);
          if (res.data.programType) {
            setProgramType(res.data.programType);
          }
        })
        .catch((err) => {
          console.error("Error fetching form structure:", err);
          setRequiredAcademicFields([]);
          setRequiredAcademicSubfields({
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
          });
          setRequiredDocuments([]);
        });
    }
  }, [user, courseId]);

  const handleImage1Upload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > maxFileSize) {
        alert("Image 1 is too large. Maximum size is 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage1(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImage2Upload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > maxFileSize) {
        alert("Image 2 is too large. Maximum size is 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage2(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSyllabusSemester = () => {
    setSyllabus([...syllabus, { semester: "", subjects: [] }]);
  };

  const handleSyllabusChange = (index, field, value) => {
    const updatedSyllabus = [...syllabus];
    updatedSyllabus[index][field] = value;
    setSyllabus(updatedSyllabus);
  };

  const addSubject = (index) => {
    const updatedSyllabus = [...syllabus];
    updatedSyllabus[index].subjects.push("");
    setSyllabus(updatedSyllabus);
  };

  const handleSubjectChange = (semesterIndex, subjectIndex, value) => {
    const updatedSyllabus = [...syllabus];
    updatedSyllabus[semesterIndex].subjects[subjectIndex] = value;
    setSyllabus(updatedSyllabus);
  };

  // Validate description fields
  const areDescriptionFieldsFilled = () => {
    // Check basic fields
    if (
      !programDescription.trim() ||
      !image1 ||
      !image2 ||
      !vision.trim() ||
      !mission.trim() ||
      !yearsOfDepartment
    ) {
      return false;
    }

    // Validate yearsOfDepartment is a positive number
    const yearsNum = Number(yearsOfDepartment);
    if (isNaN(yearsNum) || yearsNum <= 0) {
      return false;
    }

    // Validate syllabus: each semester must have a non-empty name and at least one non-empty subject
    if (
      !syllabus.every(
        (sem) =>
          sem.semester.trim() &&
          Array.isArray(sem.subjects) &&
          sem.subjects.length > 0 &&
          sem.subjects.every((sub) => sub.trim())
      )
    ) {
      return false;
    }

    // Validate programEducationalObjectives and programOutcomes
    const peos = programEducationalObjectives.split("\n").filter((peo) => peo.trim());
    const pos = programOutcomes.split("\n").filter((po) => po.trim());
    if (peos.length === 0 || pos.length === 0) {
      return false;
    }

    // Validate programType
    if (!["UG", "PG"].includes(programType)) {
      return false;
    }

    return true;
  };

  const saveDescription = () => {
    if (!areDescriptionFieldsFilled()) {
      alert("Please fill all fields, including at least one subject per semester and select a program type (UG/PG).");
      return;
    }

    if (!programType) {
      alert("Please select a program type (UG/PG).");
      return;
    }

    const courseData = {
      programDescription,
      image1,
      image2,
      vision,
      mission,
      yearsOfDepartment: Number(yearsOfDepartment),
      syllabus,
      programEducationalObjectives: programEducationalObjectives.split("\n").filter((peo) => peo.trim()),
      programOutcomes: programOutcomes.split("\n").filter((po) => po.trim()),
      programType,
    };

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to save the description.");
      return;
    }

    axios
      .post(`http://127.0.0.1:3001/api/courses/${courseId}/add-description`, courseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Description saved:", response.data);
        alert(response.data.message || "Description and program type saved successfully!");
      })
      .catch((error) => {
        console.error("Error adding program description:", error);
        alert(error.response?.data?.message || "Failed to save description. Please try again.");
      });
  };

  // Toggle academic field requirement
  const toggleAcademicField = (field) => {
    console.log("Toggling academic field:", field);
    setRequiredAcademicFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  // Toggle academic subfield requirement
  const toggleAcademicSubfield = (academicField, subfield) => {
    console.log(`Toggling subfield ${subfield} for ${academicField}`);
    setRequiredAcademicSubfields((prev) => ({
      ...prev,
      [academicField]: {
        ...prev[academicField],
        [subfield]: !prev[academicField][subfield],
      },
    }));
  };

  // Toggle custom field requirement
  const toggleCustomField = (academicField, fieldName) => {
    console.log(`Toggling custom field ${fieldName} for ${academicField}`);
    setRequiredAcademicSubfields((prev) => ({
      ...prev,
      [academicField]: {
        ...prev[academicField],
        customFields: prev[academicField].customFields.map((field) =>
          field.name === fieldName ? { ...field, required: !field.required } : field
        ),
      },
    }));
  };

  // Handle new field input change
  const handleNewFieldChange = (e) => {
    const { name, value } = e.target;
    setNewField((prev) => ({ ...prev, [name]: value }));
  };

  // Add custom field to an academic section
  const addCustomField = (academicField) => {
    if (!newField.name || !newField.label) {
      alert("Please provide both name and label for the custom field.");
      return;
    }
    if (
      requiredAcademicSubfields[academicField].customFields.some(
        (field) => field.name === newField.name
      )
    ) {
      alert("A field with this name already exists in this academic section.");
      return;
    }
    setRequiredAcademicSubfields((prev) => ({
      ...prev,
      [academicField]: {
        ...prev[academicField],
        customFields: [
          ...prev[academicField].customFields,
          { name: newField.name, label: newField.label, type: newField.type, required: false },
        ],
      },
    }));
    setNewField({ academicField: "", name: "", label: "", type: "text" });
  };

  // Toggle document requirement
  const toggleDocument = (doc) => {
    console.log("Toggling document:", doc);
    setRequiredDocuments((prev) =>
      prev.includes(doc)
        ? prev.filter((d) => d !== doc)
        : [...prev, doc]
    );
  };

  // Save form structure
  const saveForm = () => {
    console.log("saveForm triggered");
    if (!courseId) {
      alert("No course selected!");
      return;
    }

    if (!programType) {
      alert("Please select a program type (UG/PG) before saving the form structure.");
      return;
    }

    const payload = {
      courseId,
      programType,
      requiredAcademicFields,
      requiredAcademicSubfields,
      requiredDocuments,
      educationFields: { tenth: false, twelfth: false, ug: false, pg: false },
      sections: [],
    };

    console.log("Saving form with:", payload);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to save the form structure.");
      return;
    }

    axios
      .post("http://127.0.0.1:3001/api/forms/save-form-structure", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Form structure saved:", response.data);
        alert("Form structure saved successfully");
      })
      .catch((err) => {
        console.error("Error saving form:", err);
        const errorMessage =
          err.response?.status === 404
            ? "Form submission endpoint not found. Please contact support."
            : err.response?.data?.message || "Failed to save form structure. Please try again.";
        alert(errorMessage);
      });
  };

  // Handle Modify Form button click
  const handleModifyFormToggle = () => {
    if (!areDescriptionFieldsFilled()) {
      setAlertMessage("Description form has not been filled.");
      setTimeout(() => setAlertMessage(""), 3000); // Hide alert after 3 seconds
      return;
    }
    console.log("Modify Form button clicked, showModifyForm:", !showModifyForm);
    setShowModifyForm(!showModifyForm);
  };

  return (
    <div className="content-admin-description">
      <h2>Add Program Description</h2>

      {/* Temporary Alert Pop-up */}
      {alertMessage && (
        <div className="alert-popup">
          {alertMessage}
        </div>
      )}

      <div className="form-group">
        <label>Program Description</label>
        <textarea
          placeholder="Enter program description..."
          value={programDescription}
          onChange={(e) => setProgramDescription(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Upload Image 1 (Max 5MB)</label>
        <input type="file" accept="image/*" onChange={handleImage1Upload} />
        {image1 && <img src={image1} alt="Uploaded Image 1" className="uploaded-image" />}
      </div>

      <div className="form-group">
        <label>Upload Image 2 (Max 5MB)</label>
        <input type="file" accept="image/*" onChange={handleImage2Upload} />
        {image2 && <img src={image2} alt="Uploaded Image 2" className="uploaded-image" />}
      </div>

      <div className="form-group">
        <label>Vision</label>
        <textarea
          placeholder="Enter vision..."
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Mission</label>
        <textarea
          placeholder="Enter mission..."
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Years of Department</label>
        <input
          type="number"
          placeholder="Enter years of department..."
          value={yearsOfDepartment}
          onChange={(e) => setYearsOfDepartment(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Syllabus</label>
        {syllabus.map((semester, index) => (
          <div key={index} className="syllabus-semester">
            <input
              type="text"
              placeholder="Semester (e.g., Semester 1)"
              value={semester.semester}
              onChange={(e) => handleSyllabusChange(index, "semester", e.target.value)}
              required
            />
            {semester.subjects.map((subject, subjectIndex) => (
              <input
                key={subjectIndex}
                type="text"
                placeholder={`Subject ${subjectIndex + 1}`}
                value={subject}
                onChange={(e) => handleSubjectChange(index, subjectIndex, e.target.value)}
                required
              />
            ))}
            <button onClick={() => addSubject(index)} className="btn btn-secondary">
              Add Subject
            </button>
          </div>
        ))}
        <button onClick={addSyllabusSemester} className="btn btn-secondary">
          Add Semester
        </button>
      </div>

      <div className="form-group">
        <label>Program Educational Objectives (PEOs)</label>
        <textarea
          placeholder="Enter PEOs (one per line)..."
          value={programEducationalObjectives}
          onChange={(e) => setProgramEducationalObjectives(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Program Outcomes (POs)</label>
        <textarea
          placeholder="Enter POs (one per line)..."
          value={programOutcomes}
          onChange={(e) => setProgramOutcomes(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Program Type</label>
        <div>
          <label>
            <input
              type="radio"
              name="programType"
              value="UG"
              checked={programType === "UG"}
              onChange={() => setProgramType("UG")}
            />
            UG (Undergraduate)
          </label>
          <label>
            <input
              type="radio"
              name="programType"
              value="PG"
              checked={programType === "PG"}
              onChange={() => setProgramType("PG")}
            />
            PG (Postgraduate)
          </label>
        </div>
      </div>

      {(programType === "UG" || programType === "PG") && (
        <button
          onClick={handleModifyFormToggle}
          className="btn btn-secondary"
          style={{ marginTop: "10px" }}
        >
          {showModifyForm ? "Hide Modify Form" : "Modify Form"}
        </button>
      )}

      {showModifyForm && (programType === "UG" || programType === "PG") && (
        <div className="modify-form-section">
          <h4>Modify Form for {programType}</h4>

          <h5>Academic Fields</h5>
          {academicOptions[programType].map((field) => (
            <div key={field} className="academic-field">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  checked={requiredAcademicFields.includes(field)}
                  onChange={() => toggleAcademicField(field)}
                />
                <label>
                  {field === "tenth"
                    ? "10th"
                    : field === "twelth"
                    ? "12th"
                    : field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                  Details
                </label>
              </div>
              {requiredAcademicFields.includes(field) && requiredAcademicSubfields[field] && (
                <div className="subfields">
                  {Object.keys(requiredAcademicSubfields[field])
                    .filter((key) => key !== "customFields")
                    .map((subfield) => (
                      <div key={subfield} className="checkbox-item subfield-item">
                        <input
                          type="checkbox"
                          checked={requiredAcademicSubfields[field][subfield]}
                          onChange={() => toggleAcademicSubfield(field, subfield)}
                        />
                        <label>{subfieldLabels[subfield]}</label>
                      </div>
                    ))}
                  {requiredAcademicSubfields[field].customFields.map((customField) => (
                    <div key={customField.name} className="checkbox-item subfield-item">
                      <input
                        type="checkbox"
                        checked={customField.required}
                        onChange={() => toggleCustomField(field, customField.name)}
                      />
                      <label>
                        {customField.label} ({customField.type})
                      </label>
                    </div>
                  ))}
                  <div className="add-field-section">
                    <input
                      type="text"
                      name="name"
                      value={newField.academicField === field ? newField.name : ""}
                      onChange={(e) =>
                        handleNewFieldChange({
                          target: { name: "name", value: e.target.value },
                        })
                      }
                      onFocus={() => setNewField((prev) => ({ ...prev, academicField: field }))}
                      placeholder="Field Name (e.g., stream)"
                      className="add-field-input"
                    />
                    <input
                      type="text"
                      name="label"
                      value={newField.academicField === field ? newField.label : ""}
                      onChange={(e) =>
                        handleNewFieldChange({
                          target: { name: "label", value: e.target.value },
                        })
                      }
                      onFocus={() => setNewField((prev) => ({ ...prev, academicField: field }))}
                      placeholder="Field Label (e.g., Stream)"
                      className="add-field-input"
                    />
                    <select
                      name="type"
                      value={newField.academicField === field ? newField.type : "text"}
                      onChange={(e) =>
                        handleNewFieldChange({
                          target: { name: "type", value: e.target.value },
                        })
                      }
                      onFocus={() => setNewField((prev) => ({ ...prev, academicField: field }))}
                      className="add-field-select"
                    >
                      {fieldTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => addCustomField(field)}
                      className="btn btn-secondary add-field-button"
                    >
                      Add Field
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <h5>Document Requirements</h5>
          {documentOptions[programType].map((doc) => (
            <div key={doc} className="checkbox-item">
              <input
                type="checkbox"
                checked={requiredDocuments.includes(doc)}
                onChange={() => toggleDocument(doc)}
              />
              <label>{doc}</label>
            </div>
          ))}

          <button className="submit-modified-button" onClick={saveForm}>
            Submit Modified Application
          </button>
        </div>
      )}

      <button className="btn btn-primary" onClick={saveDescription}>
        Save Description
      </button>
    </div>
  );
};

export default ContentAdminDescription;