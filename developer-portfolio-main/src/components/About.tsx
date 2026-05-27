import "./styles/About.css";
import { config } from "../config";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-title-container">
        <h3 className="title">{config.about.title}</h3>
        <div className="title-line"></div>
      </div>
      <div className="about-me">
        <p className="para">
          {config.about.description}
        </p>
      </div>
    </div>
  );
};

export default About;
