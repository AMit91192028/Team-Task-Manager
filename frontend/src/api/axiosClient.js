import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosClient;
