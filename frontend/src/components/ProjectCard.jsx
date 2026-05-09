import { Link } from "react-router-dom";
import "./ProjectCard.css";

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project._id}`} className="project-card">
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
  );
}
