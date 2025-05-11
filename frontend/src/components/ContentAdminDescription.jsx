import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./ContentAdminDescription.css";
import API_BASE_URL from '../config';

const ContentAdminDescription = () => {
  const { courseId } = useParams();
  const [user, setUser] = useState(null);
  const [programDescription, setProgramDescription] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [yearsOfDepartment, setYearsOfDepartment] = useState("");
  const [syllabus, setSyllabus] = useState([{ semester: "", subjects: [""] }]);
  const [programEducationalObjectives, setProgramEducationalObjectives] = useState("");
  const [programOutcomes, setProgramOutcomes] = useState("");
  const [programType, setProgramType] = useState("");
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [requiredAcademicFields, setRequiredAcademicFields] = useState([]);
  const [requiredAcademicSubfields, setRequiredAcademicSubfields] = useState({
    tenth: { percentage: false, yearOfPassing: false, board: false, schoolName: false, customFields: [] },
    twelth: { percentage: false, yearOfPassing: false, board: false, schoolName: false, customFields: [] },
    graduation: { percentage: false, yearOfPassing: false, university: false, collegeName: false, customFields: [] },
    postgraduate: { percentage: false, yearOfPassing: false, university: false, collegeName: false, customFields: [] },
  });
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [newField, setNewField] = useState({ academicField: "", name: "", label: "", type: "text" });
  const [formStructure, setFormStructure] = useState(null);

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const academicOptions = {
    UG: ["tenth", "twelth"],
    PG: ["tenth", "twelth", "graduation", "postgraduate"],
  };

  const documentOptions = {
    UG: [
      "10th Marksheet", "12th Marksheet", "Aadhaar", "PAN",
      "Driving License", "Image (Passport Photo)", "Signature",
    ],
    PG: [
      "10th Marksheet", "12th Marksheet", "Graduation Marksheet", "Postgraduate Marksheet",
      "Aadhaar", "PAN", "Driving License", "Image (Passport Photo)", "Signature",
    ],
  };

  const subfieldLabels = {
    percentage: "Percentage", yearOfPassing: "Year of Passing", board: "Board",
    university: "University", schoolName: "School Name", collegeName: "College Name",
  };

  const fieldTypeOptions = ["text", "number", "date", "dropdown"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (err) {
        console.error("Token decoding failed:", err);
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (user && user.role === "content_admin" && courseId) {
      axios
        .get(`${API_BASE_URL}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          if (res.data.programType) {
            setProgramType(res.data.programType);
          }
          setProgramDescription(res.data.programDescription || "");
          setImage1(res.data.image1 || null);
          setImage2(res.data.image2 || null);
          setVision(res.data.vision || "");
          setMission(res.data.mission || "");
          setYearsOfDepartment(res.data.yearsOfDepartment || "");
          setSyllabus(res.data.syllabus && res.data.syllabus.length > 0 ? res.data.syllabus : [{ semester: "", subjects: [""] }]);
          setProgramEducationalObjectives(res.data.programEducationalObjectives || "");
          setProgramOutcomes(res.data.programOutcomes || "");
        })
        .catch((err) => console.error("Error fetching course details:", err));

      axios
        .get(`${API_BASE_URL}/api/forms/get-form-structure/${courseId}`, { // Changed this line
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          if (res.data) {
            setFormStructure(res.data);
            setRequiredAcademicFields(res.data.requiredAcademicFields || []);
            setRequiredAcademicSubfields(res.data.requiredAcademicSubfields || {
              tenth: { percentage: false, yearOfPassing: false, board: false, schoolName: false, customFields: [] },
              twelth: { percentage: false, yearOfPassing: false, board: false, schoolName: false, customFields: [] },
              graduation: { percentage: false, yearOfPassing: false, university: false, collegeName: false, customFields: [] },
              postgraduate: { percentage: false, yearOfPassing: false, university: false, collegeName: false, customFields: [] },
            });
            setRequiredDocuments(res.data.requiredDocuments || []);
          }
        })
        .catch((err) => {
          console.error("Error fetching form structure:", err);
          setRequiredAcademicFields([]);
          setRequiredAcademicSubfields({
            tenth: { percentage: false, yearOfPassing: false, board: false, schoolName: false, customFields: [] },
            twelth: { percentage: false, yearOfPassing: false, board: false, schoolName: false, customFields: [] },
            graduation: { percentage: false, yearOfPassing: false, university: false, collegeName: false, customFields: [] },
            postgraduate: { percentage: false, yearOfPassing: false, university: false, collegeName: false, customFields: [] },
          });
          setRequiredDocuments([]);
        });
    }
  }, [courseId, user]);

  const handleImageUpload = (file, setImage) => {
    if (file.size > maxFileSize) {
      setAlertMessage("File size exceeds 5MB limit.");
      setTimeout(() => setAlertMessage(""), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImage1Upload = (e) => handleImageUpload(e.target.files[0], setImage1);
  const handleImage2Upload = (e) => handleImageUpload(e.target.files[0], setImage2);

  const addSyllabusSemester = () => setSyllabus([...syllabus, { semester: "", subjects: [""] }]);

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

  const validateForm = () => {
    if (!programDescription.trim() || !vision.trim() || !mission.trim() || !yearsOfDepartment) {
      setAlertMessage("Please fill in all basic description fields.");
      setTimeout(() => setAlertMessage(""), 3000);
      return false;
    }
    if (!image1 || !image2) {
      setAlertMessage("Please upload both images.");
      setTimeout(() => setAlertMessage(""), 3000);
      return false;
    }
    const yearsNum = Number(yearsOfDepartment);
    if (isNaN(yearsNum) || yearsNum <= 0) {
      setAlertMessage("Years of Department must be a positive number.");
      setTimeout(() => setAlertMessage(""), 3000);
      return false;
    }
    if (!syllabus.every(sem => sem.semester.trim() && Array.isArray(sem.subjects) && sem.subjects.length > 0 && sem.subjects.every(sub => sub.trim()))) {
      setAlertMessage("Please ensure all syllabus semesters have a name and at least one subject.");
      setTimeout(() => setAlertMessage(""), 3000);
      return false;
    }
    const peos = programEducationalObjectives.split("\\n").filter(peo => peo.trim());
    const pos = programOutcomes.split("\\n").filter(po => po.trim());
    if (peos.length === 0 || pos.length === 0) {
      setAlertMessage("Please provide Program Educational Objectives and Program Outcomes.");
      setTimeout(() => setAlertMessage(""), 3000);
      return false;
    }
    if (!["UG", "PG"].includes(programType)) {
      setAlertMessage("Please select a valid Program Type (UG/PG).");
      setTimeout(() => setAlertMessage(""), 3000);
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const updatedFormStructure = {
      ...(formStructure || {}),
      programType: programType,
      requiredAcademicFields: requiredAcademicFields,
      requiredAcademicSubfields: requiredAcademicSubfields,
      requiredDocuments: requiredDocuments,
    };

    const payload = {
      courseId,
      programDescription,
      image1,
      image2,
      vision,
      mission,
      yearsOfDepartment,
      syllabus,
      programEducationalObjectives,
      programOutcomes,
      formStructure: updatedFormStructure,
    };

    const token = localStorage.getItem("token");
    if (!token) {
      setAlertMessage("Please log in to save changes.");
      setTimeout(() => setAlertMessage(""), 3000);
      return;
    }

    axios
      .post(`${API_BASE_URL}/api/forms/save-form-structure`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setAlertMessage("Description and Form Structure saved successfully!");
        setTimeout(() => setAlertMessage(""), 3000);
        if (response.data && response.data.form) {
          setFormStructure(response.data.form);
        }
      })
      .catch((err) => {
        console.error("Error saving description/form structure:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          (err.response?.status === 404 ? "Save endpoint not found." : "Failed to save. Please try again.");
        setAlertMessage(errorMessage);
        setTimeout(() => setAlertMessage(""), 5000);
      });
  };

  const toggleAcademicField = (field) => {
    setRequiredAcademicFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const toggleAcademicSubfield = (academicField, subfield) => {
    setRequiredAcademicSubfields((prev) => ({
      ...prev,
      [academicField]: {
        ...prev[academicField],
        [subfield]: !prev[academicField][subfield],
      },
    }));
  };

  const toggleCustomField = (academicField, fieldName) => {
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

  const handleNewFieldChange = (e) => {
    const { name, value } = e.target;
    setNewField((prev) => ({ ...prev, [name]: value }));
  };

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

  const toggleDocument = (doc) => {
    setRequiredDocuments((prev) =>
      prev.includes(doc)
        ? prev.filter((d) => d !== doc)
        : [...prev, doc]
    );
  };

  const handleModifyFormToggle = () => {
    if (!validateForm()) {
      return;
    }
    setShowModifyForm(!showModifyForm);
  };

  return (
    <div className="content-admin-description">
      <h2>Add/Edit Program Description & Form Structure</h2>

      {alertMessage && (
        <div className={`alert-popup ${alertMessage.includes("successfully") ? "success" : "error"}`}>
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
          <label className="radio-label">
            <input
              type="radio"
              name="programType"
              value="UG"
              checked={programType === "UG"}
              onChange={() => setProgramType("UG")}
            />
            UG (Undergraduate)
          </label>
          <label className="radio-label">
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

      <button
        onClick={handleModifyFormToggle}
        className="btn btn-secondary"
        style={{ marginTop: "10px", marginBottom: "10px" }}
        disabled={!programType}
      >
        {showModifyForm ? "Hide Modify Form Structure" : "Modify Form Structure"}
      </button>

      {showModifyForm && (programType === "UG" || programType === "PG") && (
        <div className="modify-form-section">
          <h4>Modify Application Form Structure for {programType}</h4>
          <h5>Academic Fields to Include</h5>
          {academicOptions[programType].map((field) => (
            <div key={field} className="academic-field">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id={`field-${field}`}
                  checked={requiredAcademicFields.includes(field)}
                  onChange={() => toggleAcademicField(field)}
                />
                <label htmlFor={`field-${field}`}>
                  {subfieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1)} Details
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
                          id={`subfield-${field}-${subfield}`}
                          checked={requiredAcademicSubfields[field][subfield]}
                          onChange={() => toggleAcademicSubfield(field, subfield)}
                        />
                        <label htmlFor={`subfield-${field}-${subfield}`}>{subfieldLabels[subfield]}</label>
                      </div>
                    ))}
                  {requiredAcademicSubfields[field].customFields.map((customField) => (
                    <div key={customField.name} className="checkbox-item subfield-item">
                      <input
                        type="checkbox"
                        id={`custom-${field}-${customField.name}`}
                        checked={customField.required}
                        onChange={() => toggleCustomField(field, customField.name)}
                      />
                      <label htmlFor={`custom-${field}-${customField.name}`}>
                        {customField.label} ({customField.type})
                      </label>
                    </div>
                  ))}
                  <div className="add-field-section">
                    <input
                      type="text"
                      name="name"
                      value={newField.academicField === field ? newField.name : ""}
                      onChange={(e) => handleNewFieldChange({ target: { name: "name", value: e.target.value } })}
                      onFocus={() => setNewField((prev) => ({ ...prev, academicField: field, name: "", label: "", type: "text" }))}
                      placeholder="Field Name (e.g., stream)"
                      className="add-field-input"
                    />
                    <input
                      type="text"
                      name="label"
                      value={newField.academicField === field ? newField.label : ""}
                      onChange={(e) => handleNewFieldChange({ target: { name: "label", value: e.target.value } })}
                      onFocus={() => setNewField((prev) => ({ ...prev, academicField: field }))}
                      placeholder="Field Label (e.g., Stream)"
                      className="add-field-input"
                    />
                    <select
                      name="type"
                      value={newField.academicField === field ? newField.type : "text"}
                      onChange={(e) => handleNewFieldChange({ target: { name: "type", value: e.target.value } })}
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
                      type="button"
                    >
                      Add Custom Field
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <h5>Document Requirements</h5>
          {(documentOptions[programType] || []).map((doc) => (
            <div key={doc} className="checkbox-item">
              <input
                type="checkbox"
                id={`doc-${doc.replace(/\s+/g, '-')}`}
                checked={requiredDocuments.includes(doc)}
                onChange={() => toggleDocument(doc)}
              />
              <label htmlFor={`doc-${doc.replace(/\s+/g, '-')}`}>{doc}</label>
            </div>
          ))}
          <button type="button" className="submit-modified-button" onClick={handleSave}>
            Save Modified Form Structure (and Description)
          </button>
        </div>
      )}
      {!showModifyForm && (
        <button type="button" className="btn btn-primary" onClick={handleSave} style={{ marginTop: "20px" }}>
          Save Description & Current Form Settings
        </button>
      )}
    </div>
  );
};

export default ContentAdminDescription;