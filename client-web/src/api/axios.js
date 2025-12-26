import axios from "axios";

const BASE_URL = "https://YOUR-APP-NAME.onrender.com/api/v1";
const API = axios.create({
  // baseURL: 'http://localhost:5000/api/v1',
  baseURL: BASE_URL,
});

// Automatically add Token to headers if it exists
API.interceptors.request.use((req) => {
  if (localStorage.getItem("token")) {
    req.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  }
  return req;
});

export default API;
