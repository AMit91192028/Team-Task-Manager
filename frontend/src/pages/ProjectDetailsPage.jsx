import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addMemberToProject,
  deleteProject,
  fetchProjectById,
  fetchProjectMembers,
  removeMemberFromProject,
  updateProject
} from "../api/projectService";
import {
  createTask,
  deleteTask,
  fetchTaskById,
  fetchTasksByProject,
  updateTask,
  updateTaskStatus
} from "../api/taskService";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import PageHeader from "../components/PageHeader";
import TaskTable from "../components/TaskTable";
import useAuth from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import "./ProjectDetailsPage.css";

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
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
  const [editingTaskId, setEditingTaskId] = useState("");
  const [activeMemberId, setActiveMemberId] = useState("");
  const [activeTaskId, setActiveTaskId] = useState("");
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    status: "active"
  });
  const [memberForm, setMemberForm] = useState({ email: "" });
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

  const getAssignableMembers = (projectData = project, memberList = members) =>
    (memberList || []).filter(
      (member) => String(member._id) !== String(projectData?.createdBy?._id)
    );

  const resetTaskForm = (projectData = project, memberList = members) => {
    const assignableMembers = getAssignableMembers(projectData, memberList);

    setEditingTaskId("");
    setTaskError("");
    setTaskForm({
      title: "",
      description: "",
      assignedTo: assignableMembers[0]?.email || "",
      priority: "medium",
      dueDate: ""
    });
  };

  const formatDateForInput = (value) => {
    if (!value) return "";

    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  };

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
      const assignableMembers = getAssignableMembers(
        projectResponse.project,
        membersResponse.members || []
      );

      setTaskForm((current) => ({
        ...current,
        assignedTo:
          assignableMembers.find((member) => member.email === current.assignedTo)?.email ||
          assignableMembers[0]?.email ||
          ""
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
    setMemberForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
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
      setMemberForm({ email: "" });
      await loadProjectData();
    } catch (submitError) {
      setMemberError(getApiErrorMessage(submitError));
    }
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    setTaskError("");
    setActiveTaskId(editingTaskId || "new");

    try {
      if (editingTaskId) {
        await updateTask(editingTaskId, taskForm);
      } else {
        await createTask({
          ...taskForm,
          project: projectId
        });
      }

      resetTaskForm();
      await loadProjectData();
    } catch (submitError) {
      setTaskError(getApiErrorMessage(submitError));
    } finally {
      setActiveTaskId("");
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

  const handleEditTask = async (task) => {
    setTaskError("");
    setActiveTaskId(task._id);

    try {
      const response = await fetchTaskById(task._id);
      const selectedTask = response.task;

      setEditingTaskId(selectedTask._id);
      setTaskForm({
        title: selectedTask.title || "",
        description: selectedTask.description || "",
        assignedTo: selectedTask.assignedTo?.email || "",
        priority: selectedTask.priority || "medium",
        dueDate: formatDateForInput(selectedTask.dueDate)
      });
    } catch (loadError) {
      setTaskError(getApiErrorMessage(loadError));
    } finally {
      setActiveTaskId("");
    }
  };

  const handleDeleteTask = async (task) => {
    const shouldDelete = window.confirm(`Delete task "${task.title}"?`);

    if (!shouldDelete) {
      return;
    }

    setTaskError("");
    setActiveTaskId(task._id);

    try {
      await deleteTask(task._id);

      if (editingTaskId === task._id) {
        resetTaskForm();
      }

      await loadProjectData();
    } catch (deleteError) {
      setTaskError(getApiErrorMessage(deleteError));
    } finally {
      setActiveTaskId("");
    }
  };

  const handleRemoveMember = async (member) => {
    const shouldRemove = window.confirm(
      `Remove ${member.name} from this project? Their assigned tasks in this project will also be deleted.`
    );

    if (!shouldRemove) {
      return;
    }

    setMemberError("");
    setActiveMemberId(member._id);

    try {
      await removeMemberFromProject(projectId, member._id);

      if (taskForm.assignedTo === member.email) {
        resetTaskForm(project, members.filter((item) => item._id !== member._id));
      }

      await loadProjectData();
    } catch (removeError) {
      setMemberError(getApiErrorMessage(removeError));
    } finally {
      setActiveMemberId("");
    }
  };

  const handleDeleteProject = async () => {
    const shouldDelete = window.confirm(
      `Delete project "${project.name}"? This will also delete all related tasks.`
    );

    if (!shouldDelete) {
      return;
    }

    setError("");
    setIsDeletingProject(true);

    try {
      await deleteProject(projectId);
      navigate("/projects", { replace: true });
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
      setIsDeletingProject(false);
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
        actions={
          <div className="project-details-page__header-actions">
            <span className="project-details-page__status">{project.status}</span>
            {isProjectAdmin ? (
              <button
                type="button"
                className="project-details-page__danger-button"
                disabled={isDeletingProject}
                onClick={handleDeleteProject}
              >
                {isDeletingProject ? "Deleting..." : "Delete project"}
              </button>
            ) : null}
          </div>
        }
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
                  Member email
                  <input
                    type="email"
                    name="email"
                    value={memberForm.email}
                    onChange={handleMemberField}
                    placeholder="member@example.com"
                    required
                  />
                </label>
                {memberError ? <div className="project-details-page__error">{memberError}</div> : null}
                <button type="submit">Add member</button>
              </form>

              <form className="project-details-page__card" onSubmit={handleTaskSubmit}>
                <h2>{editingTaskId ? "Edit Task" : "Create Task"}</h2>
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
                      <option value="" disabled>
                        Select member email
                      </option>
                      {members
                        .filter(
                          (member) =>
                            String(member._id) !== String(project.createdBy?._id)
                        )
                        .map((member) => (
                        <option key={member._id} value={member.email}>
                          {member.name} ({member.email})
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
                <div className="project-details-page__button-row">
                  {editingTaskId ? (
                    <button
                      type="button"
                      className="project-details-page__ghost-button"
                      onClick={() => resetTaskForm()}
                    >
                      Cancel edit
                    </button>
                  ) : null}
                  <button type="submit" disabled={!taskForm.assignedTo || activeTaskId === "new"}>
                    {editingTaskId
                      ? activeTaskId === editingTaskId
                        ? "Saving..."
                        : "Save task"
                      : activeTaskId === "new"
                        ? "Creating..."
                        : "Create task"}
                  </button>
                </div>
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
                onEditTask={isProjectAdmin ? handleEditTask : undefined}
                onDeleteTask={isProjectAdmin ? handleDeleteTask : undefined}
                actionTaskId={activeTaskId}
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
                <div className="project-details-page__member-actions">
                  <span>{String(member._id) === String(project.createdBy?._id) ? "Admin" : "Member"}</span>
                  {isProjectAdmin &&
                  String(member._id) !== String(project.createdBy?._id) ? (
                    <button
                      type="button"
                      className="project-details-page__member-button"
                      disabled={activeMemberId === member._id}
                      onClick={() => handleRemoveMember(member)}
                    >
                      {activeMemberId === member._id ? "Removing..." : "Remove"}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
