import { useEffect, useMemo, useState } from "react";
import { fetchMyTasks, updateTaskStatus } from "../api/taskService";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import PageHeader from "../components/PageHeader";
import TaskTable from "../components/TaskTable";
import useAuth from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import "./MyTasksPage.css";

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setError("");
      const response = await fetchMyTasks();
      setTasks(response.tasks || []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter((task) => task.status === statusFilter);
  }, [statusFilter, tasks]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, { status });
      await loadTasks();
    } catch (statusError) {
      setError(getApiErrorMessage(statusError));
    }
  };

  if (isLoading) {
    return <LoadingScreen label="Loading your tasks..." />;
  }

  return (
    <div className="my-tasks-page">
      <PageHeader
        eyebrow="My Tasks"
        title="Personal work queue"
        description="Focus on your assigned tasks, update progress quickly, and keep deadlines visible."
        actions={
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        }
      />

      {error ? <div className="my-tasks-page__error">{error}</div> : null}

      <section className="my-tasks-page__panel">
        {filteredTasks.length ? (
          <TaskTable
            tasks={filteredTasks}
            currentUser={user}
            showProject
            onStatusChange={handleStatusChange}
          />
        ) : (
          <EmptyState
            title="No matching tasks"
            description="Try another filter or wait for new assignments."
          />
        )}
      </section>
    </div>
  );
}
