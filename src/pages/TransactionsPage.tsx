import React, { useState, useEffect } from 'react'
import { Filter, Download, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { customerAPI } from '../hooks/api'
import type { Transaction } from '../types'

export default function TransactionsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState({ status: '', cardId: '', search: '' })
  const pageSize = 20

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await customerAPI.getTransactions({ page, limit: pageSize, ...filter })
      setTransactions(res.data.data || res.data.transactions || [])
      setTotalPages(res.data.totalPages || Math.ceil((res.data.total || 0) / pageSize) || 1)
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [page, filter])

  const formatBalance = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)

  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const getStatusColor = (status: string) => 
    status === 'success' ? 'text-emerald-400 bg-emerald-500/10' : 
    status === 'pending' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">交易记录</h1>
          <p className="text-[#8e8574] text-sm mt-1">查看所有充值、消费、退款与调账记录</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出 CSV
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            高级筛选
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[#8e8574] mb-1">状态筛选</label>
            <select
              value={filter.status}
              onChange={(e) => { setFilter(f => ({ ...f, status: e.target.value })); setPage(1); }}
              className="input-field"
            >
              <option value="">全部状态</option>
              <option value="success">成功</option>
              <option value="pending">处理中</option>
              <option value="failed">失败</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8e8574] mb-1">关键词搜索</label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => { setFilter(f => ({ ...f, search: e.target.value })); setPage(1); }}
              placeholder="商户名、描述、卡号后四位..."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8e8574] mb-1">卡片筛选</label>
            <select
              value={filter.cardId}
              onChange={(e) => { setFilter(f => ({ ...f, cardId: e.target.value })); setPage(1); }}
              className="input-field"
            >
              <option value="">全部卡片</option>
              {/* Options would be populated from user's cards */}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="w-8 h-8 text-[#d4af37] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-[#64748b]">
            <ExternalLink className="w-16 h-16 mx-auto mb-4 text-[#2c2923]" />
            <p className="text-lg font-medium text-[#8e8574] mb-1">暂无交易记录</p>
            <p className="text-sm">完成充值或消费后将显示在这里</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#64748b] border-b border-[#2c2925] bg-[#0a0a0c]">
                  <th className="p-3 font-medium">时间</th>
                  <th className="p-3 font-medium">类型 / 商户</th>
                  <th className="p-3 font-medium">卡片</th>
                  <th className="p-3 font-medium text-right">金额</th>
                  <th className="p-3 font-medium text-center">状态</th>
                  <th className="p-3 font-medium">描述</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-[#1f1d1a] hover:bg-[#0a0a0c] transition-colors">
                    <td className="p-3 text-[#8e8574] whitespace-nowrap">{formatDate(tx.timestamp)}</td>
                    <td className="p-3">
                      <p className="font-medium text-white">{tx.merchant}</p>
                      {tx.description && <p className="text-xs text-[#64748b]">{tx.description}</p>}
                    </td>
                    <td className="p-3">
                      {tx.cardNickname ? (
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-[#8e8574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span className="text-xs text-[#8e8574]">{tx.cardNickname}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#64748b]">钱包操作</span>
                      )}
                      {tx.cardLast4 && <p className="text-xs text-[#64748b] font-mono">•••• {tx.cardLast4}</p>}
                    </td>
                    <td className="p-3 text-right font-mono">
                      <span className={tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {tx.amount >= 0 ? '+' : ''}{formatBalance(tx.amount)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {tx.status === 'success' ? '成功' : tx.status === 'pending' ? '处理中' : '失败'}
                      </span>
                    </td>
                    <td className="p-3 text-[#8e8574] max-w-xs truncate">{tx.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between p-4 border-t border-[#2c2925]">
            <p className="text-sm text-[#8e8574]">
              第 {page} 页，共 {totalPages} 页
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-3 py-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary px-3 py-1.5"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}