import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>NIT Trichy eCampus</h3>
          <p>
            NIT Trichy eCampus is a centralized platform for M.Tech students to access academic resources, manage courses, and collaborate with faculty and administration. 
            Join us in empowering education and innovation.
          </p>
        </div>

        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>Email: <a href="mailto:ecampus@nitt.edu">ecampus@nitt.edu</a></p>
          <p>Phone: +91-1234567890</p>
          <p>Address: National Institute of Technology, Tiruchirappalli, Tamil Nadu, India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 NIT Trichy eCampus. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
