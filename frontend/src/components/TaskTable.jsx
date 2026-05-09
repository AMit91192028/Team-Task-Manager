import { formatDate, formatStatusLabel } from "../utils/formatters";
import "./TaskTable.css";

export default function TaskTable({
  tasks,
  showProject = false,
  currentUser,
  onStatusChange
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
            <th>Status</th>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
