import API from './api';

export const getSupportedBanks = async () => {
  const response = await API.get('/hosts/banks');
  return response.data;
};

export const setupHostPayouts = async (payload) => {
  const response = await API.post('/hosts/setup-payouts', payload);
  return response.data;
};
