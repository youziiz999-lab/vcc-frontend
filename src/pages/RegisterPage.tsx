import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authAPI } from '../hooks/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError('两次密码输入不一致')
      return
    }

    if (password.length < 8) {
      setError('密码至少需要8位')
      return
    }

    setLoading(true)

    try {
      const { data } = await authAPI.register({ name, email, password })
      if (data.success) {
        setSuccess('注册成功！正在跳转到登录页...')
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060607] via-[#0a0a0c] to-[#060607] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          <h1 className="text-2xl font-bold text-white tracking-tight">创建账号</h1>
          <p className="text-[#8e8574] text-sm mt-1">注册华美国际信用社VIP账户</p>
        </div>

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
              <label htmlFor="name" className="block text-xs font-medium text-[#cbd5e1] mb-2">姓名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e8574]" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#121214] border border-[#2c2923] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                  placeholder="请输入姓名"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#cbd5e1] mb-2">邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e8574]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#121214] border border-[#2c2923] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                  placeholder="请输入邮箱"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#cbd5e1] mb-2">登录密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e8574]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#121214] border border-[#2c2923] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                  placeholder="至少8位密码"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-[#cbd5e1] mb-2">确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e8574]" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#121214] border border-[#2c2923] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                  placeholder="再次输入密码"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#f6e0a4] text-[#060607] font-bold text-sm uppercase tracking-wider rounded-lg hover:from-[#f6e0a4] hover:to-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  注册中...
                </>
              ) : (
                '创建账号'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2c2925] text-center">
            <p className="text-xs text-[#64748b]">
              已有账号？{' '}
              <Link to="/login" className="text-[#d4af37] hover:text-[#f6e0a4] transition-colors">返回登录</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
