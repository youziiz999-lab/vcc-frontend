import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { AuthResponse, APIError } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<APIError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) =>
    api.post<AuthResponse>('/auth/login', credentials),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get<AuthResponse>('/auth/me'),
  
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  refresh: () => api.post<AuthResponse>('/auth/refresh'),
  
  enable2FA: () => api.post('/auth/2fa/enable'),
  verify2FA: (code: string) => api.post('/auth/2fa/verify', { code }),
  disable2FA: (code: string) => api.post('/auth/2fa/disable', { code })
}

export const customerAPI = {
  getState: () => api.get('/customer/state'),
  
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data: Partial<any>) => api.put('/customer/profile', data),
  
  getCards: () => api.get('/customer/cards'),
  getCard: (id: string) => api.get(`/customer/cards/${id}`),
  createCard: (data: { bin: string; limit: number; nickname?: string; label?: string }) =>
    api.post('/customer/cards', data),
  cardAction: (cardId: string, action: string, data?: any) =>
    api.post(`/customer/cards/${cardId}/action/${action}`, data),
  
  getTransactions: (params?: { page?: number; limit?: number }) =>
    api.get('/customer/transactions', { params }),
  
  getKYC: () => api.get('/customer/kyc'),
  submitKYC: (data: FormData) => api.post('/customer/kyc', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  get2FA: () => api.get('/customer/2fa'),
  
  get3DSPool: () => api.get('/customer/3ds-pool'),
  
  recharge: (data: { amount: number; method: string }) =>
    api.post('/customer/wallet/recharge', data),
  confirmRecharge: (data: { paymentId: string; txHash: string }) =>
    api.post('/customer/wallet/recharge/confirm', data)
}

export const adminAPI = {
  getState: () => api.get('/admin/state'),
  getConfig: () => api.get('/admin/config'),
  updateConfig: (data: any) => api.put('/admin/config', data),
  
  getBins: () => api.get('/admin/bins'),
  createBin: (data: any) => api.post('/admin/bins', data),
  updateBin: (bin: string, data: any) => api.put(`/admin/bins/${bin}`, data),
  deleteBin: (bin: string) => api.delete(`/admin/bins/${bin}`),
  toggleBinStatus: (bin: string, status: 'active' | 'disabled') =>
    api.patch(`/admin/bins/${bin}/status`, { status }),
  
  createTransaction: (data: any) => api.post('/admin/transactions', data),
  batchTransactions: (transactions: any[]) =>
    api.post('/admin/transactions/batch', { transactions }),
  
  activateCard: (id: string, data: { number: string; cvv: string; expiry: string; billingAddress?: string }) =>
    api.post(`/admin/cards/${id}/activate`, data),
  adminCardAction: (cardId: string, action: string, data?: any) =>
    api.post(`/admin/cards/${cardId}/action/${action}`, data),
  retryAmzCard: (cardId: string) => api.post(`/admin/cards/${cardId}/retry-amz`),
  
  getReconciliation: () => api.get('/admin/reconciliation'),
  reviewReconciliation: (id: string, status: 'approved' | 'rejected', notes?: string) =>
    api.post(`/admin/reconciliation/${id}/review`, { status, notes }),
  
  reviewKYC: (userId: string, status: 'approved' | 'rejected', feedback?: string) =>
    api.post(`/admin/kyc/${userId}/review`, { status, feedback }),
  
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/admin/users', { params }),
  updateUser: (userId: string, data: any) => api.put(`/admin/users/${userId}`, data),
  
  getCards: (params?: { page?: number; limit?: number; status?: string; userId?: string }) =>
    api.get('/admin/cards', { params }),
  
  getTransactions: (params?: { page?: number; limit?: number; status?: string; userId?: string; cardId?: string }) =>
    api.get('/admin/transactions', { params })
}