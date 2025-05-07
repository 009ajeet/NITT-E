import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./courses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State for editing
  const [editCourse, setEditCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    duration: "",
    fee: "",
    requirement: "",
    contact: "",
    subjectCode: "",
    assignedTo: "",
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Fetch courses (backend filters for content admins)
    fetch("http://127.0.0.1:3001/api/courses", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Unauthorized. Please log in.");
        if (!res.ok) throw new Error("Failed to fetch courses.");
        return res.json();
      })
      .then((data) => setCourses(data))
      .catch((err) => {
        console.error("Error fetching courses:", err);
        alert(err.message);
      });

    window.scrollTo(0, 0);
  }, [currentUser, navigate]);

  const handleEdit = (course) => {
    setEditCourse(course);
    setEditFormData({
      title: course.title || "",
      description: course.description || "",
      duration: course.duration || "",
      fee: course.fee || "",
      requirement: course.requirement || "",
      contact: course.contact || "",
      subjectCode: course.subjectCode || "",
      assignedTo: course.assignedTo || "",
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    const missingFields = [];
    if (!editFormData.title.trim()) missingFields.push("title");
    if (!editFormData.description.trim()) missingFields.push("description");
    if (!editFormData.duration || isNaN(editFormData.duration) || editFormData.duration <= 0)
      missingFields.push("duration");
    if (!editFormData.fee || isNaN(editFormData.fee) || editFormData.fee <= 0)
      missingFields.push("fee");
    if (!editFormData.requirement.trim()) missingFields.push("requirement");
    if (!editFormData.contact.trim()) missingFields.push("contact");
    if (!editFormData.subjectCode.trim()) missingFields.push("subjectCode");
    if (!editFormData.assignedTo.trim()) missingFields.push("assignedTo");

    if (missingFields.length > 0) {
      alert(`Please fill in all fields: ${missingFields.join(", ")}`);
      return;
    }

    fetch(`http://127.0.0.1:3001/api/courses/${editCourse._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        duration: Number(editFormData.duration),
        fee: Number(editFormData.fee),
        requirement: editFormData.requirement.trim(),
        contact: editFormData.contact.trim(),
        subjectCode: editFormData.subjectCode.trim(),
        assignedTo: editFormData.assignedTo.trim(),
      }),
    })
      .then((res) => {
        if (res.status === 403) throw new Error("Access denied. Admins only.");
        if (!res.ok) throw new Error("Failed to update course.");
        return res.json();
      })
      .then((response) => {
        setCourses(
          courses.map((c) =>
            c._id === editCourse._id ? response.course : c
          )
        );
        setEditCourse(null);
        alert("Course updated successfully!");
      })
      .catch((err) => {
        console.error("Error updating course:", err);
        alert(err.message);
      });
  };

  const handleDelete = (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    fetch(`http://127.0.0.1:3001/api/courses/${courseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (res.status === 403) throw new Error("Access denied. Admins only.");
        if (!res.ok) throw new Error("Failed to delete course.");
        return res.json();
      })
      .then(() => {
        setCourses(courses.filter((c) => c._id !== courseId));
        alert("Course deleted successfully!");
      })
      .catch((err) => {
        console.error("Error deleting course:", err);
        alert(err.message);
      });
  };

  return (
    <div className="courses-container">
      <h1 className="page-title">Explore Our Courses</h1>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="What do you want to learn?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="courses-grid">
        {courses
          .filter((course) => course.title.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-code">{course.subjectCode || "No Code"}</div>
              <h2 className="course-title">{course.title}</h2>
              <p className="course-description">{course.description}</p>
              <p><strong>Duration:</strong> {course.duration} years</p>
              <p><strong>Fee:</strong> ₹{course.fee}</p>
              <p><strong>Contact Details:</strong> {course.contact}</p>
              <p><strong>Requirements:</strong> {course.requirement}</p>
              <p><strong>Assigned To:</strong> {course.assignedTo}</p>

              {currentUser?.role === "student" && (
                <Link to={`/courses/${course._id}`}>
                  <button className="explore-button">Explore</button>
                </Link>
              )}

              {currentUser?.role === "content_admin" && (
                <div className="content-admin-buttons">
                  <Link to={`/content-admin/add-description/${course._id}`}>
                    <button className="admin-button">Add Description</button>
                  </Link>
                </div>
              )}

              {currentUser?.role === "admin" && (
                <div className="admin-buttons">
                  <button
                    className="admin-button"
                    onClick={() => handleEdit(course)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-button"
                    onClick={() => handleDelete(course._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {currentUser?.role === "admin" && (
        <Link to="/add-course">
          <button className="add-course-button">Add New Course</button>
        </Link>
      )}

      {editCourse && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h2>Edit Course</h2>
            <form onSubmit={handleEditSubmit} className="form-container">
              <input
                type="text"
                name="title"
                placeholder="Course Title"
                value={editFormData.title}
                onChange={handleEditChange}
                required
              />
              <textarea
                name="description"
                placeholder="Course Description"
                value={editFormData.description}
                onChange={handleEditChange}
                required
              />
              <input
                type="number"
                name="duration"
                placeholder="Duration (in years)"
                value={editFormData.duration}
                onChange={handleEditChange}
                required
              />
              <input
                type="number"
                name="fee"
                placeholder="Fee (in ₹)"
                value={editFormData.fee}
                onChange={handleEditChange}
                required
              />
              <input
                type="text"
                name="requirement"
                placeholder="Requirements"
                value={editFormData.requirement}
                onChange={handleEditChange}
                required
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact Details"
                value={editFormData.contact}
                onChange={handleEditChange}
                required
              />
              <input
                type="text"
                name="subjectCode"
                placeholder="Subject Code"
                value={editFormData.subjectCode}
                onChange={handleEditChange}
                required
              />
              <input
                type="email"
                name="assignedTo"
                placeholder="Assigned Content Admin Email"
                value={editFormData.assignedTo}
                onChange={handleEditChange}
                required
              />
              <div className="edit-modal-buttons">
                <button type="submit" className="admin-button">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="admin-button"
                  onClick={() => setEditCourse(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;