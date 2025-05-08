// API Base URL configuration
const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "https://nitt-e.onrender.com";

export default API_BASE_URL;
