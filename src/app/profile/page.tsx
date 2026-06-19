'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useMarketplaceStore, type AuthUser } from '@/store/marketplace'
import {
  ArrowLeft, User, Mail, Phone, GraduationCap, MapPin,
  Shield, Camera, Edit3, Save, Lock, Eye, EyeOff,
  ImagePlus, X, CheckCircle2, BookOpen, ShoppingBag,
  MessageSquare, ChevronRight,
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { currentUser, setCurrentUser, logout } = useMarketplaceStore()

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'photos'>('profile')

  // Profile form state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [university, setUniversity] = useState('')
  const [campus, setCampus] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Profile images
  const [profileImages, setProfileImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  // Profile stats
  const [profileStats, setProfileStats] = useState<{
    listings: number
    sentMessages: number
    receivedMessages: number
    conversations: number
    createdAt: string
  } | null>(null)

  // Load profile data
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name)
      setBio(currentUser.bio || '')
      setPhone(currentUser.phone || '')
      setUniversity(currentUser.university || '')
      setCampus(currentUser.campus || '')
      setAvatarUrl(currentUser.avatar || '')
      setProfileImages(JSON.parse(currentUser.profileImages || '[]'))

      // Fetch profile stats
      fetch(`/api/profile?userId=${currentUser.id}`)
        .then(r => r.json())
        .then(data => {
          if (data._count) {
            setProfileStats({
              listings: data._count.listings,
              sentMessages: data._count.sentMessages,
              receivedMessages: data._count.receivedMessages,
              conversations: data._count.buyerConversations + data._count.sellerConversations,
              createdAt: data.createdAt,
            })
          }
        })
        .catch(() => {})
    }
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to view your profile</p>
          <Button onClick={() => router.push('/?view=login')} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error('Name is required'); return }
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: name.trim(),
          bio,
          phone,
          university,
          campus,
          avatar: avatarUrl,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCurrentUser(updated)
        setIsEditing(false)
        toast.success('Profile updated!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    setIsSavingPassword(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword,
          newPassword,
        }),
      })
      if (res.ok) {
        toast.success('Password updated!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update password')
      }
    } catch {
      toast.error('Failed to update password')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const addProfileImage = () => {
    if (!newImageUrl.trim()) return
    if (profileImages.length >= 6) { toast.error('Maximum 6 photos allowed'); return }
    setProfileImages(prev => [...prev, newImageUrl.trim()])
    setNewImageUrl('')
  }

  const removeProfileImage = (index: number) => {
    setProfileImages(prev => prev.filter((_, i) => i !== index))
  }

  const saveProfileImages = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, profileImages }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCurrentUser(updated)
        toast.success('Photos updated!')
      }
    } catch {
      toast.error('Failed to update photos')
    }
  }

  const SA_UNIVERSITIES = ['UCT', 'Wits', 'Stellenbosch', 'UP', 'UKZN', 'UJ', 'Rhodes', 'NWU', 'UFS', 'UL', 'CPUT', 'DUT', 'TUT', 'UNISA', 'Other']

  const passwordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500' }
    if (score <= 2) return { label: 'Fair', color: 'bg-yellow-500' }
    if (score <= 3) return { label: 'Good', color: 'bg-emerald-500' }
    return { label: 'Strong', color: 'bg-emerald-700' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1 text-center">My Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header Card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>
          {/* Avatar + Info */}
          <div className="px-6 pb-6 -mt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">{name.charAt(0)}</AvatarFallback>
                </Avatar>
                {currentUser.verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                  {currentUser.verified && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 text-xs">
                      <Shield className="h-3 w-3" /> Verified Student
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{currentUser.email}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                  {university && (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      <GraduationCap className="h-3 w-3" /> {university}
                    </span>
                  )}
                  {campus && (
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      <MapPin className="h-3 w-3" /> {campus}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl text-sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats */}
        {profileStats && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { icon: <ShoppingBag className="h-4 w-4 text-emerald-600" />, label: 'Listings', value: profileStats.listings },
              { icon: <MessageSquare className="h-4 w-4 text-blue-600" />, label: 'Chats', value: profileStats.conversations },
              { icon: <BookOpen className="h-4 w-4 text-purple-600" />, label: 'Messages', value: profileStats.sentMessages + profileStats.receivedMessages },
              { icon: <Shield className="h-4 w-4 text-amber-600" />, label: 'Joined', value: new Date(profileStats.createdAt).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }) },
            ].map(stat => (
              <Card key={stat.label} className="border-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="flex justify-center mb-1">{stat.icon}</div>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-6 bg-gray-100 p-1 rounded-xl">
          {[
            { id: 'profile' as const, label: 'Edit Profile', icon: <Edit3 className="h-4 w-4" /> },
            { id: 'password' as const, label: 'Password', icon: <Lock className="h-4 w-4" /> },
            { id: 'photos' as const, label: 'Photos', icon: <Camera className="h-4 w-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Card className="mt-4 border-0 shadow-sm">
          <CardContent className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 rounded-xl text-sm">
                      <Edit3 className="h-4 w-4" /> Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => {
                        setIsEditing(false)
                        setName(currentUser.name)
                        setBio(currentUser.bio || '')
                        setPhone(currentUser.phone || '')
                      }} className="rounded-xl text-sm">Cancel</Button>
                      <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 gap-2 rounded-xl text-sm">
                        <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Avatar URL */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Profile Picture URL</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={avatarUrl}
                      onChange={e => setAvatarUrl(e.target.value)}
                      placeholder="https://api.dicebear.com/..."
                      disabled={!isEditing}
                      className="flex-1"
                    />
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">DiceBear avatar URLs work great</p>
                </div>

                {/* Name */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} disabled={!isEditing} className="mt-1.5" />
                </div>

                {/* Email (read-only) */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input value={currentUser.email} disabled className="bg-gray-50" />
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input value={phone} onChange={e => setPhone(e.target.value)} disabled={!isEditing} placeholder="+27 XX XXX XXXX" className="pl-10" />
                  </div>
                </div>

                {/* University */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">University</Label>
                    <Input value={university} onChange={e => setUniversity(e.target.value)} disabled={!isEditing} placeholder="e.g., UCT" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Campus</Label>
                    <Input value={campus} onChange={e => setCampus(e.target.value)} disabled={!isEditing} placeholder="e.g., Upper Campus" className="mt-1.5" />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell others about yourself..."
                    className="mt-1.5 min-h-[100px]"
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/300</p>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h3>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Current Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">New Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      required
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full ${i <= passwordStrength(newPassword).score ? passwordStrength(newPassword).color : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{passwordStrength(newPassword).label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showNewPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {confirmPassword && newPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button type="submit" disabled={isSavingPassword} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 font-medium">
                  {isSavingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}

            {activeTab === 'photos' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile Photos</h3>
                  <p className="text-sm text-gray-500">Add up to 6 photos to your profile (max 6)</p>
                </div>

                {/* Photo grid */}
                <div className="grid grid-cols-3 gap-3">
                  {profileImages.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeProfileImage(i)}
                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {profileImages.length < 6 && (
                    <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <ImagePlus className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Add photo URL */}
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL..."
                    className="flex-1"
                    onKeyDown={e => e.key === 'Enter' && addProfileImage()}
                  />
                  <Button onClick={addProfileImage} disabled={!newImageUrl.trim()} variant="outline" className="rounded-xl">
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>

                <Button onClick={saveProfileImages} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                  Save Photos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
