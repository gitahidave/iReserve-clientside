import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ireserve-server-9xs5.onrender.com/api/',
  withCredentials: true, // Crucial for HTTP-only cookie authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;