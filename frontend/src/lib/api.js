const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiRequest(endpoint, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {}
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get: (url) => apiRequest(url),
  post: (url, data) => apiRequest(url, { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  put: (url, data) => apiRequest(url, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (url, data) => apiRequest(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url) => apiRequest(url, { method: 'DELETE' })
};

export const adminLogin = (login, password) => api.post('/auth/login', { login, password });
export const adminLogout = () => api.post('/auth/logout', {});
export const getCurrentAdmin = () => api.get('/auth/me');

export const customerRegister = (name, email, password) => api.post('/customer-auth/register', { name, email, password });
export const customerLogin = (email, password) => api.post('/customer-auth/login', { email, password });
export const getCurrentCustomer = () => api.get('/customer-auth/me');
export const customerLogout = () => api.post('/customer-auth/logout', {});
