import axiosClient from "./axiosClient";

export const fetchProjects = async () => {
  const { data } = await axiosClient.get("/projects");
  return data;
};

export const fetchProjectById = async (projectId) => {
  const { data } = await axiosClient.get(`/projects/${projectId}`);
  return data;
};

export const createProject = async (payload) => {
  const { data } = await axiosClient.post("/projects", payload);
  return data;
};

export const updateProject = async (projectId, payload) => {
  const { data } = await axiosClient.put(`/projects/${projectId}`, payload);
  return data;
};

export const deleteProject = async (projectId) => {
  const { data } = await axiosClient.delete(`/projects/${projectId}`);
  return data;
};

export const addMemberToProject = async (projectId, payload) => {
  const { data } = await axiosClient.post(`/projects/${projectId}/members`, payload);
  return data;
};

export const fetchProjectMembers = async (projectId) => {
  const { data } = await axiosClient.get(`/projects/${projectId}/members`);
  return data;
};

export const removeMemberFromProject = async (projectId, userId) => {
  const { data } = await axiosClient.delete(`/projects/${projectId}/members/${userId}`);
  return data;
};
