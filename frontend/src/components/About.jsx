import React, { useState, useEffect } from "react";
import "./About.css";

const About = () => {
  const images = [
    "images/first.jpeg",
    "images/Library.jpeg",
    "images/TP.jpeg",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      
    }, 3000); // this function is helping in change of image itself at 3 sec
    
  
    return () => clearInterval(interval);
  }, [images.length]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-container">
      <section className="about-section">
        <h1 className="about-heading">About</h1>
        <hr />
        <div className="slider-container enhanced-slider">
          <img
            src={images[currentIndex]}
            className="slider-image"
          />
        </div>

        <p className="about-description">
          NIT Tiruchirappalli defines itself as an institution of global
          standards, a pool of talented students, and committed faculty,
          fostering solutions for real-world problems.
        </p>

        <div className="about-content">
          <div className="about-block">
            <h2 className="sub-heading">Vision</h2>
            <p>
              To be a university globally trusted for technical excellence where
              learning and research integrate to sustain society and industry.
            </p>
          </div>

          <div className="about-block">
            <h2 className="sub-heading">Mission</h2>
            <ul>
              <li>
                To offer undergraduate, postgraduate, doctoral, and modular
                programmes in multi-disciplinary / inter-disciplinary and
                emerging areas.
              </li>
              <li>
                To create a converging learning environment to serve a
                dynamically evolving society.
              </li>
              <li>
                To promote innovation for sustainable solutions by forging
                global collaborations with academia and industry in cutting-edge
                research.
              </li>
              <li>
                To be an intellectual ecosystem where human capabilities can
                develop holistically.
              </li>
            </ul>
          </div>

          <div className="about-block">
            <h2 className="sub-heading">Core Values</h2>
            <ul>
              <li>
                <strong>Integrity:</strong> Honest in intention, fair in
                evaluation, transparent in deeds, and ethical in our personal
                and professional conduct.
              </li>
              <li>
                <strong>Excellence:</strong> Commitment to continuous
                improvement coupled with a passion for innovation that drives
                the pursuit of best practices.
              </li>
              <li>
                <strong>Unity:</strong> Building capacity through trust in
                others’ abilities and cultivating respect as the cornerstone of
                collective effort.
              </li>
              <li>
                <strong>Inclusivity:</strong> No one left behind in the mission
                of nation-building through higher learning.
              </li>
            </ul>
          </div>

          <div className="about-block">
            <h2 className="sub-heading">Goals</h2>
            <ul>
              <li>Attracting top talent and fostering global collaborations.</li>
              <li>
                Building world-class research infrastructure for
                multi-disciplinary research.
              </li>
              <li>Initiatives towards financial sustainability.</li>
              <li>
                Social outreach activities of national and international
                importance.
              </li>
              <li>
                Achieving a top 10 ranking in Engineering Discipline in India.
              </li>
              <li>
                Being in the top 500 in World Rankings within five years.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;