import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext"; // Adjust path accordingly
import { FaUserCircle } from "react-icons/fa"; // Optional: for user icon
import "./Navbar.css";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDashboardRedirect = () => {
    if (currentUser?.role === "admin") {
      navigate("/Admindashboard");
    } else if (currentUser?.role === "content_admin") {
      navigate("/contentAdmin");
    } else if (currentUser?.role === "student") {
      navigate("/dashboard");
    }
    else if (currentUser?.role === "faculty"){
      navigate("/faculty");
    }
    else if (currentUser?.role === "verification_admin") {
      navigate("/verification-admin");
    } else if (currentUser?.role === "verification_officer") {
      navigate("/verification-officer");
    } else {
      navigate("/");
    }
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleChangePassword = () => {
    navigate("/change-password");
    setIsDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/images/nitt.png" alt="NITT Logo" />
        NIT Trichy E-Campus
      </div>

      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/courses">Courses</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/payment">Payment</Link></li>
      </ul>

      <div className="navbar-search">
        <input type="text" placeholder="Search..." />
        <button>Search</button>
      </div>

      {currentUser ? (
        <div className="navbar-user-menu">
          {/* User icon */}
          <div
            className="user-icon"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaUserCircle size={32} />
          </div>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleDashboardRedirect}>Dashboard</button>
              <button onClick={handleChangePassword}>Change Password</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" className="login-link">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;
