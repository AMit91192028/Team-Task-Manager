import { useEffect, useState } from "react";
import { createProject, fetchProjects } from "../api/projectService";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import PageHeader from "../components/PageHeader";
import ProjectCard from "../components/ProjectCard";
import useAuth from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import "./ProjectsPage.css";

export default function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProjects = async () => {
    try {
      setError("");
      const response = await fetchProjects();
      setProjects(response.projects || []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await createProject(formData);
      setFormData({ name: "", description: "" });
      await loadProjects();
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen label="Loading projects..." />;
  }

  return (
    <div className="projects-page">
      <PageHeader
        eyebrow="Projects"
        title={isAdmin ? "Build, assign, and track project delivery in one place." : "View the projects assigned to you."}
        description={
          isAdmin
            ? "This space gives you a clear project list with simple creation flow and quick access to each team workspace."
            : "Members can only access projects where an admin has added them."
        }
      />

      <section className="projects-page__layout">
        {isAdmin ? (
          <form className="projects-page__form" onSubmit={handleSubmit}>
            <h2>Create New Project</h2>
            <label>
              Project name
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Customer portal revamp"
                required
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Explain the objective, scope, and expected delivery"
              />
            </label>
            {formError ? <div className="projects-page__error">{formError}</div> : null}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create project"}
            </button>
          </form>
        ) : (
          <div className="projects-page__form">
            <h2>Member Restrictions</h2>
            <p>
              Members cannot create or delete projects. You can only open the
              projects where an admin has added you.
            </p>
          </div>
        )}

        <div className="projects-page__list">
          {error ? <div className="projects-page__error">{error}</div> : null}

          {projects.length ? (
            <div className="projects-page__grid">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No projects available"
              description={
                isAdmin
                  ? "Create a project to begin adding members and tasks."
                  : "Assigned projects will appear here once an admin adds you."
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
