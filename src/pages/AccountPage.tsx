import React, { useState, useEffect } from 'react'
import { User, Shield, Key, Bell, Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { customerAPI } from '../hooks/api'
import type { User as UserType } from '../types'

export default function AccountPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Partial<UserType>>({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [twoFactor, setTwoFactor] = useState({ enabled: false, secret: '', qrUrl: '' })
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true })
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | '2fa' | 'notifications'>('profile')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email, avatar: user.avatar || '' })
    }
  }, [user])

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await customerAPI.updateProfile(profile)
      showToast('个人信息已更新')
    } catch (err) {
      showToast('更新失败，请重试', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      showToast('两次输入的新密码不一致', 'error')
      return
    }
    if (passwords.new.length < 8) {
      showToast('新密码至少8位', 'error')
      return
    }
    setSaving(true)
    try {
      // await customerAPI.changePassword(passwords)
      showToast('密码已修改')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err) {
      showToast('修改失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handle2FAToggle = async (enabled: boolean) => {
    setSaving(true)
    try {
      if (enabled) {
        // const res = await customerAPI.enable2FA()
        // setTwoFactor({ enabled: true, secret: res.data.secret, qrUrl: res.data.qrUrl })
      } else {
        // await customerAPI.disable2FA()
        setTwoFactor({ enabled: false, secret: '', qrUrl: '' })
      }
      showToast(enabled ? '2FA 已启用' : '2FA 已禁用')
    } catch (err) {
      showToast('操作失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: '2fa', label: '双因子认证', icon: Key },
    { id: 'notifications', label: '通知偏好', icon: Bell }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">账户与安全</h1>
          <p className="text-[#8e8574] text-sm mt-1">管理您的个人信息、安全设置与通知偏好</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            user?.identityClass === 'agent' ? 'bg-blue-500/20 text-blue-400' :
            user?.identityClass === 'sub_account' ? 'bg-purple-500/20 text-purple-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {user?.identityClass === 'agent' ? '代理商' : user?.identityClass === 'sub_account' ? '子账号' : '标准用户'}
          </span>
          <span className="px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] text-xs font-medium rounded-full">
            VIP Lv.{user?.vipLevel || 1}
          </span>
        </div>
      </div>

      {message && (
        <div className={`fixed top-4 right-4 z-50 animate-fade-in px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="glass-card p-1" style={{ width: 'fit-content' }}>
        <div className="flex gap-1" role="tablist">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#d4af37] text-[#060607] shadow-lg'
                    : 'text-[#8e8574] hover:text-white hover:bg-[#1a1a1e]'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="glass-card">
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#f6e0a4] flex items-center justify-center text-3xl font-bold text-[#060607] overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#d4af37] text-[#060607] p-2 rounded-full cursor-pointer hover:bg-[#f6e0a4] transition-colors">
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (ev) => setProfile(p => ({ ...p, avatar: ev.target?.result as string }))
                      reader.readAsDataURL(file)
                    }
                  }} />
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{profile.name || '未设置姓名'}</h3>
                <p className="text-[#8e8574] text-sm">{profile.email}</p>
                <p className="text-xs text-[#64748b] mt-1">上游渠道: {user?.upstreamName || '未配置'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8e8574] mb-1">姓名</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8e8574] mb-1">邮箱</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="input-field"
                  placeholder="请输入邮箱"
                  disabled
                />
                <p className="text-xs text-[#64748b] mt-1">邮箱为登录凭证，暂不支持修改</p>
              </div>
            </div>

            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary w-full md:w-auto">
              {saving ? '保存中...' : '保存更改'}
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6 max-w-2xl">
            <div className="p-4 bg-[#121214] border border-[#2c2923] rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">密码安全</h4>
                  <p className="text-xs text-[#8e8574]">建议定期更新密码，使用强密码保护账户安全</p>
                </div>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#8e8574] mb-1">当前密码</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                    className="input-field"
                    placeholder="输入当前密码"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8e8574] mb-1">新密码</label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                    className="input-field"
                    placeholder="至少8位，包含大小写字母和数字"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8e8574] mb-1">确认新密码</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                    className="input-field"
                    placeholder="再次输入新密码"
                    required
                  />
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full md:w-auto">
                  {saving ? '修改中...' : '修改密码'}
                </button>
              </form>
            </div>

            <div className="p-4 bg-[#121214] border border-[#2c2923] rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">登录设备管理</h4>
                  <p className="text-xs text-[#8e8574]">查看并管理当前登录的设备</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { device: 'Chrome on Windows 11', location: '中国 · 北京', current: true, time: '当前活跃' },
                  { device: 'Safari on iPhone 15', location: '中国 · 上海', current: false, time: '2小时前' },
                  { device: 'Firefox on MacOS', location: '中国 · 深圳', current: false, time: '3天前' }
                ].map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#0a0a0c] rounded-lg border border-[#2c2923]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1a1a1e] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#8e8574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{d.device}</p>
                        <p className="text-xs text-[#8e8574]">{d.location} · {d.time}</p>
                      </div>
                    </div>
                    {d.current ? (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">当前设备</span>
                    ) : (
                      <button className="text-red-400 text-xs hover:text-red-300">移除</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === '2fa' && (
          <div className="space-y-6 max-w-2xl">
            <div className="p-4 bg-[#121214] border border-[#2c2923] rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">双因子认证 (2FA)</h4>
                    <p className="text-xs text-[#8e8574]">使用验证器应用保护您的账户</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactor.enabled}
                    onChange={(e) => handle2FAToggle(e.target.checked)}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              {twoFactor.enabled && (
                <div className="mt-4 p-4 bg-[#0a0a0c] rounded-lg border border-[#2c2923]">
                  <p className="text-xs text-[#8e8574] mb-2">2FA 已启用，登录时需要验证码</p>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-lg text-white bg-[#121214] px-4 py-2 rounded border border-[#2c2923] tracking-widest">
                      {twoFactor.secret?.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••'}
                    </div>
                    <button className="btn-secondary text-sm">复制密钥</button>
                  </div>
                </div>
              )}

              {!twoFactor.enabled && (
                <div className="mt-4 p-4 bg-[#0a0a0c] rounded-lg border border-[#2c2923] text-center">
                  <p className="text-xs text-[#8e8574] mb-3">扫描二维码或手动输入密钥到验证器应用</p>
                  <div className="w-48 h-48 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center">
                    {twoFactor.qrUrl ? (
                      <img src={twoFactor.qrUrl} alt="2FA QR Code" className="w-44 h-44" />
                    ) : (
                      <div className="text-[#64748b]">启用 2FA 后显示二维码</div>
                    )}
                  </div>
                  <p className="text-xs text-[#64748b]">支持: Google Authenticator, Authy, Microsoft Authenticator, 1Password</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4 max-w-2xl">
            {[
              { key: 'email', label: '邮件通知', desc: '接收账单、交易提醒、安全警报等邮件' },
              { key: 'sms', label: '短信通知', desc: '关键操作验证码、大额交易提醒' },
              { key: 'push', label: '推送通知', desc: '实时交易推送、系统公告、优惠活动' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-[#121214] border border-[#2c2923] rounded-xl">
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-xs text-[#8e8574]">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications(n => ({ ...n, [item.key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#d4af37]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
                </label>
              </div>
            ))}
            <p className="text-xs text-[#64748b]">设置会自动保存</p>
          </div>
        )}
      </div>
    </div>
  )
}