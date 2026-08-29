import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://ireserve-server-9xs5.onrender.com/api/';
const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');
const baseURL = normalizedBaseUrl === 'https://ireserve-server-9xs5.onrender.com'
  ? `${normalizedBaseUrl}/api/`
  : `${normalizedBaseUrl}/`;

const API = axios.create({
  baseURL,
  withCredentials: true, // Crucial for HTTP-only cookie authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;