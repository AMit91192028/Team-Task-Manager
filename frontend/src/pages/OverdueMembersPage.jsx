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
  const [expandedMemberId, setExpandedMemberId] = useState(null);

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
        description="Team members with tasks that have passed their due date. Click a member name to see their overdue tasks."
      />

      {error ? <div className="overdue-members-page__error">{error}</div> : null}

      {members.length ? (
        <div className="overdue-members-page__accordion">
          {members.map((member) => {
            const overdueTasks = member.tasks.filter(
              (task) => new Date(task.dueDate) < new Date() && task.status !== "completed"
            );

            return (
              <div
                key={member._id}
                className={`overdue-members-page__member-item ${
                  expandedMemberId === member._id ? "overdue-members-page__member-item--expanded" : ""
                }`}
              >
                <div
                  className="overdue-members-page__member-header"
                  onClick={() =>
                    setExpandedMemberId(expandedMemberId === member._id ? null : member._id)
                  }
                >
                  <div className="overdue-members-page__member-info">
                    <strong>{member.name}</strong>
                  </div>
                  <div className="overdue-members-page__member-summary">
                    <span>{member.overdue} overdue</span>
                    <span>{member.totalTasks} tasks</span>
                  </div>
                  <span className="overdue-members-page__expand-icon">
                    {expandedMemberId === member._id ? "▼" : "▶"}
                  </span>
                </div>

                {expandedMemberId === member._id && (
                  <div className="overdue-members-page__member-details">
                    <div className="overdue-members-page__member-email">{member.email}</div>

                    <div className="overdue-members-page__overdue-tasks">
                      <h4>Overdue Tasks</h4>
                      {overdueTasks.length ? (
                        <table className="overdue-members-page__tasks-table">
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
                            {overdueTasks.map((task) => (
                              <tr key={task._id}>
                                <td>{task.title}</td>
                                <td>{task.project?.name || "-"}</td>
                                <td>{formatDate(task.dueDate)}</td>
                                <td>
                                  {task.completedAt ? formatDate(task.completedAt) : "-"}
                                </td>
                                <td>
                                  <span
                                    className={`overdue-members-page__status-badge overdue-members-page__status-${task.status}`}
                                  >
                                    {task.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="overdue-members-page__no-tasks">
                          No overdue tasks for this member
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
