
// utils/auth.js
import { jwtDecode } from 'jwt-decode';


export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
   const decoded = jwtDecode(token);

    return decoded.role;
  } catch (err) {
    return null;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};
