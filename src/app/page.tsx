'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  Bell,
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
    <div className="border-b border-gray-100/60 bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar">
          {currentUser && (
            <button onClick={() => setShowCreateStory(true)} className="flex flex-col items-center gap-1.5 shrink-0 group/add">
              <div className="relative">
                <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center border-2 border-dashed border-emerald-300 group-hover/add:border-emerald-400 group-hover/add:shadow-lg group-hover/add:shadow-emerald-100 transition-all duration-300">
                  <CirclePlus className="h-6 w-6 text-emerald-500 group-hover/add:scale-110 transition-transform" />
                </div>
              </div>
              <span className="text-[11px] font-semibold text-gray-600 w-16 text-center truncate group-hover/add:text-emerald-600 transition-colors">Your Story</span>
            </button>
          )}
          {!currentUser && (
            <button onClick={() => setViewMode('login')} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="relative">
                <div className="w-[68px] h-[68px] rounded-full bg-gray-50/80 flex items-center justify-center border-2 border-dashed border-gray-200">
                  <Camera className="h-6 w-6 text-gray-300" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-400 w-16 text-center truncate">Sign in</span>
            </button>
          )}
          {storyGroups.map((group) => (
            <button key={group.user.id} onClick={() => onStoryClick(group)} className="flex flex-col items-center gap-1.5 shrink-0 group/story">
              <div className="relative">
                <div className="w-[72px] h-[72px] rounded-full p-[3px] shadow-lg shadow-emerald-200/30" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6, #ec4899)' }}>
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={group.user.avatar || ''} className="object-cover" />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-emerald-50 to-teal-50">{group.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                {group.user.verified && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                    <BadgeCheck className="h-4 w-4 text-blue-500 fill-white" />
                  </div>
                )}
              </div>
              <span className="text-[11px] font-semibold text-gray-700 w-16 text-center truncate group-hover/story:text-emerald-600 transition-colors">
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
  const [storyMode, setStoryMode] = useState<'gradient' | 'photo'>('gradient')
  const [storyFile, setStoryFile] = useState<File[]>([])
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)

  const storyDropzone = {
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  } satisfies DropzoneOptions

  const handleCreate = async () => {
    if (!currentUser) return
    setIsSubmitting(true)
    try {
      let mediaUrl = ''
      let type = 'gradient'
      let backgroundColor = selectedGradient

      // Upload image if in photo mode
      if (storyMode === 'photo' && storyFile.length > 0) {
        const formData = new FormData()
        formData.append('files', storyFile[0])
        formData.append('folder', 'stories')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (uploadRes.ok) {
          const data = await uploadRes.json()
          mediaUrl = data.urls[0]
          type = 'image'
          backgroundColor = '#1a1a1a'
        } else {
          toast.error('Failed to upload image')
          setIsSubmitting(false)
          return
        }
      }

      if (!caption.trim()) {
        toast.error('Please add a caption')
        setIsSubmitting(false)
        return
      }

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, caption: caption.trim(), type, mediaUrl, backgroundColor }),
      })
      if (res.ok) {
        toast.success('Story posted!')
        setCaption(''); setStoryFile([]); setUploadedPreview(null); setStoryMode('gradient')
        setShowCreateStory(false); onCreated()
      }
    } catch { toast.error('Failed to post story') } finally { setIsSubmitting(false) }
  }

  return (
    <Dialog open={showCreateStory} onOpenChange={(open) => { if (!open) { setShowCreateStory(false); setStoryFile([]); setUploadedPreview(null); setStoryMode('gradient') } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2"><Camera className="h-5 w-5 text-emerald-600" />Create Story</DialogTitle>
          <DialogDescription className="sr-only">Create a new story</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Mode Toggle */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setStoryMode('gradient')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${storyMode === 'gradient' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              <span className="flex items-center justify-center gap-1.5"><Star className="h-3.5 w-3.5" /> Background</span>
            </button>
            <button onClick={() => setStoryMode('photo')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${storyMode === 'photo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              <span className="flex items-center justify-center gap-1.5"><ImagePlus className="h-3.5 w-3.5" /> Photo</span>
            </button>
          </div>

          {/* Preview */}
          <div className="relative aspect-[9/16] max-h-80 rounded-2xl overflow-hidden">
            {storyMode === 'photo' ? (
              <>
                {uploadedPreview ? (
                  <>
                    <img src={uploadedPreview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="text-white">
                        <p className="text-xl font-bold drop-shadow-lg">{caption || 'Your story caption...'}</p>
                        <p className="text-white/70 text-sm mt-1 flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{currentUser?.university || 'StudentMarket'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <FileUploader
                    value={storyFile}
                    orientation="vertical"
                    onValueChange={(files) => {
                      setStoryFile(files)
                      if (files.length > 0) setUploadedPreview(URL.createObjectURL(files[0]))
                    }}
                    dropzoneOptions={storyDropzone}
                    className="relative h-full"
                  >
                    <FileInput className="h-full outline-dashed outline-2 outline-emerald-300/50 bg-gray-900 hover:bg-gray-800 transition-colors rounded-2xl">
                      <div className="flex flex-col items-center justify-center h-full w-full gap-3">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                          <Upload className="h-8 w-8 text-white/70" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-white">
                            <span className="text-emerald-400">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-white/50 mt-1">JPG, PNG, GIF or WEBP (max 5MB)</p>
                        </div>
                      </div>
                    </FileInput>
                  </FileUploader>
                )}
                {uploadedPreview && (
                  <button onClick={() => { setUploadedPreview(null); setStoryFile([]) }} className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-end p-4" style={{ background: selectedGradient }}>
                <div className="text-white">
                  <p className="text-xl font-bold drop-shadow-lg">{caption || 'Your story caption...'}</p>
                  <p className="text-white/70 text-sm mt-1 flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{currentUser?.university || 'StudentMarket'}</p>
                </div>
              </div>
            )}
          </div>

          <div><Label className="text-sm font-medium">Caption</Label><Input placeholder="What&apos;s happening?" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} className="mt-1" /></div>

          {storyMode === 'gradient' && (
            <div><Label className="text-sm font-medium">Background</Label><div className="flex flex-wrap gap-2 mt-2">{GRADIENT_PRESETS.map((g, i) => (<button key={i} onClick={() => setSelectedGradient(g)} className={`w-10 h-10 rounded-full border-2 transition-all ${selectedGradient === g ? 'border-emerald-500 scale-110' : 'border-transparent'}`} style={{ background: g }} />))}</div></div>
          )}

          <Button onClick={handleCreate} disabled={isSubmitting || (storyMode === 'photo' && !storyFile.length && !caption.trim())} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-200/40 font-semibold">
            {isSubmitting ? <span className="flex items-center gap-2"><Upload className="h-4 w-4 animate-bounce" />Posting...</span> : 'Post Story'}
          </Button>
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
          <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl h-11 font-semibold shadow-lg shadow-emerald-200/40">{isLoading ? 'Signing in...' : 'Sign In'}</Button>
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
          <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl h-11 font-semibold shadow-lg shadow-emerald-200/40">{isLoading ? 'Creating account...' : 'Create Account'}</Button>
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
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Array<{
    id: string; type: string; title: string; body: string;
    sender: { id: string; name: string; avatar: string };
    conversationId: string;
    listing: { id: string; title: string; images: string } | null;
    createdAt: string;
  }>>([])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`)
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unreadCount)
        setNotifications(data.notifications)
      }
    } catch { /* ignore */ }
  }, [currentUser])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000) // poll every 15s
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleMarkRead = async (conversationId: string) => {
    if (!currentUser) return
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, conversationId }),
    })
    fetchNotifications()
    router.push(`/chat/${conversationId}`)
    setShowNotifications(false)
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50"><Tag className="h-5 w-5 text-white" /></div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">StudentMarket</h1>
              <p className="text-[10px] text-emerald-600 font-semibold leading-tight tracking-wide uppercase">South Africa</p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search textbooks, electronics, accommodation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 h-10 bg-white/70 border-gray-200/80 rounded-xl text-sm focus:bg-white focus:border-emerald-400 focus:ring-emerald-400/30 shadow-sm" />
              {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-gray-400 hover:text-gray-600" /></button>)}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Notification Bell */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl hover:bg-white/60 transition-all duration-200"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-200/50">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-transparent">
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">{unreadCount} unread</span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-10 text-center">
                            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Bell className="h-6 w-6 text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">No new notifications</p>
                            <p className="text-xs text-gray-400 mt-1">You&apos;re all caught up!</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleMarkRead(notif.conversationId)}
                              className="w-full px-4 py-3 text-left hover:bg-emerald-50/40 flex items-start gap-3 border-b border-gray-50/80 transition-colors"
                            >
                              <Avatar className="h-9 w-9 shrink-0 ring-2 ring-emerald-100">
                                <AvatarImage src={notif.sender.avatar || ''} />
                                <AvatarFallback className="text-xs bg-emerald-50">{notif.sender.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{notif.body}</p>
                                {notif.listing && (
                                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5 truncate">Re: {notif.listing.title}</p>
                                )}
                                <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                              </div>
                              <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shrink-0 mt-1.5 shadow-sm shadow-emerald-200" />
                            </button>
                          ))
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/50">
                          <button onClick={() => { router.push('/chat'); setShowNotifications(false) }} className="w-full text-center text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                            View all messages
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Chat icon */}
            {currentUser && (
              <button
                onClick={() => router.push('/chat')}
                className="relative p-2 rounded-xl hover:bg-white/60 transition-all duration-200"
              >
                <MessageSquare className="h-5 w-5 text-gray-600" />
              </button>
            )}

            {currentUser ? (
              <>
                {currentUser.verified && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 gap-1 text-xs hidden sm:flex shadow-sm">
                    <Shield className="h-3 w-3" /> Verified
                  </Badge>
                )}
                <div className="relative">
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/60 transition-all duration-200">
                    <Avatar className="h-8 w-8 ring-2 ring-emerald-100">
                      <AvatarImage src={currentUser.avatar || ''} />
                      <AvatarFallback className="text-[10px] bg-gradient-to-br from-emerald-50 to-teal-50">{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-semibold text-gray-700">{currentUser.name.split(' ')[0]}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-emerald-50/50 to-transparent">
                        <p className="text-sm font-bold">{currentUser.name}</p>
                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                        {currentUser.university && <p className="text-xs text-emerald-600 font-medium mt-0.5">{currentUser.university}</p>}
                      </div>
                      <button onClick={() => { router.push('/profile'); setShowUserMenu(false) }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-emerald-50/40 flex items-center gap-2.5 transition-colors">
                        <Settings className="h-4 w-4 text-gray-400" /> My Profile
                      </button>
                      <button onClick={() => { router.push('/chat'); setShowUserMenu(false) }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-emerald-50/40 flex items-center gap-2.5 transition-colors">
                        <MessageSquare className="h-4 w-4 text-gray-400" /> Messages
                      </button>
                      <button onClick={() => { setShowCreateStory(true); setShowUserMenu(false) }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-emerald-50/40 flex items-center gap-2.5 transition-colors">
                        <Camera className="h-4 w-4 text-gray-400" /> Create Story
                      </button>
                      <button onClick={() => { setViewMode('create'); setShowUserMenu(false) }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-emerald-50/40 flex items-center gap-2.5 transition-colors">
                        <Plus className="h-4 w-4 text-gray-400" /> New Listing
                      </button>
                      <button onClick={() => { router.push('/my-listings'); setShowUserMenu(false) }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-emerald-50/40 flex items-center gap-2.5 transition-colors">
                        <Tag className="h-4 w-4 text-gray-400" /> My Listings
                      </button>
                      <button onClick={() => { router.push('/wishlist'); setShowUserMenu(false) }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-emerald-50/40 flex items-center gap-2.5 transition-colors">
                        <Heart className="h-4 w-4 text-gray-400" /> Wishlist
                      </button>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={() => { logout(); setShowUserMenu(false); toast.success('Logged out'); router.push('/auth') }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-red-50 text-red-600 flex items-center gap-2.5">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Button onClick={() => setViewMode('login')} variant="outline" className="rounded-xl gap-1.5 text-sm font-medium border-gray-200/80 shadow-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            <Button onClick={() => currentUser ? setViewMode('create') : setViewMode('signup')} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl gap-1.5 text-sm font-semibold shadow-lg shadow-emerald-200/50">
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
    <div className="border-b border-gray-100/60 bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 py-2.5 overflow-x-auto no-scrollbar">
          <button onClick={() => setSelectedCategory('')} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${!selectedCategory ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200/40' : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md border border-gray-100'}`}>
            <LayoutGrid className="h-4 w-4" /> All
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${selectedCategory === cat.id ? 'text-white shadow-lg border-transparent' : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md border-gray-100'}`} style={selectedCategory === cat.id ? { backgroundColor: cat.color, borderColor: 'transparent' } : undefined}>
              {ICON_MAP[cat.icon]}
              <span className="hidden sm:inline">{cat.name}</span>
              {cat._count.listings > 0 && (<span className={`text-xs px-2 py-0.5 rounded-lg ${selectedCategory === cat.id ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'}`}>{cat._count.listings}</span>)}
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
    <div className="bg-white/50 backdrop-blur-sm border-b border-gray-100/60">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-medium transition-all duration-200 shadow-sm ${showFilters ? 'border-emerald-300 text-emerald-700 shadow-emerald-100' : 'border-gray-200/80 text-gray-700 hover:bg-gray-50 hover:shadow-md'}`}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {(selectedUniversity || selectedCondition) && <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-300" />}
          </button>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 flex-wrap">
                <Select value={selectedUniversity || 'all'} onValueChange={(v) => setSelectedUniversity(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-auto h-9 gap-1.5 text-sm border-gray-200/80 bg-white shadow-sm"><GraduationCap className="h-3.5 w-3.5 text-gray-500" /><SelectValue placeholder="University" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Universities</SelectItem>{universities.map((uni) => <SelectItem key={uni.id} value={uni.id}>{uni.shortName} ({uni._count.listings})</SelectItem>)}</SelectContent>
                </Select>
                <Select value={selectedCondition || 'all'} onValueChange={(v) => setSelectedCondition(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-auto h-9 gap-1.5 text-sm border-gray-200/80 bg-white shadow-sm"><CheckCircle2 className="h-3.5 w-3.5 text-gray-500" /><SelectValue placeholder="Condition" /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c.toLowerCase().includes('all') ? 'all' : c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                {(selectedUniversity || selectedCondition) && (<Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><X className="h-3 w-3 mr-1" /> Clear</Button>)}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="ml-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto h-9 gap-1.5 text-sm border-gray-200/80 bg-white shadow-sm"><ArrowUpDown className="h-3.5 w-3.5 text-gray-500" /><SelectValue /></SelectTrigger>
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
      <Card className="overflow-hidden cursor-pointer group border border-gray-200/80 hover:shadow-xl hover:shadow-gray-200/40 hover:border-emerald-200/60 transition-all duration-500 bg-white" onClick={onClick}>
        <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-t-2xl">
          {images[0] ? (
            <img src={images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50/80 via-gray-50 to-teal-50/80">
              <div className="text-center p-4 opacity-60 group-hover:opacity-80 transition-opacity">{ICON_MAP[listing.category.icon]}<p className="text-xs text-gray-400 mt-2 font-medium">{listing.category.name}</p></div>
            </div>
          )}
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Badge className="absolute top-2.5 left-2.5 text-[10px] font-semibold shadow-md" style={{ backgroundColor: listing.category.color + 'DD', color: 'white' }}>{listing.condition}</Badge>
          <div className="absolute bottom-2.5 left-2.5">
            <span className={`text-sm font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm ${listing.price === 0 ? 'bg-emerald-500/90' : 'bg-black/60 backdrop-blur-md'} text-white`}>{formatPrice(listing.price)}</span>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-2.5 right-2.5 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-medium shadow-sm">{images.length} photos</div>
          )}
        </div>
        <CardContent className="p-3.5">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5em] group-hover:text-emerald-800 transition-colors">{listing.title}</h3>
          <div className="flex items-center gap-2 mt-2.5">
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin className="h-3 w-3" /><span className="text-[11px] truncate">{listing.location}</span>
            </div>
            <span className="text-gray-200">·</span>
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="h-3 w-3" /><span className="text-[11px]">{timeAgo(listing.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <Avatar className="h-5 w-5 ring-1 ring-emerald-100"><AvatarImage src={listing.seller.avatar} /><AvatarFallback className="text-[8px] bg-emerald-50">{listing.seller.name.charAt(0)}</AvatarFallback></Avatar>
            <span className="text-[11px] text-gray-500 truncate font-medium">{listing.seller.name}</span>
            <div className="ml-auto flex items-center gap-1 text-gray-300">
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
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Search className="h-7 w-7 text-emerald-400" /></div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No listings found</h3>
        <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
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
          <Button type="submit" disabled={isSubmitting || isUploading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-11 rounded-xl font-semibold shadow-lg shadow-emerald-200/40">
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
    <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 text-white animated-gradient overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-emerald-300/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
              13+ Universities &middot; Trusted Platform
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Student Marketplace</h2>
            <p className="text-emerald-100/90 text-sm md:text-base max-w-lg leading-relaxed">Buy and sell textbooks, electronics, accommodation, and more with students across South Africa.</p>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-5 text-sm">
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm"><TrendingUp className="h-4 w-4" /> 27+ Active Listings</span>
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm"><Shield className="h-4 w-4" /> Verified Students</span>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-4 text-center">
            {[{ icon: <BookOpen className="h-6 w-6" />, label: 'Textbooks', count: '6' }, { icon: <Smartphone className="h-6 w-6" />, label: 'Electronics', count: '6' }, { icon: <Home className="h-6 w-6" />, label: 'Accommodation', count: '3' }].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="flex justify-center mb-2 opacity-90">{item.icon}</div>
                <p className="text-xs font-medium text-emerald-100">{item.label}</p>
                <p className="text-xl font-bold mt-0.5">{item.count}</p>
              </div>
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
    <footer className="border-t border-gray-100 bg-white/70 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4"><div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm"><Tag className="h-4 w-4 text-white" /></div><span className="font-bold text-gray-900">StudentMarket</span></div>
            <p className="text-xs text-gray-500 leading-relaxed">South Africa&apos;s student-to-student marketplace. Trusted by thousands.</p>
          </div>
          <div><h4 className="font-bold text-sm text-gray-900 mb-4">Popular Categories</h4><ul className="space-y-2 text-xs text-gray-500"><li className="hover:text-emerald-600 cursor-pointer transition-colors">Textbooks & Notes</li><li className="hover:text-emerald-600 cursor-pointer transition-colors">Electronics</li><li className="hover:text-emerald-600 cursor-pointer transition-colors">Accommodation</li><li className="hover:text-emerald-600 cursor-pointer transition-colors">Clothing</li></ul></div>
          <div><h4 className="font-bold text-sm text-gray-900 mb-4">Top Campuses</h4><ul className="space-y-2 text-xs text-gray-500"><li className="hover:text-emerald-600 cursor-pointer transition-colors">UCT</li><li className="hover:text-emerald-600 cursor-pointer transition-colors">Wits</li><li className="hover:text-emerald-600 cursor-pointer transition-colors">Stellenbosch</li><li className="hover:text-emerald-600 cursor-pointer transition-colors">CPUT</li></ul></div>
          <div><h4 className="font-bold text-sm text-gray-900 mb-4">Support</h4><ul className="space-y-2 text-xs text-gray-500"><li className="hover:text-emerald-600 cursor-pointer transition-colors">Help Centre</li><li className="hover:text-emerald-600 cursor-pointer transition-colors">Safety Tips</li><li className="hover:text-emerald-600 cursor-pointer transition-colors">Report a Problem</li><li className="hover:text-emerald-600 cursor-pointer transition-colors">Terms & Conditions</li></ul></div>
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
      <AuthGate />
    </Suspense>
  )
}

function AuthGate() {
  const router = useRouter()
  const { currentUser } = useMarketplaceStore()

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth')
    }
  }, [currentUser, router])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Tag className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-emerald-600 font-semibold">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return <MarketplacePage />
}

function MarketplacePage() {
  const searchParams = useSearchParams()
  const { searchQuery, selectedCategory, selectedUniversity, selectedCondition, sortBy, setViewMode, viewMode } = useMarketplaceStore()

  const [listings, setListings] = useState<ListingDetail[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Handle ?view=create from external links
  useEffect(() => {
    const view = searchParams.get('view')
    if (view === 'create' && viewMode !== 'create') {
      setViewMode('create')
    }
  }, [searchParams, viewMode, setViewMode])

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
              {Array.from({ length: 12 }).map((_, i) => <Card key={i} className="overflow-hidden border border-gray-100"><Skeleton className="aspect-square rounded-none" /><CardContent className="p-3.5 space-y-2"><Skeleton className="h-4 w-3/4 rounded-lg" /><Skeleton className="h-3 w-1/2 rounded-lg" /></CardContent></Card>)}
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
