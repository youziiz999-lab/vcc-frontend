import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      await login(email, password, rememberMe)
      setSuccess('登录成功，正在跳转...')
      setTimeout(() => navigate('/dashboard'), 800)
    } catch (err: any) {
      setError(err.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setEmail('demo@visacard.com')
    setPassword('demo123456')
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await login('demo@visacard.com', 'demo123456', true)
      setSuccess('演示账号登录成功，正在跳转...')
      setTimeout(() => navigate('/dashboard'), 800)
    } catch (err: any) {
      setError(err.message || '演示账号登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060607] via-[#0a0a0c] to-[#060607] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <svg viewBox="0 0 100 100" className="w-20 h-20" xmlns="http://www.w3.org/2000/svg">
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
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">华美国际信用社</h1>
          <p className="text-[#8e8574] text-sm mt-1">华美银行直辖官方子公司 · VIP 运营商安全账号</p>
        </div>

        {/* Card */}
        <div className="bg-[#0b0b0d] border border-[#1f1d1a] rounded-2xl p-8 shadow-2xl shadow-black/50">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#cbd5e1] mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e8574]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#121214] border border-[#2c2923] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                  placeholder="请输入注册邮箱"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#cbd5e1] mb-2">
                登录密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e8574]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#121214] border border-[#2c2923] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                  placeholder="请输入密码"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8574] hover:text-white transition-colors"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#d4af37] border-[#2c2923] bg-[#121214] rounded focus:ring-[#d4af37]"
                />
                <span className="text-xs text-[#8e8574]">记住我 (30天免登)</span>
              </label>
              <a href="/forgot-password" className="text-xs text-[#d4af37] hover:text-[#f6e0a4] transition-colors">
                忘记密码？
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#f6e0a4] text-[#060607] font-bold text-sm uppercase tracking-wider rounded-lg hover:from-[#f6e0a4] hover:to-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  登录中...
                </>
              ) : (
                '安全登录'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2c2925]">
            <p className="text-xs text-[#64748b] text-center mb-4">或使用演示账号快速体验</p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 bg-[#121214] border border-[#2c2923] rounded-lg text-white font-medium text-sm hover:border-[#d4af37]/50 hover:bg-[#1a1a1e] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              演示账号登录 (demo@visacard.com)
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-[#475569] font-mono tracking-wider uppercase">
            PCI DSS 合规审计认证 · Visa BIN联名安全认证
          </p>
          <p className="text-[10px] text-[#475569] font-mono tracking-wider uppercase mt-1">
            © 2026 虚拟信用卡系统与共管清算账本
          </p>
        </div>
      </div>
    </div>
  )
}