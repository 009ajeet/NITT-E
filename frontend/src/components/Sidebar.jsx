import React from "react";
import { FaUserTie, FaUserGraduate, FaBook, FaChalkboardTeacher, FaClipboardList } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ setActiveSection, activeSection }) => {
  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>
      <ul>
        <li 
          className={activeSection === "admins" ? "active" : ""} 
          onClick={() => setActiveSection("admins")}
        >
          <FaUserTie className="sidebar-icon" /> Registered Admins
        </li>
        <li 
          className={activeSection === "students" ? "active" : ""} 
          onClick={() => setActiveSection("students")}
        >
          <FaUserGraduate className="sidebar-icon" /> Registered Students
        </li>
        <li 
          className={activeSection === "courses" ? "active" : ""} 
          onClick={() => setActiveSection("courses")}
        >
          <FaBook className="sidebar-icon" /> Courses
        </li>
        <li 
          className={activeSection === "teachers" ? "active" : ""} 
          onClick={() => setActiveSection("teachers")}
        >
          <FaChalkboardTeacher className="sidebar-icon" /> Teachers
        </li>
        <li 
          className={activeSection === "notices" ? "active" : ""} 
          onClick={() => setActiveSection("notices")}
        >
          <FaClipboardList className="sidebar-icon" /> Notices
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;