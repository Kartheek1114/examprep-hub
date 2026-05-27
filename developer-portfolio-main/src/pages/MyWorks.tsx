import { config } from "../config";
import "./MyWorks.css";

const MyWorks = () => {
  return (
    <div className="myworks-page">
      <div className="myworks-header">
        {/* <Link to="/" className="back-button" data-cursor="disable">
          ← Back to Home
        </Link> */}
        <h1>
          All <span>Works</span>
        </h1>
        <p>A collection of all my projects and creations</p>
      </div>

      <div className="myworks-grid">
        {config.projects.map((project, index) => (
          <div className="myworks-card" key={project.id} data-cursor="disable">
            <div className="myworks-card-number">0{index + 1}</div>
            <div className="myworks-card-image">
              <img src={project.image} alt={project.title} />
            </div>
            <div className="myworks-card-info">
              <h3>{project.title}</h3>
              <p className="myworks-card-category">{project.category}</p>
              <p className="myworks-card-description">{project.description}</p>
              <p className="myworks-card-tech">{project.technologies}</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {project.liveLink && project.liveLink !== "#" && (
                  <a 
                    href={project.liveLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="view-live-button"
                    data-cursor="disable"
                  >
                    View Live
                  </a>
                )}
                {"sourceCodeLink" in project && project.sourceCodeLink && project.sourceCodeLink !== "#" && (
                  <a 
                    href={(project as any).sourceCodeLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="view-live-button"
                    data-cursor="disable"
                  >
                    View Source Code
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="myworks-footer">
        <a
          href="https://github.com/Kartheek1114"
          target="_blank"
          rel="noopener noreferrer"
          className="view-all-works-btn"
          data-cursor="disable"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          View All My Works on GitHub
        </a>
      </div>
    </div>
  );
};

export default MyWorks;
