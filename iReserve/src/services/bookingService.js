import API from './api';

export const createBooking = async (bookingData) => {
  const response = await API.post('/bookings', bookingData);
  return response.data;
};

export const getUserBookings = async () => {
  const response = await API.get('/bookings/my-bookings');
  return response.data;
};

export const initializePaystackPayment = async (bookingId) => {
  const response = await API.post('/payments/initialize', { bookingId });
  return response.data;
};

export const downloadBookingPdf = async (bookingId) => {
  const response = await API.get(`/exports/pdf/${bookingId}`, { responseType: 'blob' });
  return response.data;
};

export const downloadBookingsCsv = async () => {
  const response = await API.get('/exports/csv', { responseType: 'blob' });
  return response.data;
};