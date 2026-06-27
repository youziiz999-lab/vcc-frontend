import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, User, LogOut, Coins, Plus, RefreshCw, ShieldCheck, ExternalLink, ChevronRight, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { customerAPI } from '../hooks/api'
import type { Card, Transaction } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateCard, setShowCreateCard] = useState(false)
  const [newCard, setNewCard] = useState({ bin: '', limit: 100, nickname: '', label: 'General' })
  const [creating, setCreating] = useState(false)
  const [bins, setBins] = useState<Array<{bin: string; name: string; network: string}>>([])

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [stateRes, binsRes] = await Promise.all([
        customerAPI.getState(),
        customerAPI.get3DSPool().catch(() => ({ data: { items: [] } }))
      ])
      setCards(stateRes.data.cards || [])
      setTransactions(stateRes.data.transactions || [])
      // bins from 3ds pool or config
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCard.bin || !newCard.limit) return
    setCreating(true)
    try {
      await customerAPI.createCard({
        bin: newCard.bin,
        limit: newCard.limit,
        nickname: newCard.nickname,
        label: newCard.label
      })
      setShowCreateCard(false)
      setNewCard({ bin: '', limit: 100, nickname: '', label: 'General' })
      fetchData(true)
    } catch (err) {
      console.error('Create card failed:', err)
      alert('开卡失败，请重试')
    } finally {
      setCreating(false)
    }
  }

  const handleCardAction = async (cardId: string, action: string) => {
    try {
      await customerAPI.cardAction(cardId, action)
      fetchData(true)
    } catch (err) {
      console.error('Card action failed:', err)
      alert('操作失败')
    }
  }

  const formatBalance = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)

  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-[#d4af37] animate-spin mx-auto mb-3" />
          <p className="text-[#8e8574]">正在同步账户数据...</p>
        </div>
      </div>
    )
  }

  const activeCards = cards.filter(c => c.status === 'active')
  const pendingCards = cards.filter(c => c.status === 'pending')
  const totalBalance = activeCards.reduce((sum, c) => sum + c.balance, 0)
  const totalLimit = activeCards.reduce((sum, c) => sum + c.limit, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="glass-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">欢迎回来，{user?.name || 'VIP 用户'}</h1>
            <p className="text-[#8e8574] text-sm mt-1">查看您的虚拟卡片、余额与交易记录</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#d4af37]' : ''}`} />
              刷新
            </button>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="btn-secondary flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8e8574] text-xs uppercase tracking-wider font-mono">主钱包余额</p>
              <p className="text-3xl font-bold text-white mt-1">{formatBalance(user?.walletBalance || 0)}</p>
              <p className="text-[#d4af37] text-xs font-medium mt-1">USDT</p>
            </div>
            <div className="w-16 h-16 bg-[#d4af37]/10 rounded-xl flex items-center justify-center">
              <Coins className="w-8 h-8 text-[#d4af37]" />
            </div>
          </div>
          <Link to="/recharge" className="mt-4 block text-center btn-primary text-sm">
            快捷充值
          </Link>
        </div>
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8e8574] text-xs uppercase tracking-wider font-mono">可用额度总计</p>
              <p className="text-3xl font-bold text-white mt-1">{formatBalance(totalLimit)}</p>
              <p className="text-[#8e8574] text-xs mt-1">{activeCards.length} 张激活卡片</p>
            </div>
            <div className="w-16 h-16 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8e8574] text-xs uppercase tracking-wider font-mono">本月消费</p>
              <p className="text-3xl font-bold text-white mt-1">{formatBalance(user?.monthlySpend || 0)}</p>
              <p className="text-[#8e8574] text-xs mt-1">VIP 等级: Lv.{user?.vipLevel || 1}</p>
            </div>
            <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#d4af37]" />
            我的虚拟卡片
          </h2>
          <button
            onClick={() => setShowCreateCard(true)}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            申请新卡
          </button>
        </div>

        {activeCards.length === 0 && pendingCards.length === 0 ? (
          <div className="text-center py-12 text-[#64748b]">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-[#2c2923]" />
            <p className="text-lg font-medium text-[#8e8574] mb-2">暂无虚拟卡片</p>
            <p className="text-sm mb-4">申请您的第一张高级虚拟信用卡，享受全球支付自由</p>
            <button
              onClick={() => setShowCreateCard(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              立即申请
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCards.map(card => (
              <div key={card.id} className="bg-[#121214] border border-[#2c2923] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{card.nickname || 'Pending Card'}</p>
                      <p className="text-xs text-[#8e8574]">BIN: {card.bin} · {card.brand} · {card.label}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                    审核中
                  </span>
                </div>
              </div>
            ))}
            {activeCards.map(card => (
              <div key={card.id} className="bg-[#121214] border border-[#2c2923] rounded-xl p-4 hover:border-[#d4af37]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-gradient-to-r from-[#d4af37] to-[#f6e0a4] rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-[#060607]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{card.nickname}</p>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                          {card.status === 'active' ? '激活' : card.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#8e8574] font-mono tracking-wider">
                        •••• •••• •••• {card.number.slice(-4)} · {card.brand} · {card.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-[#8e8574]">可用余额</p>
                      <p className="font-semibold text-white">{formatBalance(card.balance)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#8e8574]">额度上限</p>
                      <p className="font-semibold text-white">{formatBalance(card.limit)}</p>
                    </div>
                    <select
                      value={card.status}
                      onChange={(e) => handleCardAction(card.id, e.target.value)}
                      className="bg-[#1a1a1e] border border-[#2c2923] text-white text-sm px-3 py-1.5 rounded-lg focus:border-[#d4af37] focus:outline-none"
                    >
                      <option value="active">激活</option>
                      <option value="frozen">冻结</option>
                      <option value="cancelled">注销</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#2c2925] flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-[#0a0a0c] border border-[#2c2923] rounded-lg text-xs text-[#8e8574]">
                    有效期: {card.expiry}
                  </span>
                  <span className="px-3 py-1 bg-[#0a0a0c] border border-[#2c2923] rounded-lg text-xs text-[#8e8574]">
                    CVV: {card.cvv}
                  </span>
                  <span className="px-3 py-1 bg-[#0a0a0c] border border-[#2c2923] rounded-lg text-xs text-[#8e8574]">
                    申请ID: {card.id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-[#d4af37]" />
            最近交易记录
          </h2>
          <Link to="/transactions" className="text-sm text-[#d4af37] hover:text-[#f6e0a4] flex items-center gap-1">
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-[#64748b]">
            <ExternalLink className="w-12 h-12 mx-auto mb-3 text-[#2c2923]" />
            <p className="text-sm">暂无交易记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#64748b] border-b border-[#2c2925]">
                  <th className="pb-2 font-medium">时间</th>
                  <th className="pb-2 font-medium">商户/描述</th>
                  <th className="pb-2 font-medium text-right">金额</th>
                  <th className="pb-2 font-medium text-right">状态</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map(tx => (
                  <tr key={tx.id} className="border-b border-[#1f1d1a] hover:bg-[#0a0a0c]">
                    <td className="py-3 text-[#8e8574]">{formatDate(tx.timestamp)}</td>
                    <td className="py-3">
                      <p className="text-white">{tx.merchant}</p>
                      {tx.cardNickname && <p className="text-xs text-[#64748b]">{tx.cardNickname} •••• {tx.cardLast4}</p>}
                    </td>
                    <td className="py-3 text-right font-mono">
                      <span className={tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400-400'}>
                        {tx.amount >= 0 ? '+' : ''}{formatBalance(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={tx.status === 'success' ? 'text-emerald-400' : tx.status === 'pending' ? 'text-amber-400' : 'text-red0-400'}>
                        {tx.status === 'success' ? '成功' : tx.status === 'pending' ? '处理中' : '失败'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Card Modal */}
      {showCreateCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0b0d] border border-[#1f1d1a] rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#d4af37]" />
              申请新虚拟卡片
            </h3>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs text-[#8e8574] mb-1">BIN 通道</label>
                <select
                  value={newCard.bin}
                  onChange={(e) => setNewCard({...newCard, bin: e.target.value})}
                  required
                  className="input-field"
                >
                  <option value="">选择发卡通道</option>
                  <option value="489734">489734 - Visa Platinum</option>
                  <option value="542137">542137 - Mastercard World</option>
                  <option value="438765">438765 - Visa Infinite</option>
                  <option value="529812">529812 - Mastercard Black</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#8e8574] mb-1">额度上限 (USD)</label>
                <input
                  type="number"
                  min="10"
                  max={user?.walletBalance || 10000}
                  value={newCard.limit}
                  onChange={(e) => setNewCard({...newCard, limit: Number(e.target.value)})}
                  required
                  className="input-field"
                />
                <p className="text-xs text-[#64748b] mt-1">钱包余额: {formatBalance(user?.walletBalance || 0)}</p>
              </div>
              <div>
                <label className="block text-xs text-[#8e8574] mb-1">卡片昵称 (可选)</label>
                <input
                  type="text"
                  value={newCard.nickname}
                  onChange={(e) => setNewCard({...newCard, nickname: e.target.value})}
                  placeholder="如: 主力消费卡"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8e8574] mb-1">用途标签</label>
                <select
                  value={newCard.label}
                  onChange={(e) => setNewCard({...newCard, label: e.target.value})}
                  className="input-field"
                >
                  <option value="General">通用消费</option>
                  <option value="Advertising">广告投放</option>
                  <option value="Subscription">订阅服务</option>
                  <option value="Testing">测试验证</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCard(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 btn-primary"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      申请中...
                    </>
                  ) : (
                    '提交申请'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}