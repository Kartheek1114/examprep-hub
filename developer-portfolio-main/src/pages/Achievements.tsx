// import { Link } from "react-router-dom";
import { config } from "../config";
import "../components/styles/Career.css";
import "./Achievements.css";

const Achievements = () => {
  return (
    <div className="achievements-page bg-dark text-white min-vh-100 py-5">
      <div className="container py-5">
        {/* <Link to="/" className="back-button mb-5 d-inline-block text-decoration-none">
          ← Back to Portfolio
        </Link> */}
        
        <div className="page-header mb-5 text-center">
          <h1 className="display-3 fw-bold">
            Achievements <span>&</span> Certificates
          </h1>
          <p className="lead opacity-75">A collection of my professional proof and key milestones</p>
        </div>

        {/* Achievements Section */}
        <div className="career-container achievements-container mb-100">
          <h2 className="mb-4">
            Key <span>&</span> Achievements
          </h2>
          <div className="career-info">
            {(config as any).achievements?.map((achievement: any, index: number) => (
              <div key={index} className="career-info-box mb-5">
                <div className="career-info-in d-flex justify-content-between">
                  <div className="career-role">
                    <h4 className="h2">{achievement.title}</h4>
                    <h5 className="text-accent">{achievement.date}</h5>
                  </div>
                </div>
                <p className="lead mt-3">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates Section */}
        <div className="career-container certificates-container py-5">
          <h2 className="mb-4">
            Proven <span>&</span> Certificates
          </h2>
          <div className="career-info">
            {(config as any).certificates?.map((cert: any, index: number) => (
              <div key={index} className="career-info-box cert-hover-box mb-4">
                <div className="career-info-in d-flex justify-content-between align-items-center">
                  <div className="career-role">
                    <h4 className="h3">{cert.title}</h4>
                    <h5 className="text-secondary">{cert.organization}</h5>
                  </div>
                  <h3 className="h4 text-light">{cert.date}</h3>
                </div>
                <div className="cert-image-preview">
                  <img 
                    src={cert.image} 
                    alt={cert.title} 
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements; 
