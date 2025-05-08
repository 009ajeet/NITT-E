// API Base URL configuration
const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "http://localhost:3001";
    } else if (hostname === "nitt-e-fronted.onrender.com") {
        return "https://nitt-e.onrender.com";
    } else {
        return "https://nitt-e.onrender.com"; // Default to production URL
    }
})();

export default API_BASE_URL;
