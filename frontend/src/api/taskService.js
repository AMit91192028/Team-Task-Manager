import axiosClient from "./axiosClient";

export const fetchTasks = async () => {
  const { data } = await axiosClient.get("/tasks");
  return data;
};

export const fetchTaskById = async (taskId) => {
  const { data } = await axiosClient.get(`/tasks/${taskId}`);
  return data;
};

export const fetchMyTasks = async () => {
  const { data } = await axiosClient.get("/tasks/my-tasks");
  return data;
};

export const fetchTasksByProject = async (projectId) => {
  const { data } = await axiosClient.get(`/tasks/project/${projectId}`);
  return data;
};

export const createTask = async (payload) => {
  const { data } = await axiosClient.post("/tasks", payload);
  return data;
};

export const updateTask = async (taskId, payload) => {
  const { data } = await axiosClient.put(`/tasks/${taskId}`, payload);
  return data;
};

export const deleteTask = async (taskId) => {
  const { data } = await axiosClient.delete(`/tasks/${taskId}`);
  return data;
};

export const updateTaskStatus = async (taskId, payload) => {
  const { data } = await axiosClient.patch(`/tasks/${taskId}/status`, payload);
  return data;
};
