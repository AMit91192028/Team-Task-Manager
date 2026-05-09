import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addMemberToProject,
  fetchProjectById,
  fetchProjectMembers,
  updateProject
} from "../api/projectService";
import { createTask, fetchTasksByProject, updateTaskStatus } from "../api/taskService";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import PageHeader from "../components/PageHeader";
import TaskTable from "../components/TaskTable";
import useAuth from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import "./ProjectDetailsPage.css";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectError, setProjectError] = useState("");
  const [memberError, setMemberError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    status: "active"
  });
  const [memberForm, setMemberForm] = useState({ userId: "" });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDate: ""
  });

  const isProjectAdmin = useMemo(() => {
    if (!project || !user) return false;
    return String(project.createdBy?._id) === String(user.id);
  }, [project, user]);

  const loadProjectData = async () => {
    try {
      setError("");
      const [projectResponse, membersResponse, tasksResponse] = await Promise.all([
        fetchProjectById(projectId),
        fetchProjectMembers(projectId),
        fetchTasksByProject(projectId)
      ]);

      setProject(projectResponse.project);
      setMembers(membersResponse.members || []);
      setTasks(tasksResponse.tasks || []);
      setProjectForm({
        name: projectResponse.project.name,
        description: projectResponse.project.description || "",
        status: projectResponse.project.status
      });
      const assignableMembers = (membersResponse.members || []).filter(
        (member) => String(member._id) !== String(projectResponse.project.createdBy?._id)
      );

      setTaskForm((current) => ({
        ...current,
        assignedTo: assignableMembers[0]?._id || ""
      }));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handleProjectField = (event) => {
    setProjectForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleMemberField = (event) => {
    setMemberForm({ userId: event.target.value });
  };

  const handleTaskField = (event) => {
    setTaskForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleProjectUpdate = async (event) => {
    event.preventDefault();
    setProjectError("");

    try {
      await updateProject(projectId, projectForm);
      await loadProjectData();
    } catch (updateError) {
      setProjectError(getApiErrorMessage(updateError));
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    setMemberError("");

    try {
      await addMemberToProject(projectId, memberForm);
      setMemberForm({ userId: "" });
      await loadProjectData();
    } catch (submitError) {
      setMemberError(getApiErrorMessage(submitError));
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setTaskError("");

    try {
      await createTask({
        ...taskForm,
        project: projectId
      });
      setTaskForm((current) => ({
        ...current,
        title: "",
        description: "",
        dueDate: ""
      }));
      await loadProjectData();
    } catch (submitError) {
      setTaskError(getApiErrorMessage(submitError));
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, { status });
      await loadProjectData();
    } catch (statusError) {
      setError(getApiErrorMessage(statusError));
    }
  };

  if (isLoading) {
    return <LoadingScreen label="Loading project workspace..." />;
  }

  if (!project) {
    return (
      <div className="project-details-page">
        <EmptyState
          title="Project not found"
          description="The requested project could not be loaded."
        />
      </div>
    );
  }

  return (
    <div className="project-details-page">
      <PageHeader
        eyebrow={isProjectAdmin ? "Admin Access" : "Member Access"}
        title={project.name}
        description={project.description || "No project description added yet."}
        actions={<span className="project-details-page__status">{project.status}</span>}
      />

      {error ? <div className="project-details-page__error">{error}</div> : null}

      <section className="project-details-page__layout">
        <div className="project-details-page__main">
          {isProjectAdmin ? (
            <div className="project-details-page__forms">
              <form className="project-details-page__card" onSubmit={handleProjectUpdate}>
                <h2>Update Project</h2>
                <label>
                  Name
                  <input
                    name="name"
                    value={projectForm.name}
                    onChange={handleProjectField}
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    value={projectForm.description}
                    onChange={handleProjectField}
                    rows="4"
                  />
                </label>
                <label>
                  Status
                  <select name="status" value={projectForm.status} onChange={handleProjectField}>
                    <option value="active">active</option>
                    <option value="completed">completed</option>
                    <option value="archived">archived</option>
                  </select>
                </label>
                {projectError ? <div className="project-details-page__error">{projectError}</div> : null}
                <button type="submit">Save project</button>
              </form>

              <form className="project-details-page__card" onSubmit={handleAddMember}>
                <h2>Add Member</h2>
                <label>
                  Member user ID
                  <input
                    name="userId"
                    value={memberForm.userId}
                    onChange={handleMemberField}
                    placeholder="Paste member user id"
                    required
                  />
                </label>
                {memberError ? <div className="project-details-page__error">{memberError}</div> : null}
                <button type="submit">Add member</button>
              </form>

              <form className="project-details-page__card" onSubmit={handleCreateTask}>
                <h2>Create Task</h2>
                <label>
                  Title
                  <input
                    name="title"
                    value={taskForm.title}
                    onChange={handleTaskField}
                    placeholder="Prepare sprint planning deck"
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    value={taskForm.description}
                    onChange={handleTaskField}
                    rows="4"
                  />
                </label>
                <div className="project-details-page__grid">
                  <label>
                    Assign to
                    <select
                      name="assignedTo"
                      value={taskForm.assignedTo}
                      onChange={handleTaskField}
                      required
                    >
                      {members
                        .filter(
                          (member) =>
                            String(member._id) !== String(project.createdBy?._id)
                        )
                        .map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name}
                        </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Priority
                    <select
                      name="priority"
                      value={taskForm.priority}
                      onChange={handleTaskField}
                    >
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                    </select>
                  </label>
                </div>
                <label>
                  Due date
                  <input
                    type="date"
                    name="dueDate"
                    value={taskForm.dueDate}
                    onChange={handleTaskField}
                    required
                  />
                </label>
                {taskError ? <div className="project-details-page__error">{taskError}</div> : null}
                <button type="submit">Create task</button>
              </form>
            </div>
          ) : null}

          <div className="project-details-page__card">
            <div className="project-details-page__section-head">
              <h2>Task Board</h2>
              <p>Assigned members can update status directly from this table.</p>
            </div>

            {tasks.length ? (
              <TaskTable
                tasks={tasks}
                currentUser={user}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <EmptyState
                title="No tasks yet"
                description={
                  isProjectAdmin
                    ? "Create the first task to begin work tracking."
                    : "Tasks assigned to you in this project will appear here."
                }
              />
            )}
          </div>
        </div>

        <aside className="project-details-page__card">
          <div className="project-details-page__section-head">
            <h2>Team Members</h2>
            <p>Everyone attached to this project workspace.</p>
          </div>

          <div className="project-details-page__members">
            {members.map((member) => (
              <article key={member._id} className="project-details-page__member">
                <div>
                  <strong>{member.name}</strong>
                  <p>{member.email}</p>
                </div>
                <span>{String(member._id) === String(project.createdBy?._id) ? "Admin" : "Member"}</span>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
