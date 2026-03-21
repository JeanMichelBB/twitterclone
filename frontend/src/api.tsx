// export const apiUrl = 'https://xapi.sacenpapier.org';
export const apiUrl = import.meta.env.VITE_API_URL

export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};