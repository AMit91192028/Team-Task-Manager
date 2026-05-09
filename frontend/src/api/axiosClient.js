import axios from "axios";

const baseURL = "https://team-task-manager-52nx.onrender.com/api";
const axiosClient = axios.create({
  baseURL,
  withCredentials: true
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosClient;
