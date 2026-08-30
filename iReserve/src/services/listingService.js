import API from './api';

export const getListings = async (params = {}) => {
  const response = await API.get('/listings', { params });
  return response.data;
};

export const getListingById = async (id) => {
  const response = await API.get(`/listings/${id}`);
  return response.data;
};

export const uploadListingImages = async (formData) => {
  const response = await API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createListing = async (listingData) => {
  const response = await API.post('/listings', listingData);
  return response.data;
};

export const updateListing = async (id, listingData) => {
  const response = await API.put(`/listings/${id}`, listingData);
  return response.data;
};

export const deleteListing = async (id) => {
  const response = await API.delete(`/listings/${id}`);
  return response.data;
};