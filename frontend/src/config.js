// API Base URL configuration
const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    console.log('Current hostname:', hostname); // Debug log

    // If we're on the deployed frontend, always use the production backend root
    if (hostname === "nitt-e-fronted.onrender.com") {
        return "https://nitt-e.onrender.com"; // REMOVED /api from here
    }

    // For local development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "http://localhost:3001"; // This should be the root of your local backend
    }

    // Default to production URL (root)
    return "https://nitt-e.onrender.com"; // REMOVED /api from here
})();

console.log('Using API URL:', API_BASE_URL); // Debug log

export default API_BASE_URL;
