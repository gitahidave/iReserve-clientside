import axios from 'axios';

const defaultBaseUrl = import.meta.env.DEV
  ? '/api/'
  : 'https://ireserve-server-9xs5.onrender.com/api/';
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultBaseUrl;
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