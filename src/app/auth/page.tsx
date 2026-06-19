'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useMarketplaceStore } from '@/store/marketplace'
import { toast } from 'sonner'
import {
  Tag, Mail, Lock, Eye, EyeOff, GraduationCap, User, Phone,
  ArrowRight, CheckCircle2, Shield, BookOpen, ShoppingBag, MessageSquare,
  ChevronLeft,
} from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const { currentUser, setCurrentUser } = useMarketplaceStore()

  const [mode, setMode] = useState<'login' | 'signup'>('login')

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Signup
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [university, setUniversity] = useState('')
  const [phone, setPhone] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signupError, setSignupError] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/')
    }
  }, [currentUser, router])

  const SA_UNIVERSITIES = [
    'UCT', 'Wits', 'Stellenbosch', 'UP', 'UKZN', 'UJ', 'Rhodes',
    'NWU', 'UFS', 'UL', 'CPUT', 'DUT', 'TUT', 'UNISA', 'Mandela', 'Other',
  ]

  const passwordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return { score, label: score <= 1 ? 'Weak' : score <= 2 ? 'Fair' : score <= 3 ? 'Good' : 'Strong', color: score <= 1 ? 'bg-red-500' : score <= 2 ? 'bg-yellow-500' : score <= 3 ? 'bg-emerald-500' : 'bg-emerald-700' }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setCurrentUser(data)
        toast.success(`Welcome back, ${data.name}!`)
        router.push('/')
      } else {
        setLoginError(data.error || 'Invalid email or password')
      }
    } catch {
      setLoginError('Something went wrong. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError('')
    if (password !== confirmPassword) {
      setSignupError('Passwords do not match')
      return
    }
    setIsSigningUp(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, university, phone }),
      })
      const data = await res.json()
      if (res.ok) {
        setCurrentUser(data)
        toast.success(data.message || 'Account created!')
        router.push('/')
      } else {
        setSignupError(data.error || 'Signup failed')
      }
    } catch {
      setSignupError('Something went wrong.')
    } finally {
      setIsSigningUp(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">StudentMarket</h1>
              <p className="text-[10px] text-emerald-600 font-medium leading-tight">South Africa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex">
        {/* Left side - hero (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-200 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col justify-center px-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <GraduationCap className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Buy & Sell with<br />South African<br />Students
            </h2>
            <p className="text-emerald-100 text-lg mb-10 max-w-md">
              The trusted marketplace for students at 20+ universities. Get verified with your student email.
            </p>
            <div className="space-y-4">
              {[
                { icon: <BookOpen className="h-5 w-5" />, text: 'Textbooks & study notes at student prices' },
                { icon: <ShoppingBag className="h-5 w-5" />, text: 'Electronics, accommodation & more' },
                { icon: <MessageSquare className="h-5 w-5" />, text: 'Chat directly with buyers & sellers' },
                { icon: <Shield className="h-5 w-5" />, text: 'Verified student emails for safety' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-12 flex gap-6 text-sm">
              <div><span className="text-3xl font-bold">20+</span><p className="text-emerald-200">Universities</p></div>
              <div><span className="text-3xl font-bold">27+</span><p className="text-emerald-200">Listings</p></div>
              <div><span className="text-3xl font-bold">Free</span><p className="text-emerald-200">To join</p></div>
            </div>
          </div>
        </div>

        {/* Right side - form */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">StudentMarket</h1>
                <p className="text-xs text-emerald-600">South Africa</p>
              </div>
            </div>

            {/* Tab toggle */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8">
              <button
                onClick={() => { setMode('login'); setLoginError(''); setSignupError('') }}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setLoginError(''); setSignupError('') }}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Create Account
              </button>
            </div>

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h3>
                  <p className="text-sm text-gray-500">Sign in to your StudentMarket account</p>
                </div>

                {loginError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
                    <span className="shrink-0 mt-0.5"><ArrowRight className="h-4 w-4 rotate-180" /></span>
                    {loginError}
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Student Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="219045678@mycput.ac.za"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showLoginPw ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 rounded-xl"
                      required
                    />
                    <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoggingIn} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl font-semibold text-sm">
                  {isLoggingIn ? (
                    <span className="flex items-center gap-2">Signing in...</span>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <span>Don&apos;t have an account? </span>
                  <button type="button" onClick={() => { setMode('signup'); setLoginError('') }} className="text-emerald-600 font-semibold hover:underline">
                    Create Account
                  </button>
                </div>

                <Separator className="my-2" />
                <p className="text-xs text-gray-400 text-center">
                  Demo accounts: use any seed email (e.g. <strong>sipho@uct.ac.za</strong> or <strong>219045678@mycput.ac.za</strong>) with password <strong>password123</strong>
                </p>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h3>
                  <p className="text-sm text-gray-500">Join StudentMarket with your student email</p>
                </div>

                {signupError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
                    <span className="shrink-0 mt-0.5"><ArrowRight className="h-4 w-4 rotate-180" /></span>
                    {signupError}
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Sipho Mkhize" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-12 rounded-xl" required minLength={2} />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Student Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="email" placeholder="219045678@mycput.ac.za" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl" required />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Use your student number email for auto-verification
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">University</Label>
                  <div className="relative mt-1.5">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full pl-10 h-12 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select university</option>
                      {SA_UNIVERSITIES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Phone (optional)</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="+27 XX XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type={showPw ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12 rounded-xl" required />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passwordStrength(password).score ? passwordStrength(password).color : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{passwordStrength(password).label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type={showPw ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12 rounded-xl" required />
                  </div>
                  {confirmPassword && password && confirmPassword !== password && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button type="submit" disabled={isSigningUp} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl font-semibold text-sm">
                  {isSigningUp ? (
                    <span className="flex items-center gap-2">Creating Account...</span>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <span>Already have an account? </span>
                  <button type="button" onClick={() => { setMode('login'); setSignupError('') }} className="text-emerald-600 font-semibold hover:underline">
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
