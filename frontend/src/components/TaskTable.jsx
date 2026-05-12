import { formatDate, formatStatusLabel } from "../utils/formatters";
import "./TaskTable.css";

export default function TaskTable({
  tasks,
  showProject = false,
  currentUser,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  actionTaskId
}) {
  return (
    <div className="task-table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>Task</th>
            {showProject ? <th>Project</th> : null}
            <th>Assigned To</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Completed</th>
            <th>Status</th>
            {onEditTask || onDeleteTask ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const canUpdate =
              Boolean(onStatusChange) &&
              (
                String(task.assignedTo?._id) === String(currentUser?.id) ||
                String(task.createdBy?._id) === String(currentUser?.id)
              );
            const isBusy = actionTaskId === task._id;

            return (
              <tr key={task._id}>
                <td>
                  <strong>{task.title}</strong>
                  <p>{task.description || "No description added."}</p>
                </td>
                {showProject ? <td>{task.project?.name || "-"}</td> : null}
                <td>{task.assignedTo?.name || "-"}</td>
                <td>
                  <span className={`task-pill task-pill--${task.priority}`}>
                    {task.priority}
                  </span>
                </td>
                <td>{formatDate(task.dueDate)}</td>
                <td>{task.completedAt ? formatDate(task.completedAt) : "-"}</td>
                <td>
                  {canUpdate ? (
                    <select
                      value={task.status}
                      onChange={(event) =>
                        onStatusChange?.(task._id, event.target.value)
                      }
                    >
                      <option value="todo">todo</option>
                      <option value="in-progress">in-progress</option>
                      <option value="completed">completed</option>
                    </select>
                  ) : (
                    <span className={`task-pill task-pill--status-${task.status}`}>
                      {formatStatusLabel(task.status)}
                    </span>
                  )}
                </td>
                {onEditTask || onDeleteTask ? (
                  <td>
                    <div className="task-table__actions">
                      {onEditTask ? (
                        <button
                          type="button"
                          className="task-table__action-button"
                          onClick={() => onEditTask(task)}
                          disabled={isBusy}
                        >
                          Edit
                        </button>
                      ) : null}
                      {onDeleteTask ? (
                        <button
                          type="button"
                          className="task-table__action-button task-table__action-button--danger"
                          onClick={() => onDeleteTask(task)}
                          disabled={isBusy}
                        >
                          {isBusy ? "Deleting..." : "Delete"}
                        </button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
