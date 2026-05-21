import api from './axiosInstance'

// --- Inventory API ---
export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getLowStock: () => api.get('/inventory/low-stock'),
  add: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  remove: (id) => api.delete(`/inventory/${id}`),
  removeAll: () => api.delete('/inventory/delete-all'),
  notifySupplier: (id, email, qty) => api.post(`/inventory/${id}/notify-supplier`, { overrideEmail: email, overrideQuantity: qty }),
  predictGST: (name) => api.post('/inventory/predict-gst', { name }),
  askAI: (message) => api.post('/chat', { message })
}

// --- Supplier API ---
export const supplierApi = {
  getAll: () => api.get('/suppliers'),
}

// --- Billing API ---
export const billingApi = {
  getAll: () => api.get('/billing'),
  create: (data) => api.post('/billing', data)
}

// --- Notification API ---
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (ids) => api.post('/notifications/read', { ids })
}

// --- Chat API ---
export const chatApi = {
  send: (message) => api.post('/chat', { message }),
  getHistory: () => api.get('/chat/history'),
  getReports: (days = 7) => api.get(`/chat/reports?days=${days}`),
}

// --- Khata API ---
export const khataApi = {
  getCustomers: () => api.get('/khata/customers'),
  addCustomer: (data) => api.post('/khata/customers', data),
  getCustomer: (id) => api.get(`/khata/customers/${id}`),
  addTransaction: (data) => api.post('/khata/transactions', data),
  getTransactions: (customerId) => api.get(`/khata/transactions/${customerId}`),
}

// --- Auth API ---
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

