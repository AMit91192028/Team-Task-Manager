import { useEffect, useState } from "react";
import { fetchMemberProgress } from "../api/dashboardService";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import PageHeader from "../components/PageHeader";
import useAuth from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate } from "../utils/formatters";
import "./OverdueMembersPage.css";

export default function OverdueMembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMembers = async () => {
    try {
      setError("");
      const response = await fetchMemberProgress();
      const overdueMembers = response.members.filter((member) => member.overdue > 0);
      setMembers(overdueMembers);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  if (isLoading) {
    return <LoadingScreen label="Loading overdue members..." />;
  }

  return (
    <div className="overdue-members-page">
      <PageHeader
        eyebrow="Member tracking"
        title="Overdue Members"
        description="Team members with tasks that have passed their due date. Review and follow up on delayed deliverables."
      />

      {error ? <div className="overdue-members-page__error">{error}</div> : null}

      {members.length ? (
        <div className="overdue-members-page__layout">
          {members.map((member) => (
            <article key={member._id} className="overdue-members-page__member-panel">
              <div className="overdue-members-page__member-header">
                <div>
                  <h2>{member.name}</h2>
                  <p>{member.email}</p>
                </div>
                <div className="overdue-members-page__member-stats">
                  <span className="overdue-members-page__stat-item">
                    <span className="overdue-members-page__stat-label">Total Tasks</span>
                    <strong>{member.totalTasks}</strong>
                  </span>
                  <span className="overdue-members-page__stat-item">
                    <span className="overdue-members-page__stat-label">Overdue</span>
                    <strong className="overdue-members-page__stat-danger">{member.overdue}</strong>
                  </span>
                  <span className="overdue-members-page__stat-item">
                    <span className="overdue-members-page__stat-label">Completed</span>
                    <strong>{member.completed}</strong>
                  </span>
                </div>
              </div>

              <div className="overdue-members-page__member-metrics">
                <div className="overdue-members-page__metric">
                  <span>Todo</span>
                  <strong>{member.todo}</strong>
                </div>
                <div className="overdue-members-page__metric">
                  <span>In progress</span>
                  <strong>{member.inProgress}</strong>
                </div>
                <div className="overdue-members-page__metric">
                  <span>Completed</span>
                  <strong>{member.completed}</strong>
                </div>
                <div className="overdue-members-page__metric overdue-members-page__metric--danger">
                  <span>Overdue</span>
                  <strong>{member.overdue}</strong>
                </div>
              </div>

              <div className="overdue-members-page__tasks">
                <h3>Task History</h3>
                <div className="overdue-members-page__task-list">
                  {member.tasks.map((task) => (
                    <div key={task._id} className={`overdue-members-page__task-item overdue-members-page__task-item--${task.status}`}>
                      <div className="overdue-members-page__task-content">
                        <strong>{task.title}</strong>
                        <small>{task.project?.name || "No project"}</small>
                      </div>
                      <div className="overdue-members-page__task-dates">
                        <small>Due {formatDate(task.dueDate)}</small>
                        {task.completedAt ? (
                          <small>Completed {formatDate(task.completedAt)}</small>
                        ) : null}
                      </div>
                      <span className={`overdue-members-page__task-status overdue-members-page__task-status--${task.status}`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No overdue members"
          description="Great news! All team members are on track with their task deadlines."
        />
      )}
    </div>
  );
}
