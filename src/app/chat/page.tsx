'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
// Separator import removed - was incorrect (imported from skeleton instead of separator component)
import { toast } from 'sonner'
import { useMarketplaceStore, type ConversationSummary } from '@/store/marketplace'
import {
  ArrowLeft, Search, MessageSquare, Plus, GraduationCap,
  Shield, Clock, ShoppingBag,
} from 'lucide-react'

function formatPrice(price: number): string {
  if (price === 0) return 'Free'
  return `R${price.toLocaleString('en-ZA')}`
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}

export default function ChatPage() {
  const router = useRouter()
  const { currentUser } = useMarketplaceStore()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [totalUnread, setTotalUnread] = useState(0)

  const fetchConversations = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const res = await fetch(`/api/conversations?userId=${currentUser.id}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
        setTotalUnread(data.reduce((sum: number, c: ConversationSummary) => sum + c.unreadCount, 0))
      }
    } catch {
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-500 mb-6">Sign in to view your messages</p>
          <Button onClick={() => router.push('/?view=login')} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const filteredConversations = conversations.filter(c =>
    c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:inline">Marketplace</span>
            </button>
            <h1 className="text-lg font-bold text-gray-900 flex-1">
              Messages
              {totalUnread > 0 && (
                <Badge className="ml-2 bg-emerald-600 text-white text-xs px-2">{totalUnread}</Badge>
              )}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Search */}
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Conversation List */}
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {searchQuery ? 'No results found' : 'No conversations yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery ? 'Try a different search term' : 'Start a conversation by messaging a seller'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/')} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                Browse Listings
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map(convo => {
              const images = JSON.parse(convo.listing.images || '[]') as string[]
              return (
                <button
                  key={convo.id}
                  onClick={() => router.push(`/chat/${convo.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Other user avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={convo.otherUser.avatar} />
                      <AvatarFallback className="text-sm">{convo.otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {convo.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {convo.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${convo.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
                        {convo.otherUser.name}
                      </p>
                      {convo.otherUser.verified && (
                        <Shield className="h-3 w-3 text-blue-500 shrink-0" />
                      )}
                      <span className="text-xs text-gray-400 ml-auto shrink-0">
                        {timeAgo(convo.lastMessageAt)}
                      </span>
                    </div>

                    {/* Last message */}
                    <p className={`text-xs truncate mt-0.5 ${convo.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                      {convo.lastMessage || 'No messages yet'}
                    </p>

                    {/* Listing reference */}
                    <div className="flex items-center gap-2 mt-1.5">
                      {images[0] ? (
                        <img src={images[0]} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-600 truncate font-medium">{convo.listing.title}</p>
                        <p className="text-[10px] text-emerald-600 font-medium">{formatPrice(convo.listing.price)}</p>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
