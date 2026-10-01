import API from './api';

export const getMyNotifications = async () => {
  const response = await API.get('/notifications/my-notifications');
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await API.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await API.patch('/notifications/read-all');
  return response.data;
};
