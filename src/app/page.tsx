'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useMarketplaceStore, type ListingDetail, type Category, type University, type StoryGroup, type StoryItem } from '@/store/marketplace'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, MapPin, Clock, Eye, Heart, Share2, X,
  BookOpen, Smartphone, Home, Shirt, Car, Armchair, Dumbbell,
  Briefcase, Coffee, Gift, ArrowUpDown, Send, User, GraduationCap,
  LayoutGrid, SlidersHorizontal, TrendingUp, CheckCircle2, Tag,
  Star, Shield, Mail, Lock, EyeOff, CirclePlus, Camera,
  BadgeCheck, LogOut, MessageSquare, Settings, ImagePlus, Upload, Trash2,
} from 'lucide-react'
import {
  FileUploader,
  FileInput,
  FileUploaderContent,
  FileUploaderItem,
} from '@/components/ui/file-upload'
import type { DropzoneOptions } from 'react-dropzone'

const ICON_MAP: Record<string, React.ReactNode> = {
  'book-open': <BookOpen className="h-5 w-5" />,
  'smartphone': <Smartphone className="h-5 w-5" />,
  'home': <Home className="h-5 w-5" />,
  'shirt': <Shirt className="h-5 w-5" />,
  'car': <Car className="h-5 w-5" />,
  'armchair': <Armchair className="h-5 w-5" />,
  'dumbbell': <Dumbbell className="h-5 w-5" />,
  'briefcase': <Briefcase className="h-5 w-5" />,
  'coffee': <Coffee className="h-5 w-5" />,
  'gift': <Gift className="h-5 w-5" />,
}

const ICON_MAP_SM: Record<string, React.ReactNode> = {
  'book-open': <BookOpen className="h-4 w-4" />,
  'smartphone': <Smartphone className="h-4 w-4" />,
  'home': <Home className="h-4 w-4" />,
  'shirt': <Shirt className="h-4 w-4" />,
  'car': <Car className="h-4 w-4" />,
  'armchair': <Armchair className="h-4 w-4" />,
  'dumbbell': <Dumbbell className="h-4 w-4" />,
  'briefcase': <Briefcase className="h-4 w-4" />,
  'coffee': <Coffee className="h-4 w-4" />,
  'gift': <Gift className="h-4 w-4" />,
}

const CONDITIONS = ['All Conditions', 'New', 'Like New', 'Good', 'Fair', 'Used']
const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
  'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)',
]

function formatPrice(price: number): string {
  if (price === 0) return 'Free'
  return `R${price.toLocaleString('en-ZA')}`
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}

