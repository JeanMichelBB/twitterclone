// export const apiUrl = 'https://xapi.sacenpapier.org';
export const apiUrl = import.meta.env.VITE_API_URL

export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const handleUnauthorized = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

/** Drop-in replacement for fetch() that auto-logouts on 401/403 */
export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, options);
  if (response.status === 401 || response.status === 403) {
    handleUnauthorized();
  }
  return response;
};
