const ADMIN_EMAIL = 'admin@ale.com';
const ADMIN_PASSWORD = '12345';
const AUTH_KEY = 'adminAuthenticated';

export const isAuthenticated = () => {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
};

export const login = (email, password) => {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const logout = () => {
  sessionStorage.removeItem(AUTH_KEY);
};
