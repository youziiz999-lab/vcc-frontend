import React, { useState } from 'react'
import { CreditCard, Coins, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { customerAPI } from '../hooks/api'
import { useNavigate } from 'react-router-dom'

export default function RechargePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [amount, setAmount] = useState(100)
  const [method, setMethod] = useState<'USDT' | 'USDC'>('USDT')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'paying' | 'success' | 'error'>('form')
  const [payInfo, setPayInfo] = useState<{ address: string; amount: string; qrCode?: string; expiresAt?: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const quickAmounts = [50, 100, 200, 500, 1000, 2000]

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amount < 20) {
      setError('最低充值金额 $20')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await customerAPI.recharge({ amount, method })
      if (res.data.success && res.data.payment) {
        setPayInfo(res.data.payment)
        setStep('paying')
        startCountdown(res.data.payment.expiresAt)
      } else {
        setError(res.data.error || '充值发起失败')
        setStep('error')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '充值发起失败，请重试')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const startCountdown = (expiresAt?: number) => {
    if (!expiresAt) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      if (remaining <= 0) {
        clearInterval(interval)
        setStep('error')
        setError('支付已过期，请重新发起')
      }
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setError(null)
  }

  const formatBalance = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="glass-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#d4af37]/10 rounded-xl flex items-center justify-center">
            <Coins className="w-6 h-6 text-[#d4af37]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">钱包充值</h1>
            <p className="text-[#8e8574] text-sm">当前余额: <span className="text-white font-medium">{formatBalance(user?.walletBalance || 0)} USDT</span></p>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-sm text-[#d4af37] hover:text-[#f6e0a4] flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回仪表盘
        </button>
      </div>

      {step === 'form' && (
        <div className="glass-card">
          <form onSubmit={handleRecharge} className="space-y-6">
            <div>
              <label className="block text-xs text-[#8e8574] mb-2">充值金额 (USDT)</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {quickAmounts.map(amt => (
                  <button
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-3 rounded-lg text-sm font-medium transition-all ${
                      amount === amt
                        ? 'bg-[#d4af37] text-[#060607]'
                        : 'bg-[#121214] border border-[#2c2923] text-white hover:border-[#d4af37]/50'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="20"
                max={100000}
                step="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="input-field text-xl text-center font-mono"
                placeholder="输入金额"
              />
              <p className="text-xs text-[#64748b] mt-1 text-center">最低充值 $20 · 到账通常需 1-3 个区块确认</p>
            </div>

            <div>
              <label className="block text-xs text-[#8e8574] mb-2">充值网络</label>
              <div className="grid grid-cols-2 gap-3">
                {['USDT', 'USDC'].map(m => (
                  <button
                    type="button"
                    onClick={() => setMethod(m as 'USDT' | 'USDC')}
                    className={`py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      method === m
                        ? 'bg-[#d4af37] text-[#060607] border border-[#d4af37]'
                        : 'bg-[#121214] border border-[#2c2923] text-white hover:border-[#d4af37]/50'
                    }`}
                  >
                    {m === 'USDT' ? '🔗' : '💎'} {m} (TRC-20)
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || amount < 20}
              className="w-full btn-primary py-4 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  发起充值...
                </>
              ) : (
                `立即充值 ${formatBalance(amount)}`
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-[#121214] border border-[#2c2923] rounded-xl">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#d4af37]" />
              重要提醒
            </h4>
            <ul className="text-sm text-[#8e8574] space-y-2">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#2c2923] flex-shrink-0"></span>仅支持 TRC-20 (Tron) 网络，ERC-20 转账将无法到账</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#2c2923] flex-shrink-0"></span>请务必核对充值地址，错误转账无法找回</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#2c2923] flex-shrink-0"></span>充值到账需区块链确认，通常 1-5 分钟内完成</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#2c2923] flex-shrink-0"></span>单笔最低 $20，单日无上限</li>
            </ul>
          </div>
        </div>
      )}

      {step === 'paying' && payInfo && (
        <div className="glass-card text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-amber-500/10 rounded-full flex items-center justify-center">
            <Coins className="w-10 h-10 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">等待支付确认</h2>
          <p className="text-[#8e8574] mb-6">请使用钱包向下方地址转账 <span className="font-mono text-white">{payInfo.amount} {method}</span></p>

          <div className="space-y-4 mb-6">
            <div className="bg-[#121214] border border-[#2c2923] rounded-xl p-4 text-left">
              <p className="text-xs text-[#64748b] mb-1">充值地址 (TRC-20)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm text-white break-all bg-[#0a0a0c] px-3 py-2 rounded border border-[#2c2923}">{payInfo.address}</code>
                <button
                  onClick={() => copyToClipboard(payInfo.address)}
                  className="btn-secondary px-3 py-2"
                >
                  复制
                </button>
              </div>
            </div>

            {payInfo.qrCode && (
              <div>
                <p className="text-xs text-[#64748b] mb-2">或扫描二维码支付</p>
                <img src={payInfo.qrCode} alt="Payment QR Code" className="w-48 h-48 mx-auto bg-white p-2 rounded" />
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-[#8e8574]">支付倒计时: <span className="font-mono text-white text-lg" id="countdown">--:--</span></p>
            </div>
          </div>

          <button
            onClick={() => { setStep('form'); setPayInfo(null); setError(null); }}
            className="btn-secondary w-full md:w-auto"
          >
            取消充值
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="glass-card text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">充值成功！</h2>
          <p className="text-[#8e8574] mb-6">金额 <span className="font-mono text-white">{formatBalance(amount)}</span> 已到账</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            返回仪表盘
          </button>
        </div>
      )}

      {step === 'error' && (
        <div className="glass-card text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">充值失败</h2>
          <p className="text-[#8e8574] mb-6">{error || '未知错误，请重试'}</p>
          <button onClick={() => { setStep('form'); setError(null); }} className="btn-primary">
            重新充值
          </button>
        </div>
      )}
    </div>
  )
}