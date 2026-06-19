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
  MessageSquare, ChevronRight, Upload,
} from 'lucide-react'
import {
  FileUploader,
  FileInput,
  FileUploaderContent,
  FileUploaderItem,
} from '@/components/ui/file-upload'
import type { DropzoneOptions } from 'react-dropzone'

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

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File[]>([])
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Gallery photo upload
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)

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
    if (profileImages.length >= 6) { toast.error('Maximum 6 photos allowed'); return }
  }

  const removeProfileImage = (index: number) => {
    setProfileImages(prev => prev.filter((_, i) => i !== index))
  }

  const saveProfileImages = async () => {
    let finalImages = [...profileImages]

    // Upload new gallery files if any
    if (galleryFiles.length > 0) {
      setIsUploadingGallery(true)
      try {
        const formData = new FormData()
        galleryFiles.forEach(f => formData.append('files', f))
        formData.append('folder', 'profiles')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (uploadRes.ok) {
          const data = await uploadRes.json()
          finalImages = [...finalImages, ...data.urls]
        } else {
          toast.error('Failed to upload photos')
          setIsUploadingGallery(false)
          return
        }
      } catch {
        toast.error('Failed to upload photos')
        setIsUploadingGallery(false)
        return
      }
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, profileImages: finalImages }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCurrentUser(updated)
        setProfileImages(finalImages)
        setGalleryFiles([])
        toast.success('Photos updated!')
      }
    } catch {
      toast.error('Failed to update photos')
    } finally {
      setIsUploadingGallery(false)
    }
  }

  const uploadAvatar = async () => {
    if (avatarFile.length === 0) return
    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('files', avatarFile[0])
      formData.append('folder', 'avatars')
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (uploadRes.ok) {
        const data = await uploadRes.json()
        const newUrl = data.urls[0]
        setAvatarUrl(newUrl)
        // Auto-save avatar
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, avatar: newUrl }),
        })
        if (res.ok) {
          const updated = await res.json()
          setCurrentUser(updated)
          toast.success('Profile picture updated!')
        }
      } else {
        toast.error('Failed to upload profile picture')
      }
    } catch {
      toast.error('Failed to upload profile picture')
    } finally {
      setAvatarFile([])
      setIsUploadingAvatar(false)
    }
  }

  const SA_UNIVERSITIES = ['UCT', 'Wits', 'Stellenbosch', 'UP', 'UKZN', 'UJ', 'Rhodes', 'NWU', 'UFS', 'UL', 'CPUT', 'DUT', 'TUT', 'UNISA', 'Other']

  const passwordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return { score, label: score <= 1 ? 'Weak' : score <= 2 ? 'Fair' : score <= 3 ? 'Good' : 'Strong', color: score <= 1 ? 'bg-red-500' : score <= 2 ? 'bg-yellow-500' : score <= 3 ? 'bg-emerald-500' : 'bg-emerald-700' }
  }

  const avatarDropzone = {
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  } satisfies DropzoneOptions

  const galleryDropzone = {
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    multiple: true,
    maxFiles: 6,
    maxSize: 5 * 1024 * 1024,
  } satisfies DropzoneOptions

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

                {/* Avatar Upload */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Profile Picture</Label>
                  <div className="mt-3 flex items-center gap-5">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-4 border-gray-100">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">{name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <Camera className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex-1">
                        <FileUploader
                          value={avatarFile}
                          orientation="vertical"
                          onValueChange={(files) => {
                            setAvatarFile(files)
                            if (files.length > 0) uploadAvatar()
                          }}
                          dropzoneOptions={avatarDropzone}
                          className="relative"
                        >
                          <FileInput className="outline-dashed outline-2 outline-emerald-300/50 bg-emerald-50/50 hover:bg-emerald-50 transition-colors rounded-xl">
                            <div className="flex items-center gap-3 py-4 px-4 w-full">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                {isUploadingAvatar ? (
                                  <Upload className="h-5 w-5 text-emerald-600 animate-bounce" />
                                ) : (
                                  <Upload className="h-5 w-5 text-emerald-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  <span className="text-emerald-600">{isUploadingAvatar ? 'Uploading...' : 'Click to upload'}</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, GIF or WEBP (max 5MB)</p>
                              </div>
                            </div>
                          </FileInput>
                          <FileUploaderContent>
                            {avatarFile.map((file, i) => (
                              <FileUploaderItem
                                key={`avatar-${file.name}-${file.lastModified}`}
                                index={i}
                                className="size-16 p-0 rounded-lg overflow-hidden border"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </FileUploaderItem>
                            ))}
                          </FileUploaderContent>
                        </FileUploader>
                      </div>
                    )}
                  </div>
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
                  <p className="text-sm text-gray-500">Add up to 6 photos to your profile gallery</p>
                </div>

                {/* Upload dropzone */}
                {profileImages.length + galleryFiles.length < 6 && (
                  <FileUploader
                    value={galleryFiles}
                    orientation="vertical"
                    onValueChange={setGalleryFiles}
                    dropzoneOptions={galleryDropzone}
                    className="relative rounded-lg"
                  >
                    <FileInput className="outline-dashed outline-2 outline-emerald-300/50 bg-emerald-50/50 hover:bg-emerald-50 transition-colors rounded-xl">
                      <div className="flex flex-col items-center justify-center py-6 w-full">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                          <Upload className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          <span className="text-emerald-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF or WEBP (max 5MB each)</p>
                      </div>
                    </FileInput>
                    <FileUploaderContent className="flex flex-wrap gap-3 mt-3">
                      {galleryFiles.map((file, i) => (
                        <FileUploaderItem
                          key={`gallery-${file.name}-${file.lastModified}`}
                          index={i}
                          className="size-24 p-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
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
                )}

                {/* Photo grid - saved + pending */}
                <div className="grid grid-cols-3 gap-3">
                  {profileImages.map((img, i) => (
                    <div key={`saved-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeProfileImage(i)}
                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {(profileImages.length > 0 || galleryFiles.length > 0) && (
                  <Button
                    onClick={saveProfileImages}
                    disabled={isUploadingGallery}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 font-medium"
                  >
                    {isUploadingGallery ? (
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4 animate-bounce" />
                        Uploading photos...
                      </span>
                    ) : (
                      `Save Photos (${profileImages.length + galleryFiles.length}/6)`
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
