import { useEffect, useMemo, useState } from "react";
import {
  fetchDashboardSummary,
  fetchOverdueTasks,
  fetchTaskStatusCount,
  fetchMemberProgress
} from "../api/dashboardService";
import { createProject, fetchProjects } from "../api/projectService";
import { fetchMyTasks, fetchTasks } from "../api/taskService";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import PageHeader from "../components/PageHeader";
import ProjectCard from "../components/ProjectCard";
import StatCard from "../components/StatCard";
import TaskTable from "../components/TaskTable";
import useAuth from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate } from "../utils/formatters";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [data, setData] = useState({
    summary: null,
    statusCount: null,
    overdueTasks: [],
    myTasks: [],
    projects: [],
    memberProgress: []
  });
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState(null);

  const overdueMembers = useMemo(
    () => data.memberProgress.filter((member) => member.overdue > 0),
    [data.memberProgress]
  );

  const loadDashboard = async () => {
    try {
      setError("");
      const requests = [
        fetchDashboardSummary(),
        fetchTaskStatusCount(),
        fetchOverdueTasks(),
        isAdmin ? fetchTasks() : fetchMyTasks(),
        fetchProjects()
      ];

      if (isAdmin) {
        requests.push(fetchMemberProgress());
      }

      const [
        summaryResponse,
        statusResponse,
        overdueResponse,
        myTasksResponse,
        projectsResponse,
        memberProgressResponse
      ] = await Promise.all(requests);

      setData({
        summary: summaryResponse.summary,
        statusCount: statusResponse.statusCount,
        overdueTasks: overdueResponse.tasks || [],
        myTasks: myTasksResponse.tasks || [],
        projects: projectsResponse.projects || [],
        memberProgress: memberProgressResponse?.members || []
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleProjectChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await createProject(formData);
      setFormData({ name: "", description: "" });
      await loadDashboard();
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen label="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow={isAdmin ? "Admin Dashboard" : "Member Dashboard"}
        title={`Hello ${user?.name}, here is your task pulse.`}
        description="Review delivery health, active projects, delayed work, and your current assignments from one place."
      />

      {error ? <div className="dashboard-page__error">{error}</div> : null}

      <section className="dashboard-page__hero">
        <div className="dashboard-page__hero-copy">
          <p>Task visibility becomes useful when it is fast, clear, and actionable.</p>
          <h2>Keep projects moving without losing ownership.</h2>
          <div className="dashboard-page__hero-pills">
            <span>{data.projects.length} Projects</span>
            <span>{data.myTasks.length} Tasks on your board</span>
            <span>{data.overdueTasks.length} Overdue items</span>
          </div>
        </div>

        {isAdmin ? (
          <form className="dashboard-page__form" onSubmit={handleCreateProject}>
            <h3>Create project</h3>
            <label>
              Project name
              <input
                name="name"
                value={formData.name}
                onChange={handleProjectChange}
                placeholder="New product launch"
                required
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleProjectChange}
                rows="4"
                placeholder="Write a short project summary"
              />
            </label>
            {formError ? <div className="dashboard-page__form-error">{formError}</div> : null}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create project"}
            </button>
          </form>
        ) : (
          <div className="dashboard-page__form dashboard-page__member-note">
            <h3>Member access</h3>
            <p>
              You can view only your assigned projects and tasks. Project
              creation and team management are available to admin only.
            </p>
          </div>
        )}
      </section>

      <section className="dashboard-page__stats">
        <StatCard label="Total Projects" value={data.summary?.totalProjects || 0} tone="brand" />
        <StatCard label="Total Tasks" value={data.summary?.totalTasks || 0} tone="accent" />
        <StatCard label="In Progress" value={data.summary?.inProgressTasks || 0} tone="warning" />
        <StatCard label="Overdue" value={data.summary?.overdueTasks || 0} tone="danger" />
      </section>

      <section className="dashboard-page__content">
        <div className="dashboard-page__panel">
          <div className="dashboard-page__section-head">
            <h2>Project Directory</h2>
            <p>Open any workspace to assign members and manage task flow.</p>
          </div>

          {data.projects.length ? (
            <div className="dashboard-page__projects">
              {data.projects.slice(0, 4).map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No projects yet"
              description={
                isAdmin
                  ? "Create your first project to start assigning work."
                  : "Projects added by your admin will appear here."
              }
            />
          )}
        </div>

        <div className="dashboard-page__stack">
          <div className="dashboard-page__mini-panel">
            <div className="dashboard-page__section-head">
              <h2>Status Split</h2>
              <p>Quick breakdown of your current workload.</p>
            </div>
            <div className="dashboard-page__status-grid">
              <div>
                <span>Todo</span>
                <strong>{data.statusCount?.todo || 0}</strong>
              </div>
              <div>
                <span>In Progress</span>
                <strong>{data.statusCount?.inProgress || 0}</strong>
              </div>
              <div>
                <span>Completed</span>
                <strong>{data.statusCount?.completed || 0}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-page__mini-panel">
            <div className="dashboard-page__section-head">
              <h2>Overdue Tasks</h2>
              <p>Items that need immediate attention.</p>
            </div>
            {data.overdueTasks.length ? (
              <TaskTable tasks={data.overdueTasks.slice(0, 5)} currentUser={user} showProject />
            ) : (
              <EmptyState
                title="Nothing overdue"
                description="Your overdue list is clear right now."
              />
            )}
          </div>
        </div>
      </section>

      {isAdmin ? (
        <section className="dashboard-page__panel">
          <div className="dashboard-page__section-head">
            <h2>Member progress</h2>
            <p>Click on a member name to view their progress status, assigned tasks, history, and overdue count.</p>
          </div>

          {data.memberProgress.length ? (
            <div className="dashboard-page__members-accordion">
              {data.memberProgress.map((member) => (
                <div
                  key={member._id}
                  className={`dashboard-page__member-item ${
                    expandedMemberId === member._id ? "dashboard-page__member-item--expanded" : ""
                  } ${member.overdue > 0 ? "dashboard-page__member-item--overdue" : ""}`}
                >
                  <div
                    className="dashboard-page__member-header"
                    onClick={() =>
                      setExpandedMemberId(expandedMemberId === member._id ? null : member._id)
                    }
                  >
                    <div className="dashboard-page__member-name">
                      <strong>{member.name}</strong>
                    </div>
                    <div className="dashboard-page__member-summary">
                      <span>{member.totalTasks} tasks</span>
                      {member.overdue > 0 && (
                        <span className="dashboard-page__overdue-badge">
                          {member.overdue} overdue
                        </span>
                      )}
                    </div>
                    <span className="dashboard-page__expand-icon">
                      {expandedMemberId === member._id ? "▼" : "▶"}
                    </span>
                  </div>

                  {expandedMemberId === member._id && (
                    <div className="dashboard-page__member-details">
                      <div className="dashboard-page__member-email">{member.email}</div>

                      <div className="dashboard-page__member-stats">
                        <div className="dashboard-page__stat-box">
                          <span className="dashboard-page__stat-label">Total Tasks</span>
                          <strong className="dashboard-page__stat-value">
                            {member.totalTasks}
                          </strong>
                        </div>
                        <div className="dashboard-page__stat-box">
                          <span className="dashboard-page__stat-label">Todo</span>
                          <strong className="dashboard-page__stat-value">{member.todo}</strong>
                        </div>
                        <div className="dashboard-page__stat-box">
                          <span className="dashboard-page__stat-label">In Progress</span>
                          <strong className="dashboard-page__stat-value">
                            {member.inProgress}
                          </strong>
                        </div>
                        <div className="dashboard-page__stat-box">
                          <span className="dashboard-page__stat-label">Completed</span>
                          <strong className="dashboard-page__stat-value">
                            {member.completed}
                          </strong>
                        </div>
                        <div
                          className={`dashboard-page__stat-box ${
                            member.overdue > 0
                              ? "dashboard-page__stat-box--danger"
                              : ""
                          }`}
                        >
                          <span className="dashboard-page__stat-label">Overdue</span>
                          <strong className="dashboard-page__stat-value">
                            {member.overdue}
                          </strong>
                        </div>
                      </div>

                      <div className="dashboard-page__tasks-history">
                        <h4>Task History</h4>
                        {member.tasks && member.tasks.length ? (
                          <table className="dashboard-page__tasks-table">
                            <thead>
                              <tr>
                                <th>Task</th>
                                <th>Project</th>
                                <th>Due Date</th>
                                <th>Completed Date</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {member.tasks.map((task) => (
                                <tr key={task._id}>
                                  <td>{task.title}</td>
                                  <td>{task.project?.name || "-"}</td>
                                  <td>{formatDate(task.dueDate)}</td>
                                  <td>
                                    {task.completedAt
                                      ? formatDate(task.completedAt)
                                      : "-"}
                                  </td>
                                  <td>
                                    <span
                                      className={`dashboard-page__status-badge dashboard-page__status-${task.status}`}
                                    >
                                      {task.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="dashboard-page__no-tasks">No tasks assigned</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No member task progress yet"
              description="Assign tasks to team members and their progress will appear here."
            />
          )}
        </section>
      ) : null}

      <section className="dashboard-page__panel">
        <div className="dashboard-page__section-head">
          <h2>{isAdmin ? "All Tasks" : "My Tasks"}</h2>
          <p>
            {isAdmin
              ? "Track every task created across your projects."
              : "Update progress quickly from your personal work queue."}
          </p>
        </div>

        {data.myTasks.length ? (
          <TaskTable tasks={data.myTasks} currentUser={user} showProject />
        ) : (
          <EmptyState
            title={isAdmin ? "No project tasks yet" : "No assigned tasks"}
            description={
              isAdmin
                ? "Create tasks inside a project to start tracking delivery."
                : "Once tasks are assigned to you, they will appear here."
            }
          />
        )}
      </section>
    </div>
  );
}
