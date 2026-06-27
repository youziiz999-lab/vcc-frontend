import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AccountPage from './pages/AccountPage'
import RechargePage from './pages/RechargePage'
import TransactionsPage from './pages/TransactionsPage'

function ProtectedRoute() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060607] flex items-center justify-center">
        <div className="text-center">
          <svg className="w-10 h-10 text-[#d4af37] animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-[#8e8574]">验证身份中...</p>
        </div>
      </div>
    )
  }
  
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicRoute() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#060607] via-[#0a0a0c] to-[#060607] flex items-center justify-center">
        <svg className="w-10 h-10 text-[#d4af37] animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}

function Layout() {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-[#060607] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#0a0a0c] border-b border-[#1f1d1a] px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 100 100" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="92" height="92" rx="16" stroke="#E61B23" strokeWidth="8" fill="white" />
              <g fill="#E61B23">
                <rect x="16" y="34" width="6" height="12" rx="2" />
                <rect x="25" y="25" width="6" height="21" rx="2" />
                <rect x="34" y="18" width="6" height="28" rx="2" />
                <rect x="43" y="13" width="6" height="33" rx="2" />
                <rect x="54" y="16" width="12" height="6" rx="2" />
                <rect x="54" y="25" width="21" height="6" rx="2" />
                <rect x="54" y="34" width="28" height="6" rx="2" />
                <rect x="54" y="43" width="33" height="6" rx="2" />
                <rect x="34" y="84" width="12" height="6" rx="2" />
                <rect x="25" y="75" width="21" height="6" rx="2" />
                <rect x="18" y="66" width="28" height="6" rx="2" />
                <rect x="13" y="57" width="33" height="6" rx="2" />
                <rect x="84" y="54" width="6" height="12" rx="2" />
                <rect x="75" y="54" width="6" height="21" rx="2" />
                <rect x="66" y="54" width="6" height="28" rx="2" />
                <rect x="57" y="54" width="6" height="33" rx="2" />
              </g>
            </svg>
            <span className="font-bold text-white text-lg hidden sm:block">VCC 客户中心</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#8e8574] hidden md:block">
              {user?.name || 'VIP 用户'}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f6e0a4] flex items-center justify-center text-[#060607] font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#000000] border-t border-[#475569]/30 py-4 px-4 text-[11px] text-[#94a3b8]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="font-mono">© 2026 虚拟信用卡系统与共管清算账本</p>
          <div className="flex gap-4 font-mono text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> PCI DSS 合规
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Visa BIN 安全
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/recharge" element={<RechargePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
      </Route>
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}