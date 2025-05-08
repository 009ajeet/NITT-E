import axios from "axios";
import API_BASE_URL from '../config';

// Register a new user
export const registerUser = async (email, password, role) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, { email, password, role });
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// Get courses (Protected Route)
export const getCourses = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_BASE_URL}/api/courses`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};
