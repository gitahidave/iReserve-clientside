import API from './api';

export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await API.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await API.post('/auth/reset-password', { token, password });
  return response.data;
};

export const logoutUser = async () => {
  const response = await API.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};