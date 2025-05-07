import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./description.css";

const Description = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:3001/api/courses/${courseId}`)
      .then((response) => setCourse(response.data))
      .catch((err) => console.error("Error fetching course description:", err));
  }, [courseId]);

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="description-container">
      <h2>{course.title}</h2>
      <p className="description">{course.programDescription || "No description available."}</p>

      <h3>Images</h3>
      <div className="image-preview">
        {course.image1 ? (
          <img src={course.image1} alt="Image 1" className="course-image" />
        ) : (
          <p>No image available.</p>
        )}
        {course.image2 ? (
          <img src={course.image2} alt="Image 2" className="course-image" />
        ) : (
          <p>No image available.</p>
        )}
      </div>

      <h3>Vision</h3>
      <p className="vision">{course.vision || "No vision statement available."}</p>

      <h3>Mission</h3>
      <p className="mission">{course.mission || "No mission statement available."}</p>

      <h3>Years of Department</h3>
      <p className="years-of-department">
        {course.yearsOfDepartment ? `${course.yearsOfDepartment} years` : "Not specified."}
      </p>

      <h3>Syllabus</h3>
      {course.syllabus && course.syllabus.length > 0 ? (
        course.syllabus.map((semester, index) => (
          <div key={index} className="syllabus-semester">
            <h4>{semester.semester}</h4>
            <ul>
              {semester.subjects.map((subject, subjectIndex) => (
                <li key={subjectIndex}>{subject}</li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No syllabus available.</p>
      )}

      <h3>Program Educational Objectives (PEOs)</h3>
      {course.programEducationalObjectives && course.programEducationalObjectives.length > 0 ? (
        <ul className="peos">
          {course.programEducationalObjectives.map((peo, index) => (
            <li key={index}>{peo}</li>
          ))}
        </ul>
      ) : (
        <p>No PEOs available.</p>
      )}

      <h3>Program Outcomes (POs)</h3>
      {course.programOutcomes && course.programOutcomes.length > 0 ? (
        <ul className="pos">
          {course.programOutcomes.map((po, index) => (
            <li key={index}>{po}</li>
          ))}
        </ul>
      ) : (
        <p>No POs available.</p>
      )}

      <Link to={`/application/${courseId}`}>
        <button className="btn btn-primary">Proceed to Fill Application Form</button>
      </Link>
    </div>
  );
};

export default Description;