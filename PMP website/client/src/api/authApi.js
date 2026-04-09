import api from './axiosInstance';

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.put('/auth/change-password', data);
export const verifyEmail = (code) => api.post('/auth/verify-email', { code });
export const resendVerification = () => api.post('/auth/resend-verification');
