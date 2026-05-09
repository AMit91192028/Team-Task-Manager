import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://team-task-manager-52nx.onrender.com/api",
  withCredentials: true
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosClient;
