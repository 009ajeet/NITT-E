import React from "react";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-card">
        <h2 className="contact-title">Contact Information</h2>
        <div className="contact-info">
          <div className="info-item">
            <h3 className="info-title">Location:</h3>
            <p className="info-detail">
              National Institute of Technology, Trichy
              <br />
              Tiruchirappalli, Tamil Nadu, India - 620015
            </p>
          </div>

          <div className="info-item">
            <h3 className="info-title">Telephone Numbers:</h3>
            <p className="info-detail">
              +91 431 2503000 (Reception)
              <br />
              +91 431 2503800 (Admin)
            </p>
          </div>

          <div className="info-item">
            <h3 className="info-title">Email:</h3>
            <p className="info-detail">contact@nitt.edu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
