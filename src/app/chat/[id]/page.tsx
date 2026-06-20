'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useMarketplaceStore, type ConversationSummary, type ConversationMessage } from '@/store/marketplace'
import {
  ArrowLeft, Send, ShoppingBag, ExternalLink,
  GraduationCap, Shield, ChevronRight, Phone,
  MapPin, Image as ImageIcon,
} from 'lucide-react'

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

export default function ChatConversationPage() {
  const params = useParams()
  const router = useRouter()
  const { currentUser } = useMarketplaceStore()

  const [conversation, setConversation] = useState<ConversationSummary | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const conversationId = params.id as string

  // Fetch conversation info
  const fetchConversation = useCallback(async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/conversations?userId=${currentUser.id}`)
      if (res.ok) {
        const convos = await res.json()
        const convo = convos.find((c: ConversationSummary) => c.id === conversationId)
        if (convo) setConversation(convo)
      }
    } catch { /* ignore */ }
  }, [currentUser, conversationId])

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!currentUser || !conversationId) return
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages?userId=${currentUser.id}`)
      if (res.ok) {
        setMessages(await res.json())
      }
    } catch { /* ignore */ }
  }, [currentUser, conversationId])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchConversation()
      await fetchMessages()
      setLoading(false)
    }
    init()
  }, [fetchConversation, fetchMessages])

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 500)
  }, [loading])

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser || !conversationId) return
    const content = newMessage.trim()
    setNewMessage('')
    setIsSending(true)
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.id, content }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        fetchConversation() // Update last message
      } else {
        setNewMessage(content) // Restore on failure
        toast.error('Failed to send message')
      }
    } catch {
      setNewMessage(content)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
          <Button onClick={() => router.push('/?view=login')} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const images = conversation ? JSON.parse(conversation.listing.images || '[]') as string[] : []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen">
      {/* Chat Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chat')}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Other user */}
            {conversation && (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conversation.otherUser.avatar} />
                  <AvatarFallback className="text-sm">{conversation.otherUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">{conversation.otherUser.name}</p>
                    {conversation.otherUser.verified && (
                      <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-emerald-600 truncate">
                    Re: {conversation.listing.title}
                  </p>
                </div>

                {/* View listing button */}
                <button
                  onClick={() => router.push(`/listing/${conversation.listing.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium hover:bg-emerald-100 transition-colors"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {formatPrice(conversation.listing.price)}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </>
            )}

            {!conversation && !loading && (
              <p className="text-sm text-gray-500">Conversation not found</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Listing card at top */}
          {conversation && (
            <div className="px-4 py-3">
              <button
                onClick={() => router.push(`/listing/${conversation.listing.id}`)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors text-left"
              >
                {images[0] ? (
                  <img src={images[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{conversation.listing.title}</p>
                  <p className="text-sm font-bold text-emerald-600">{formatPrice(conversation.listing.price)}</p>
                  <p className="text-[10px] text-gray-400">Tap to view listing</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="px-4 pb-4 space-y-3">
            {loading ? (
              <div className="space-y-3 py-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className={`max-w-[70%] h-12 bg-gray-200 rounded-2xl ${i % 2 === 0 ? 'rounded-tr-md' : 'rounded-tl-md'}`} />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Start the conversation</p>
                <p className="text-xs text-gray-400 mt-1">Say hello and ask about the item</p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === currentUser.id
                  const showDate = i === 0 ||
                    new Date(msg.createdAt).toDateString() !== new Date(messages[i - 1].createdAt).toDateString()

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center gap-2 my-4">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-[10px] text-gray-400 font-medium px-2">
                            {new Date(msg.createdAt).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      )}
                      <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                          <AvatarImage src={msg.sender.avatar} />
                          <AvatarFallback className="text-[10px]">{msg.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-tr-md'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-md shadow-sm'
                          }`}>
                            {msg.content}
                          </div>
                          <p className={`text-[10px] mt-1 px-1 ${isMe ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                            {timeAgo(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              className="flex-1 h-11 rounded-xl border-gray-200 text-sm focus:border-emerald-400 focus:ring-emerald-400"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending || loading}
              className="h-11 w-11 p-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
