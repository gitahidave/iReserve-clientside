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