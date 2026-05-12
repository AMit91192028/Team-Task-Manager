import axiosClient from "./axiosClient";

export const fetchDashboardSummary = async () => {
  const { data } = await axiosClient.get("/dashboard/summary");
  return data;
};

export const fetchOverdueTasks = async () => {
  const { data } = await axiosClient.get("/dashboard/overdue");
  return data;
};

export const fetchTaskStatusCount = async () => {
  const { data } = await axiosClient.get("/dashboard/task-status");
  return data;
};

export const fetchMemberProgress = async () => {
  const { data } = await axiosClient.get("/dashboard/member-progress");
  return data;
};
