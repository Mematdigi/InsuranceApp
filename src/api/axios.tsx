import axios, { AxiosInstance } from "axios";

const API: AxiosInstance = axios.create({
  baseURL: "http://10.0.2.2:5000/",  // 10.0.2.2 = localhost for Android emulator, 5000 = port
  timeout: 10000,
});

export default API;
