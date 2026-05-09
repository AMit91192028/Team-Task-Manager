import { Link } from "react-router-dom";
import "./ProjectCard.css";

export default function ProjectCard({ project, canDelete = false, isDeleting = false, onDelete }) {
  return (
    <article className="project-card">
      <Link to={`/projects/${project._id}`} className="project-card__link">
        <div className="project-card__top">
          <h3>{project.name}</h3>
          <span>{project.status}</span>
        </div>

        <p>{project.description || "No description added yet."}</p>

        <div className="project-card__meta">
          <small>Lead: {project.createdBy?.name || "Unknown"}</small>
          <small>{project.members?.length || 0} members</small>
        </div>
      </Link>

      {canDelete ? (
        <div className="project-card__actions">
          <button
            type="button"
            className="project-card__danger-button"
            disabled={isDeleting}
            onClick={() => onDelete?.(project)}
          >
            {isDeleting ? "Deleting..." : "Delete project"}
          </button>
        </div>
      ) : null}
    </article>
  );
}
