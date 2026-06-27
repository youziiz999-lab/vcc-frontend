export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  walletBalance: number
  vipLevel: number
  identityClass: 'sub_account' | 'agent' | 'standalone' | null
  upstreamName: string
  monthlySpend: number
}

export interface Card {
  id: string
  number: string
  cvv: string
  expiry: string
  brand: 'Visa' | 'Mastercard'
  bin: string
  nickname: string
  balance: number
  limit: number
  status: 'active' | 'pending' | 'frozen' | 'cancelled'
  label: string
  billingAddress: string
  issuedAt?: string
  routing_type?: 'manual' | 'auto'
}

export interface Transaction {
  id: string
  cardId: string | null
  cardLast4?: string
  cardNickname?: string
  merchant: string
  amount: number
  currency: string
  status: 'success' | 'pending' | 'failed'
  timestamp: string
  description: string
}

export interface KYC {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected'
  documentType?: string
  fileName?: string
  legalName?: string
  documentNumber?: string
  birthDate?: string
  nationality?: string
  residentialAddress?: string
  files?: Record<string, string>
  submittedAt?: string
  feedback?: string
}

export interface TwoFactor {
  enabled: boolean
  secret?: string
  qrUrl?: string
}

export interface AppState {
  profile: User
  cards: Card[]
  transactions: Transaction[]
  kyc: KYC
  twoFactor: TwoFactor
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: User
  error?: string
}

export interface APIError {
  error: string
  code?: string
}