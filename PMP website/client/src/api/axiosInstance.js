import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Paths where a 401 must NOT trigger an auto-redirect to /login, because they
// are intentionally public or are the login surface itself.
const PUBLIC_PATHS = ['/', '/login', '/register'];
const isPublicPath = (pathname) =>
  PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/verify/');

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isPublicPath(window.location.pathname)) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
