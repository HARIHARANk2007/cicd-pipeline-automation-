"use client"
import React, { useState } from 'react'
import { login } from '@/lib/services'

import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6fd] p-4">
      <main className="w-full max-w-[420px] flex flex-col items-center">

        {/* Brand header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-[#003d9b] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="material-symbols-outlined text-white text-3xl" style={{fontVariationSettings:"'FILL' 1"}}>shield_person</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight" style={{fontFamily:'Manrope,sans-serif'}}>MediGuard AI</h1>
          <p className="text-sm text-[#64748b] mt-1">Secure clinician access — Hospital CDSS</p>
        </div>

        {/* Card */}
        <div className="w-full bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-[0_4px_24px_-6px_rgba(0,61,155,0.12)]">

          {/* Demo credentials hint */}
          <div className="mb-6 px-4 py-3 bg-[#e8f4ff] border border-[#bae6fd] rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-[#0284c7] text-[18px] mt-0.5 shrink-0">info</span>
            <div className="text-xs text-[#0369a1]">
              <strong>Demo:</strong> dr.sarah.chen@hospital.org &nbsp;/&nbsp; password123
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Hospital Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[20px]">mail</span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="dr.smith@hospital.org"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#0f172a] placeholder:text-[#cbd5e1] focus:outline-none focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-[#003d9b] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[20px]">lock</span>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#0f172a] placeholder:text-[#cbd5e1] focus:outline-none focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 transition-all"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]">
                  <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#003d9b] text-white text-sm font-bold rounded-xl hover:bg-[#002a7a] active:opacity-90 transition-all disabled:opacity-60 shadow-sm mt-2"
            >
              {loading
                ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Authenticating...</>
                : <><span>Access Dashboard</span><span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e2e8f0]" />
            <span className="text-xs text-[#94a3b8]">or continue with</span>
            <div className="flex-1 h-px bg-[#e2e8f0]" />
          </div>

          {/* SSO buttons */}
          <div className="space-y-3">
            <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-[#e2e8f0] text-[#1e293b] text-sm font-medium rounded-xl hover:bg-[#f8fafc] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google Workspace
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-[#94a3b8] text-center max-w-xs">
          By logging in you agree to our <a href="#" className="text-[#003d9b] hover:underline">Terms of Service</a> and <a href="#" className="text-[#003d9b] hover:underline">Privacy Policy</a>.
        </p>
      </main>
    </div>
  )
}