// ─── Stories Tray ───
function StoriesTray({ storyGroups, onStoryClick }: { storyGroups: StoryGroup[]; onStoryClick: (g: StoryGroup) => void }) {
  const { currentUser, setShowCreateStory, setViewMode } = useMarketplaceStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar">
          {currentUser && (
            <button onClick={() => setShowCreateStory(true)} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <CirclePlus className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-600 w-16 text-center truncate">Your Story</span>
            </button>
          )}
          {!currentUser && (
            <button onClick={() => setViewMode('login')} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Camera className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-400 w-16 text-center truncate">Sign in</span>
            </button>
          )}
          {storyGroups.map((group) => (
            <button key={group.user.id} onClick={() => onStoryClick(group)} className="flex flex-col items-center gap-1.5 shrink-0 group/story">
              <div className="relative">
                <div className="w-[68px] h-[68px] rounded-full p-[3px]" style={{ background: 'linear-gradient(135deg, #16a34a, #0891b2, #7c3aed, #e11d48)' }}>
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={group.user.avatar || ''} className="object-cover" />
                      <AvatarFallback className="text-xs">{group.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                {group.user.verified && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                    <BadgeCheck className="h-4 w-4 text-blue-500 fill-white" />
                  </div>
                )}
              </div>
              <span className="text-[11px] font-medium text-gray-700 w-16 text-center truncate group-hover/story:text-emerald-600 transition-colors">
                {group.user.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Story Viewer ───
function StoryViewer({ storyGroups, viewingStoryGroup, viewingStoryIndex, setViewingStoryGroup, setViewingStoryIndex, onClose }: { storyGroups: StoryGroup[]; viewingStoryGroup: StoryGroup | null; viewingStoryIndex: number; setViewingStoryGroup: (g: StoryGroup | null) => void; setViewingStoryIndex: (i: number) => void; onClose: () => void }) {
  const [progress, setProgress] = useState(0)
  const STORY_DURATION = 5000
  const group = viewingStoryGroup
  const story = group?.stories[viewingStoryIndex]

  const goNext = () => {
    if (!group) return
    if (viewingStoryIndex < group.stories.length - 1) {
      setViewingStoryIndex(viewingStoryIndex + 1)
    } else {
      const idx = storyGroups.findIndex(g => g.user.id === group.user.id)
      if (idx < storyGroups.length - 1) {
        setViewingStoryGroup(storyGroups[idx + 1])
      } else {
        setViewingStoryGroup(null)
        onClose()
      }
    }
  }

  useEffect(() => {
    if (!story) return
    setProgress(0)
    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) { clearInterval(timer); goNext() }
    }, 50)
    return () => clearInterval(timer)
  }, [story?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!group || !story) return null

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center" style={{ zIndex: 100 }}>
      <button onClick={() => { setViewingStoryGroup(null); onClose() }} className="absolute top-4 right-4 z-10 text-white/80 hover:text-white">
        <X className="h-8 w-8" />
      </button>
      <div className="absolute top-4 left-4 right-12 z-10 flex gap-1">
        {group.stories.map((_, i) => (
          <div key={i} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-100" style={{ width: i < viewingStoryIndex ? '100%' : i === viewingStoryIndex ? `${progress}%` : '0%' }} />
          </div>
        ))}
      </div>
      <div className="relative w-full max-w-md h-[90vh] max-h-[800px] rounded-2xl overflow-hidden cursor-pointer select-none" onClick={(e) => { e.stopPropagation(); goNext() }}>
        {story.type === 'image' && story.mediaUrl ? (
          <img src={story.mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: story.backgroundColor || '#333' }} />
        )}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-8 left-4 right-4 flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={group.user.avatar || ''} />
            <AvatarFallback>{group.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-sm">{group.user.name}</span>
              {group.user.verified && <BadgeCheck className="h-4 w-4 text-blue-400 fill-white" />}
            </div>
            <span className="text-white/70 text-xs">{timeAgo(story.createdAt)}</span>
          </div>
        </div>
        {story.caption && (
          <div className="absolute bottom-8 left-4 right-4">
            <p className="text-white text-lg font-medium leading-snug drop-shadow-lg">{story.caption}</p>
            {group.user.university && (
              <p className="text-white/60 text-sm mt-1 flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />{group.user.university}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={(e) => { e.stopPropagation(); if (viewingStoryIndex > 0) setViewingStoryIndex(viewingStoryIndex - 1) }} />
      <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={(e) => { e.stopPropagation(); setViewingStoryGroup(null); onClose() }} />
    </div>
  )
}

// ─── Create Story Dialog ───
function CreateStoryDialog({ onCreated }: { onCreated: () => void }) {
  const { showCreateStory, setShowCreateStory, currentUser } = useMarketplaceStore()
  const [caption, setCaption] = useState('')
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async () => {
    if (!caption.trim() || !currentUser) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, caption: caption.trim(), type: 'gradient', backgroundColor: selectedGradient }),
      })
      if (res.ok) { toast.success('Story posted!'); setCaption(''); setShowCreateStory(false); onCreated() }
    } catch { toast.error('Failed to post story') } finally { setIsSubmitting(false) }
  }

  return (
    <Dialog open={showCreateStory} onOpenChange={(open) => !open && setShowCreateStory(false)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2"><Camera className="h-5 w-5 text-emerald-600" />Create Story</DialogTitle>
          <DialogDescription className="sr-only">Create a new story</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="relative aspect-[9/16] max-h-80 rounded-2xl overflow-hidden">
            <div className="w-full h-full flex items-end p-4" style={{ background: selectedGradient }}>
              <div className="text-white">
                <p className="text-xl font-bold drop-shadow-lg">{caption || 'Your story caption...'}</p>
                <p className="text-white/70 text-sm mt-1 flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{currentUser?.university || 'StudentMarket'}</p>
              </div>
            </div>
          </div>
          <div><Label className="text-sm font-medium">Caption</Label><Input placeholder="What&apos;s happening?" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} className="mt-1" /></div>
          <div><Label className="text-sm font-medium">Background</Label><div className="flex flex-wrap gap-2 mt-2">{GRADIENT_PRESETS.map((g, i) => (<button key={i} onClick={() => setSelectedGradient(g)} className={`w-10 h-10 rounded-full border-2 transition-all ${selectedGradient === g ? 'border-emerald-500 scale-110' : 'border-transparent'}`} style={{ background: g }} />))}</div></div>
          <Button onClick={handleCreate} disabled={!caption.trim() || isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl">{isSubmitting ? 'Posting...' : 'Post Story'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Login Dialog ───
function LoginDialog() {
  const { viewMode, setViewMode, setCurrentUser } = useMarketplaceStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (res.ok) { setCurrentUser(data); setViewMode('browse'); toast.success(`Welcome back, ${data.name}!`) }
      else { setError(data.error || 'Login failed') }
    } catch { setError('Something went wrong. Please try again.') } finally { setIsLoading(false) }
  }

  return (
    <Dialog open={viewMode === 'login'} onOpenChange={(open) => !open && setViewMode('browse')}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome Back</DialogTitle>
          <DialogDescription>Sign in to your StudentMarket account</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4 mt-2">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="email" placeholder="sipho@uct.ac.za or 219045678@mycput.ac.za" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Password</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 font-medium">{isLoading ? 'Signing in...' : 'Sign In'}</Button>
          <div className="text-center text-sm">
            <span className="text-gray-500">Don&apos;t have an account? </span>
            <button type="button" onClick={() => setViewMode('signup')} className="text-emerald-600 font-semibold hover:underline">Sign Up</button>
          </div>
          <Separator />
          <p className="text-xs text-gray-400 text-center">Demo: use any seed email (e.g. sipho@uct.ac.za) with password <strong>password123</strong></p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Signup Dialog ───
function SignupDialog() {
  const { viewMode, setViewMode, setCurrentUser } = useMarketplaceStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [university, setUniversity] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' })

  const SA_UNIVERSITIES = ['UCT', 'Wits', 'Stellenbosch', 'UP', 'UKZN', 'UJ', 'Rhodes', 'NWU', 'UFS', 'UL', 'CPUT', 'DUT', 'TUT', 'UNISA', 'Other']

  const checkPasswordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 2) return { score, label: 'Fair', color: 'bg-yellow-500' }
    if (score <= 3) return { score, label: 'Good', color: 'bg-emerald-500' }
    return { score, label: 'Strong', color: 'bg-emerald-700' }
  }

  useEffect(() => { setPasswordStrength(checkPasswordStrength(password)) }, [password])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, university }) })
      const data = await res.json()
      if (res.ok) { setCurrentUser(data); setViewMode('browse'); toast.success(data.message || 'Account created!') }
      else { setError(data.error || 'Signup failed') }
    } catch { setError('Something went wrong.') } finally { setIsLoading(false) }
  }

  return (
    <Dialog open={viewMode === 'signup'} onOpenChange={(open) => !open && setViewMode('browse')}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2"><GraduationCap className="h-5 w-5 text-emerald-600" />Create Account</DialogTitle>
          <DialogDescription>Join StudentMarket SA</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSignup} className="space-y-4 mt-2">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
          <div><Label className="text-sm font-medium">Full Name *</Label><Input placeholder="Sipho Mkhize" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" required minLength={2} /></div>
          <div>
            <Label className="text-sm font-medium">Student Email *</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="email" placeholder="219045678@mycput.ac.za or sipho@uct.ac.za" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
            <p className="text-xs text-gray-400 mt-1">Use your student number email (e.g. 219045678@mycput.ac.za) for auto-verification</p>
          </div>
          <div>
            <Label className="text-sm font-medium">University</Label>
            <Select value={university} onValueChange={setUniversity}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select university" /></SelectTrigger>
              <SelectContent>{SA_UNIVERSITIES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">Password *</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1">{[1, 2, 3, 4].map((i) => (<div key={i} className={`h-1 flex-1 rounded-full ${i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'}`} />))}</div>
                <span className="text-xs text-gray-500">{passwordStrength.label}</span>
              </div>
            )}
          </div>
          <div><Label className="text-sm font-medium">Confirm Password *</Label><div className="relative mt-1.5"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input type={showPassword ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" required /></div></div>
          <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 font-medium">{isLoading ? 'Creating account...' : 'Create Account'}</Button>
          <div className="text-center text-sm"><span className="text-gray-500">Already have an account? </span><button type="button" onClick={() => setViewMode('login')} className="text-emerald-600 font-semibold hover:underline">Sign In</button></div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Header ───
function Header() {
  const router = useRouter()
  const { searchQuery, setSearchQuery, setViewMode, currentUser, logout, setShowCreateStory } = useMarketplaceStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center"><Tag className="h-5 w-5 text-white" /></div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">StudentMarket</h1>
              <p className="text-[10px] text-emerald-600 font-medium leading-tight">South Africa</p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search textbooks, electronics, accommodation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 h-10 bg-gray-50 border-gray-200 rounded-full text-sm focus:bg-white focus:border-emerald-400 focus:ring-emerald-400" />
              {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-gray-400 hover:text-gray-600" /></button>)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Chat icon - always visible */}
            {currentUser && (
              <button
                onClick={() => router.push('/chat')}
                className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-gray-600" />
              </button>
            )}

            {currentUser ? (
              <>
                {currentUser.verified && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 text-xs hidden sm:flex">
                    <Shield className="h-3 w-3" /> Verified
                  </Badge>
                )}
                <div className="relative">
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={currentUser.avatar || ''} />
                      <AvatarFallback className="text-[10px]">{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">{currentUser.name.split(' ')[0]}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-1 w-60 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold">{currentUser.name}</p>
                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                        {currentUser.university && <p className="text-xs text-emerald-600 mt-0.5">{currentUser.university}</p>}
                      </div>
                      <button onClick={() => { router.push('/profile'); setShowUserMenu(false) }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-2.5">
                        <Settings className="h-4 w-4 text-gray-500" /> My Profile
                      </button>
                      <button onClick={() => { router.push('/chat'); setShowUserMenu(false) }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-2.5">
                        <MessageSquare className="h-4 w-4 text-gray-500" /> Messages
                      </button>
                      <button onClick={() => { setShowCreateStory(true); setShowUserMenu(false) }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-2.5">
                        <Camera className="h-4 w-4 text-gray-500" /> Create Story
                      </button>
                      <button onClick={() => { setViewMode('create'); setShowUserMenu(false) }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-2.5">
                        <Plus className="h-4 w-4 text-gray-500" /> New Listing
                      </button>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={() => { logout(); setShowUserMenu(false); toast.success('Logged out') }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-red-50 text-red-600 flex items-center gap-2.5">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Button onClick={() => setViewMode('login')} variant="outline" className="rounded-full gap-1.5 text-sm font-medium border-gray-200">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            <Button onClick={() => currentUser ? setViewMode('create') : setViewMode('signup')} className="bg-emerald-600 hover:bg-emerald-700 rounded-full gap-1.5 text-sm font-medium">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Sell</span>
            </Button>
          </div>
        </div>
      </div>
      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}
    </header>
  )
}

// ─── Category Bar ───
function CategoryBar({ categories }: { categories: Category[] }) {
  const { selectedCategory, setSelectedCategory } = useMarketplaceStore()
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 py-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setSelectedCategory('')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!selectedCategory ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <LayoutGrid className="h-4 w-4" /> All
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} style={selectedCategory === cat.id ? { backgroundColor: cat.color } : undefined}>
              {ICON_MAP[cat.icon]}
              <span className="hidden sm:inline">{cat.name}</span>
              {cat._count.listings > 0 && (<span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-200'}`}>{cat._count.listings}</span>)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Filter Bar ───
function FilterBar({ universities }: { universities: University[] }) {
  const { selectedUniversity, setSelectedUniversity, selectedCondition, setSelectedCondition, sortBy, setSortBy, resetFilters } = useMarketplaceStore()
  const [showFilters, setShowFilters] = useState(false)
  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {(selectedUniversity || selectedCondition) && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
          </button>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 flex-wrap">
                <Select value={selectedUniversity || 'all'} onValueChange={(v) => setSelectedUniversity(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-auto h-9 gap-1.5 text-sm border-gray-200 bg-white"><GraduationCap className="h-3.5 w-3.5 text-gray-500" /><SelectValue placeholder="University" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Universities</SelectItem>{universities.map((uni) => <SelectItem key={uni.id} value={uni.id}>{uni.shortName} ({uni._count.listings})</SelectItem>)}</SelectContent>
                </Select>
                <Select value={selectedCondition || 'all'} onValueChange={(v) => setSelectedCondition(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-auto h-9 gap-1.5 text-sm border-gray-200 bg-white"><CheckCircle2 className="h-3.5 w-3.5 text-gray-500" /><SelectValue placeholder="Condition" /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c.toLowerCase().includes('all') ? 'all' : c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                {(selectedUniversity || selectedCondition) && (<Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"><X className="h-3 w-3 mr-1" /> Clear</Button>)}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="ml-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto h-9 gap-1.5 text-sm border-gray-200 bg-white"><ArrowUpDown className="h-3.5 w-3.5 text-gray-500" /><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="newest">Newest first</SelectItem><SelectItem value="price_low">Price: Low to High</SelectItem><SelectItem value="price_high">Price: High to Low</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Listing Card ───
function ListingCard({ listing, onClick }: { listing: ListingDetail; onClick: () => void }) {
  const images = JSON.parse(listing.images || '[]') as string[]
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden cursor-pointer group border-gray-200 hover:shadow-lg hover:border-emerald-200 transition-all duration-300" onClick={onClick}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {images[0] ? (
            <img src={images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center p-4">{ICON_MAP[listing.category.icon]}<p className="text-xs text-gray-400 mt-2">{listing.category.name}</p></div>
            </div>
          )}
          <Badge className="absolute top-2 left-2 text-[10px] font-medium" style={{ backgroundColor: listing.category.color + 'DD', color: 'white' }}>{listing.condition}</Badge>
          <div className="absolute bottom-2 left-2">
            <span className={`text-sm font-bold ${listing.price === 0 ? 'bg-green-500' : 'bg-black/70'} text-white px-2 py-0.5 rounded-md backdrop-blur-sm`}>{formatPrice(listing.price)}</span>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md">{images.length} photos</div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5em]">{listing.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="h-3 w-3" /><span className="text-[11px] truncate">{listing.location}</span>
            </div>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3 w-3" /><span className="text-[11px]">{timeAgo(listing.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-5 w-5"><AvatarImage src={listing.seller.avatar} /><AvatarFallback className="text-[8px]">{listing.seller.name.charAt(0)}</AvatarFallback></Avatar>
            <span className="text-[11px] text-gray-500 truncate">{listing.seller.name}</span>
            <div className="ml-auto flex items-center gap-1 text-gray-400">
              <Eye className="h-3 w-3" /><span className="text-[10px]">{listing.views}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Listing Grid ───
function ListingGrid({ listings, onSelectListing }: { listings: ListingDetail[]; onSelectListing: (l: ListingDetail) => void }) {
  const router = useRouter()
  if (listings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="h-7 w-7 text-gray-400" /></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No listings found</h3>
        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} onClick={() => router.push(`/listing/${listing.id}`)} />
      ))}
    </div>
  )
}

// ─── Create Listing Dialog ───
function CreateListingDialog({ categories, universities, onCreated }: { categories: Category[]; universities: University[]; onCreated: () => void }) {
  const { viewMode, setViewMode, currentUser } = useMarketplaceStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [campus, setCampus] = useState('')
  const [location, setLocation] = useState('')
  const [condition, setCondition] = useState('Used')
  const [negotiable, setNegotiable] = useState(true)
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const dropzone = {
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    multiple: true,
    maxFiles: 4,
    maxSize: 5 * 1024 * 1024,
  } satisfies DropzoneOptions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !categoryId || !location) { toast.error('Please fill in all required fields'); return }
    setIsSubmitting(true)
    try {
      let imageUrls: string[] = []

      // Upload files if any
      if (files.length > 0) {
        setIsUploading(true)
        const formData = new FormData()
        files.forEach((f) => formData.append('files', f))
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrls = uploadData.urls
        } else {
          toast.error('Failed to upload images')
          setIsUploading(false)
          setIsSubmitting(false)
          return
        }
      }

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, price: parseFloat(price) || 0, categoryId, universityId: universityId || null, campus, location, condition, negotiable, images: imageUrls, sellerId: currentUser?.id || 'user-1' }),
      })
      if (res.ok) {
        toast.success('Listing created!')
        setTitle(''); setDescription(''); setPrice(''); setCategoryId(''); setUniversityId(''); setCampus(''); setLocation(''); setCondition('Used'); setNegotiable(true); setFiles([])
        setViewMode('browse'); onCreated()
      } else { toast.error('Failed to create listing') }
    } catch { toast.error('Failed to create listing') } finally { setIsSubmitting(false); setIsUploading(false) }
  }

  return (
    <Dialog open={viewMode === 'create'} onOpenChange={(open) => { if (!open) { setViewMode('browse'); setFiles([]) } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2"><div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><Plus className="h-4 w-4 text-emerald-600" /></div>Create New Listing</DialogTitle>
          <DialogDescription className="sr-only">Create a new listing</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Photo Upload */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Photos</Label>
            <FileUploader
              value={files}
              orientation="vertical"
              onValueChange={setFiles}
              dropzoneOptions={dropzone}
              className="relative rounded-lg"
            >
              <FileInput className="outline-dashed outline-2 outline-primary/40 bg-muted/50 hover:bg-muted transition-colors rounded-xl">
                <div className="flex flex-col items-center justify-center py-8 w-full">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    <span className="text-emerald-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF or WEBP (max 5MB each, up to 4 photos)</p>
                </div>
              </FileInput>
              <FileUploaderContent className="flex flex-wrap gap-3 mt-3">
                {files.map((file, i) => (
                  <FileUploaderItem
                    key={`${file.name}-${file.lastModified}-${file.size}`}
                    index={i}
                    className="size-24 p-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                    aria-roledescription={`file ${i + 1} containing ${file.name}`}
                  >
                    <div className="relative w-full h-full group/img">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors rounded-lg" />
                      <div className="absolute bottom-1 left-1 right-1">
                        <span className="text-[10px] text-white bg-black/50 rounded px-1 truncate block">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    </div>
                  </FileUploaderItem>
                ))}
              </FileUploaderContent>
            </FileUploader>
          </div>

          <div><Label className="text-sm font-medium">Title *</Label><Input placeholder="What are you selling?" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" required /></div>
          <div><Label className="text-sm font-medium">Description *</Label><Textarea placeholder="Describe your item..." value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 min-h-[100px]" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm font-medium">Price (ZAR)</Label><div className="relative mt-1.5"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">R</span><Input type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-8" min="0" /></div><label className="flex items-center gap-2 mt-2 cursor-pointer"><input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" /><span className="text-xs text-gray-600">Negotiable</span></label></div>
            <div><Label className="text-sm font-medium">Condition</Label><Select value={condition} onValueChange={setCondition}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="New">New</SelectItem><SelectItem value="Like New">Like New</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="Fair">Fair</SelectItem><SelectItem value="Used">Used</SelectItem></SelectContent></Select></div>
          </div>
          <div><Label className="text-sm font-medium">Category *</Label><Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map((cat) => <SelectItem key={cat.id} value={cat.id}><div className="flex items-center gap-2">{ICON_MAP_SM[cat.icon]}{cat.name}</div></SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm font-medium">University</Label><Select value={universityId || 'none'} onValueChange={(v) => setUniversityId(v === 'none' ? '' : v)}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{universities.map((uni) => <SelectItem key={uni.id} value={uni.id}>{uni.shortName} - {uni.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-sm font-medium">Campus</Label><Input placeholder="e.g., Upper Campus" value={campus} onChange={(e) => setCampus(e.target.value)} className="mt-1.5" /></div>
          </div>
          <div><Label className="text-sm font-medium">Location *</Label><Input placeholder="e.g., UCT, Rondebosch" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5" required /></div>
          <Button type="submit" disabled={isSubmitting || isUploading} className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 rounded-xl font-medium">
            {isUploading ? <span className="flex items-center gap-2"><Upload className="h-4 w-4 animate-bounce" />Uploading photos...</span> : isSubmitting ? 'Creating...' : 'Publish Listing'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Hero Banner ───
function HeroBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Student Marketplace</h2>
            <p className="text-emerald-100 text-sm md:text-base max-w-lg">Buy and sell textbooks, electronics, accommodation, and more with students across South Africa. Trusted by students at 13+ universities.</p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full"><TrendingUp className="h-4 w-4" /> 27+ Active Listings</span>
              <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full"><Shield className="h-4 w-4" /> Verified Students</span>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-3 text-center">
            {[{ icon: <BookOpen className="h-6 w-6" />, label: 'Textbooks', count: '6' }, { icon: <Smartphone className="h-6 w-6" />, label: 'Electronics', count: '6' }, { icon: <Home className="h-6 w-6" />, label: 'Accommodation', count: '3' }].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3"><div className="flex justify-center mb-1">{item.icon}</div><p className="text-xs font-medium">{item.label}</p><p className="text-lg font-bold">{item.count}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Footer ───
function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><Tag className="h-4 w-4 text-white" /></div><span className="font-bold text-gray-900">StudentMarket</span></div>
            <p className="text-xs text-gray-500 leading-relaxed">South Africa&apos;s student-to-student marketplace.</p>
          </div>
          <div><h4 className="font-semibold text-sm text-gray-900 mb-3">Popular Categories</h4><ul className="space-y-1.5 text-xs text-gray-500"><li className="hover:text-emerald-600 cursor-pointer">Textbooks & Notes</li><li className="hover:text-emerald-600 cursor-pointer">Electronics</li><li className="hover:text-emerald-600 cursor-pointer">Accommodation</li><li className="hover:text-emerald-600 cursor-pointer">Clothing</li></ul></div>
          <div><h4 className="font-semibold text-sm text-gray-900 mb-3">Top Campuses</h4><ul className="space-y-1.5 text-xs text-gray-500"><li className="hover:text-emerald-600 cursor-pointer">UCT</li><li className="hover:text-emerald-600 cursor-pointer">Wits</li><li className="hover:text-emerald-600 cursor-pointer">Stellenbosch</li><li className="hover:text-emerald-600 cursor-pointer">CPUT</li></ul></div>
          <div><h4 className="font-semibold text-sm text-gray-900 mb-3">Support</h4><ul className="space-y-1.5 text-xs text-gray-500"><li className="hover:text-emerald-600 cursor-pointer">Help Centre</li><li className="hover:text-emerald-600 cursor-pointer">Safety Tips</li><li className="hover:text-emerald-600 cursor-pointer">Report a Problem</li><li className="hover:text-emerald-600 cursor-pointer">Terms & Conditions</li></ul></div>
        </div>
        <Separator className="my-6" /><p className="text-xs text-gray-400 text-center">Made with care for South African students.</p>
      </div>
    </footer>
  )
}

// ─── Main Page ───
export default function MarketplacePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-emerald-600 font-semibold">Loading...</div></div>}>
      <MarketplacePage />
    </Suspense>
  )
}

function MarketplacePage() {
  const { searchQuery, selectedCategory, selectedUniversity, selectedCondition, sortBy } = useMarketplaceStore()

  const [listings, setListings] = useState<ListingDetail[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchListings = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (selectedCategory) params.set('categoryId', selectedCategory)
      if (selectedUniversity) params.set('universityId', selectedUniversity)
      if (selectedCondition) params.set('condition', selectedCondition)
      if (sortBy) params.set('sortBy', sortBy)
      const res = await fetch(`/api/listings?${params}`)
      if (res.ok) { const data = await res.json(); setListings(data.listings) }
    } catch { toast.error('Failed to load listings') } finally { setIsLoading(false) }
  }, [searchQuery, selectedCategory, selectedUniversity, selectedCondition, sortBy])

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch('/api/stories')
      if (res.ok) setStoryGroups(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories).catch(() => {})
    fetch('/api/universities').then((r) => r.json()).then(setUniversities).catch(() => {})
    fetchStories()
  }, [])

  useEffect(() => { fetchListings() }, [fetchListings, refreshKey])

  const [viewingStoryGroup, setViewingStoryGroup] = useState<StoryGroup | null>(null)
  const [viewingStoryIndex, setViewingStoryIndex] = useState(0)

  const handleStoryClick = (group: StoryGroup) => { setViewingStoryGroup(group); setViewingStoryIndex(0) }
  const handleStoryClose = () => { setViewingStoryGroup(null); setViewingStoryIndex(0) }
  const handleCreated = () => { setRefreshKey((k) => k + 1); fetchStories() }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <>
        <StoriesTray storyGroups={storyGroups} onStoryClick={handleStoryClick} />
        <CategoryBar categories={categories} />
        <FilterBar universities={universities} />
        <HeroBanner />
        <main className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
              {Array.from({ length: 12 }).map((_, i) => <Card key={i} className="overflow-hidden"><Skeleton className="aspect-square" /><CardContent className="p-3 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>)}
            </div>
          ) : (
            <ListingGrid listings={listings} onSelectListing={() => {}} />
          )}
        </main>
      </>

      {/* Modals */}
      <LoginDialog />
      <SignupDialog />
      <CreateListingDialog categories={categories} universities={universities} onCreated={handleCreated} />
      <CreateStoryDialog onCreated={handleCreated} />

      {/* Story Viewer */}
      {viewingStoryGroup && (
        <StoryViewer
          storyGroups={storyGroups}
          viewingStoryGroup={viewingStoryGroup}
          viewingStoryIndex={viewingStoryIndex}
          setViewingStoryGroup={setViewingStoryGroup}
          setViewingStoryIndex={setViewingStoryIndex}
          onClose={handleStoryClose}
        />
      )}

      <Footer />
    </div>
  )
}
