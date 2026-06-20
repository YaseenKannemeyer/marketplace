'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useMarketplaceStore, type ListingDetail, type ConversationMessage } from '@/store/marketplace'
import {
  ArrowLeft, ChevronLeft, ChevronRight, Heart, Share2,
  MapPin, Clock, Eye, CheckCircle2, GraduationCap,
  Shield, Star, Send, User, Phone, Flag,
  BookOpen, Smartphone, Home, Shirt, Car, Armchair,
  Dumbbell, Briefcase, Coffee, Gift, Tag, Trash2,
} from 'lucide-react'

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
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { currentUser } = useMarketplaceStore()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageIndex, setImageIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [contactTab, setContactTab] = useState<'chat' | 'info'>('chat')
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [startingChat, setStartingChat] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const listingId = params.id as string
  const isOwner = currentUser?.id === listing?.sellerId

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${listingId}`)
        if (res.ok) {
          const data = await res.json()
          setListing(data)
        } else {
          toast.error('Listing not found')
          router.push('/')
        }
      } catch {
        toast.error('Failed to load listing')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    if (listingId) fetchListing()
  }, [listingId, router])

  // Check wishlist status when listing loads
  useEffect(() => {
    if (currentUser && listingId) {
      fetch(`/api/wishlist/check?userId=${currentUser.id}&listingId=${listingId}`)
        .then(r => r.json())
        .then(data => setLiked(data.wishlisted))
        .catch(() => {})
    }
  }, [currentUser, listingId])

  // Auto-start or resume conversation
  const startConversation = useCallback(async () => {
    if (!currentUser || !listing || isOwner) return
    setStartingChat(true)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: currentUser.id,
          sellerId: listing.sellerId,
          listingId: listing.id,
        }),
      })
      if (res.ok) {
        const convo = await res.json()
        setConversationId(convo.id)
        const msgRes = await fetch(`/api/conversations/${convo.id}/messages?userId=${currentUser.id}`)
        if (msgRes.ok) setMessages(await msgRes.json())
      }
    } catch {
      toast.error('Failed to start conversation')
    } finally {
      setStartingChat(false)
    }
  }, [currentUser, listing, isOwner])

  // Poll for new messages
  useEffect(() => {
    if (!conversationId || !currentUser) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages?userId=${currentUser.id}`)
        if (res.ok) setMessages(await res.json())
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(interval)
  }, [conversationId, currentUser])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !currentUser) return
    const content = newMessage.trim()
    setNewMessage('')
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.id, content }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
      }
    } catch {
      toast.error('Failed to send message')
    }
  }

  const handleStartChat = () => {
    startConversation()
    setContactTab('chat')
  }

  // ─── Share ───
  const handleShare = async () => {
    const url = window.location.href
    const text = `${listing?.title} - ${formatPrice(listing?.price || 0)} on StudentMarket SA`

    if (navigator.share) {
      try {
        await navigator.share({ title: listing?.title || 'StudentMarket Listing', text, url })
      } catch (err) {
        // User cancelled or error
        if ((err as DOMException).name !== 'AbortError') {
          await fallbackCopy(url)
        }
      }
    } else {
      await fallbackCopy(url)
    }
  }

  const fallbackCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  // ─── Wishlist Toggle ───
  const handleWishlistToggle = async () => {
    if (!currentUser) {
      toast.error('Sign in to add to wishlist')
      router.push('/auth')
      return
    }
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, listingId }),
      })
      if (res.ok) {
        const data = await res.json()
        setLiked(data.action === 'added')
        toast.success(data.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist')
      }
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  // ─── Delete Listing ───
  const handleDeleteListing = async () => {
    if (!listing || !isOwner) return
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/listings/${listing.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Listing deleted successfully')
        router.push('/')
      } else {
        toast.error('Failed to delete listing')
      }
    } catch {
      toast.error('Failed to delete listing')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="lg:flex gap-6">
            <div className="lg:w-1/2">
              <Skeleton className="aspect-square w-full rounded-2xl" />
            </div>
            <div className="lg:w-1/2 mt-6 lg:mt-0 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) return null

  const images = JSON.parse(listing.images || '[]') as string[]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline text-sm font-medium">Back to Marketplace</span>
          </button>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-gray-500 truncate flex-1">{listing.title}</span>
          <div className="flex items-center gap-1">
            {/* Wishlist Heart */}
            <button
              onClick={(e) => { e.stopPropagation(); handleWishlistToggle() }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title={liked ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`h-5 w-5 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 hover:text-red-400'}`} />
            </button>
            {/* Share */}
            <button
              onClick={(e) => { e.stopPropagation(); handleShare() }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Share listing"
            >
              <Share2 className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
            {/* Delete for owner */}
            {isOwner && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteListing() }}
                className="p-2 rounded-full hover:bg-red-50 transition-colors"
                title="Delete listing"
                disabled={deleting}
              >
                <Trash2 className={`h-5 w-5 ${deleting ? 'text-gray-300 animate-pulse' : 'text-gray-400 hover:text-red-500'}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="lg:flex gap-8">
          {/* Left: Image Gallery */}
          <div className="lg:w-[55%]">
            <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden group">
              {images[0] ? (
                <img
                  src={images[imageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center p-8">
                    <div className="text-7xl text-gray-300 mb-4">{ICON_MAP[listing.category.icon]}</div>
                    <p className="text-gray-400">{listing.category.name}</p>
                  </div>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIndex(p => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setImageIndex(p => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                  {imageIndex + 1} / {images.length}
                </div>
              )}
              <Badge
                className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1"
                style={{ backgroundColor: listing.category.color + 'DD', color: 'white' }}
              >
                {listing.condition}
              </Badge>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === imageIndex ? 'border-emerald-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="lg:w-[45%] mt-6 lg:mt-0">
            {/* Category badge */}
            <Badge
              style={{ backgroundColor: listing.category.color, color: 'white' }}
              className="text-xs px-3 py-1"
            >
              {ICON_MAP_SM[listing.category.icon]}
              <span className="ml-1">{listing.category.name}</span>
            </Badge>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-3 leading-tight">
              {listing.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className={`text-3xl font-bold ${listing.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {formatPrice(listing.price)}
              </span>
              {listing.price > 0 && listing.negotiable && (
                <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                  Negotiable
                </span>
              )}
            </div>

            {/* Quick info grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[
                { icon: <CheckCircle2 className="h-4 w-4 text-gray-400" />, label: 'Condition', value: listing.condition },
                { icon: <MapPin className="h-4 w-4 text-gray-400" />, label: 'Location', value: listing.location },
                { icon: <Clock className="h-4 w-4 text-gray-400" />, label: 'Posted', value: timeAgo(listing.createdAt) },
                { icon: <Eye className="h-4 w-4 text-gray-400" />, label: 'Views', value: `${listing.views} views` },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-100">
                  {item.icon}
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* University badge */}
            {listing.university && (
              <div className="flex items-center gap-2.5 text-sm bg-emerald-50 border border-emerald-100 p-3 rounded-xl mt-3">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-700">{listing.university.name}</span>
                {listing.campus && (
                  <span className="text-emerald-500">- {listing.campus}</span>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                {listing.description}
              </p>
            </div>

            <Separator className="my-6" />

            {/* Seller Card */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Seller</h3>
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                <Avatar className="h-14 w-14 border-2 border-emerald-100">
                  <AvatarImage src={listing.seller.avatar} />
                  <AvatarFallback className="text-lg">{listing.seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{listing.seller.name}</p>
                    <Shield className="h-4 w-4 text-emerald-500" />
                  </div>
                  {listing.seller.university && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <GraduationCap className="h-3 w-3" />
                      {listing.seller.university}
                    </p>
                  )}
                  {listing.seller.bio && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{listing.seller.bio}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold">4.8</span>
                  </div>
                  <p className="text-xs text-gray-400">rating</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Owner actions */}
            {isOwner && (
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-700 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> This is your listing
                </div>
                <Button
                  onClick={handleDeleteListing}
                  disabled={deleting}
                  variant="destructive"
                  className="w-full rounded-xl h-11 font-semibold flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete Listing'}
                </Button>
              </div>
            )}

            {/* Contact / Chat Section */}
            {currentUser && !isOwner ? (
              <div>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setContactTab('chat')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      contactTab === 'chat'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Send className="h-4 w-4 inline mr-1.5" /> Message
                  </button>
                  <button
                    onClick={() => setContactTab('info')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      contactTab === 'info'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Phone className="h-4 w-4 inline mr-1.5" /> Contact Info
                  </button>
                </div>

                {contactTab === 'chat' && (
                  <>
                    {!conversationId ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Send className="h-7 w-7 text-emerald-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">Interested in this item?</h4>
                        <p className="text-sm text-gray-500 mb-4">Start a conversation with the seller</p>
                        <Button
                          onClick={handleStartChat}
                          disabled={startingChat}
                          className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8 h-11"
                        >
                          {startingChat ? 'Starting...' : 'Start Chat'}
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                        {/* Chat header */}
                        <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={listing.seller.avatar} />
                            <AvatarFallback>{listing.seller.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{listing.seller.name}</p>
                            <p className="text-xs text-emerald-600">Re: {listing.title}</p>
                          </div>
                          <button
                            onClick={() => router.push(`/chat/${conversationId}`)}
                            className="ml-auto text-xs text-emerald-600 font-medium hover:underline"
                          >
                            Full Chat
                          </button>
                        </div>

                        {/* Messages */}
                        <div className="h-64 overflow-y-auto p-4 space-y-3">
                          {messages.length === 0 && (
                            <p className="text-center text-sm text-gray-400 py-8">
                              Start the conversation! Say hello.
                            </p>
                          )}
                          {messages.map(msg => (
                            <div key={msg.id} className={`flex gap-2 ${msg.senderId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage src={msg.sender.avatar} />
                                <AvatarFallback className="text-[9px]">{msg.sender.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm ${
                                msg.senderId === currentUser.id
                                  ? 'bg-emerald-600 text-white rounded-tr-md'
                                  : 'bg-white border border-gray-200 text-gray-700 rounded-tl-md'
                              }`}>
                                <p>{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${msg.senderId === currentUser.id ? 'text-emerald-200' : 'text-gray-400'}`}>
                                  {timeAgo(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-4 py-3 bg-white border-t border-gray-100">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Type a message..."
                              value={newMessage}
                              onChange={e => setNewMessage(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                              className="flex-1 h-10 rounded-xl border-gray-200 text-sm"
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim()}
                              className="h-10 w-10 p-0 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {contactTab === 'info' && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="text-sm font-medium">{listing.seller.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-400">Meet-up Location</p>
                        <p className="text-sm font-medium">{listing.location}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : !currentUser ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-3">Sign in to message the seller</p>
                <Button
                  onClick={() => router.push('/auth')}
                  className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8"
                >
                  <User className="h-4 w-4 mr-2" /> Sign In
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
