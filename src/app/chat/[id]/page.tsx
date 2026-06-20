'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useMarketplaceStore, type ConversationSummary, type ConversationMessage } from '@/store/marketplace'
import {
  ArrowLeft, Send, ShoppingBag, ExternalLink,
  GraduationCap, Shield, ChevronRight,
  Image as ImageIcon, Video, Mic, MicOff, Camera,
  Paperclip, X, Play, Pause,
} from 'lucide-react'

function formatPrice(price: number): string {
  if (price === 0) return 'Free'
  return `R${price.toLocaleString('en-ZA')}`
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
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

// Linkify text — turn URLs into clickable <a> tags
function linkifyText(text: string) {
  const urlRegex = /(https?:\/\/[^\s<>"']+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300 break-all"
        >
          {part}
        </a>
      )
    }
    // Reset regex lastIndex
    urlRegex.lastIndex = 0
    return <span key={i}>{part}</span>
  })
}

// ─── Voice Message Player ───
function VoicePlayer({ url, duration, isMe }: { url: string; duration: number; isMe: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().catch(() => {})
      setPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (audio && audio.duration) {
      setProgress(audio.currentTime / audio.duration)
    }
  }

  const handleEnded = () => setPlaying(false)

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <audio ref={audioRef} src={url} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} preload="metadata" />
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-emerald-600 text-white'}`}
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="h-1 rounded-full overflow-hidden bg-black/10">
          <div
            className="h-full rounded-full bg-current transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-[10px] opacity-60">{formatDuration(duration)}</span>
      </div>
    </div>
  )
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)

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
      if (res.ok) setMessages(await res.json())
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

  useEffect(() => {
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 500)
  }, [loading])

  // ─── Send text message ───
  const handleSendText = async () => {
    if (!newMessage.trim() || !currentUser || !conversationId) return
    const content = newMessage.trim()
    setNewMessage('')
    setIsSending(true)
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.id, content, messageType: 'text' }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        fetchConversation()
      } else {
        setNewMessage(content)
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

  // ─── Send media message (image or video) ───
  const sendMediaMessage = async (file: File, messageType: 'image' | 'video') => {
    if (!currentUser || !conversationId) return
    setIsSending(true)
    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('folder', 'chat')
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) {
        toast.error('Failed to upload file')
        return
      }
      const { urls } = await uploadRes.json()
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          content: messageType === 'image' ? '📷 Photo' : '🎥 Video',
          messageType,
          mediaUrl: urls[0],
        }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        fetchConversation()
      }
    } catch {
      toast.error('Failed to send')
    } finally {
      setIsSending(false)
    }
  }

  // ─── Voice recording ───
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm' })
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
        setIsSending(true)
        try {
          const formData = new FormData()
          formData.append('files', file)
          formData.append('folder', 'chat')
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
          if (!uploadRes.ok) { toast.error('Failed to upload voice note'); return }
          const { urls } = await uploadRes.json()
          const res = await fetch(`/api/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              senderId: currentUser!.id,
              content: '🎤 Voice note',
              messageType: 'voice',
              mediaUrl: urls[0],
              mediaDuration: recordingTime,
            }),
          })
          if (res.ok) {
            const msg = await res.json()
            setMessages(prev => [...prev, msg])
            fetchConversation()
          }
        } catch { toast.error('Failed to send voice note') }
        finally { setIsSending(false) }
      }
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      recordingIntervalRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch {
      toast.error('Could not access microphone. Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
    }
  }

  // ─── Camera capture ───
  const handleCapturePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await sendMediaMessage(file, 'image')
    }
    e.target.value = ''
  }

  // ─── File handlers ───
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
      await sendMediaMessage(file, 'image')
    }
    e.target.value = ''
  }

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) { toast.error('Video must be under 50MB'); return }
      await sendMediaMessage(file, 'video')
    }
    e.target.value = ''
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
          <Button onClick={() => router.push('/auth')} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">Sign In</Button>
        </div>
      </div>
    )
  }

  const images = conversation ? JSON.parse(conversation.listing.images || '[]') as string[] : []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleImageSelect} />
      <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoSelect} />
      <input ref={cameraInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={handleCapturePhoto} />

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white"><X className="h-8 w-8" /></button>
          <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setPreviewVideo(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10"><X className="h-8 w-8" /></button>
          <video src={previewVideo} controls autoPlay className="max-w-full max-h-full rounded-xl" />
        </div>
      )}

      {/* Chat Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/chat')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </button>
            {conversation && (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conversation.otherUser.avatar} />
                  <AvatarFallback className="text-sm">{conversation.otherUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">{conversation.otherUser.name}</p>
                    {conversation.otherUser.verified && <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-emerald-600 truncate">Re: {conversation.listing.title}</p>
                </div>
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
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Listing card */}
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
                <p className="text-xs text-gray-400 mt-1">Send a message, photo, video, or voice note</p>
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
                          {/* Message bubble */}
                          <div className={`rounded-2xl overflow-hidden ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-tr-md'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-md shadow-sm'
                          }`}>
                            {/* Text message with clickable links */}
                            {msg.messageType === 'text' && (
                              <div className="px-4 py-2.5 text-sm leading-relaxed">
                                {linkifyText(msg.content)}
                              </div>
                            )}

                            {/* Image message */}
                            {msg.messageType === 'image' && msg.mediaUrl && (
                              <div className="cursor-pointer" onClick={() => setPreviewImage(msg.mediaUrl)}>
                                <img
                                  src={msg.mediaUrl}
                                  alt="Shared photo"
                                  className="max-w-full rounded-2xl"
                                  style={{ maxHeight: 280, minWidth: 180 }}
                                />
                              </div>
                            )}

                            {/* Video message */}
                            {msg.messageType === 'video' && msg.mediaUrl && (
                              <div className="cursor-pointer" onClick={() => setPreviewVideo(msg.mediaUrl)}>
                                <video
                                  src={msg.mediaUrl}
                                  className="max-w-full rounded-2xl"
                                  style={{ maxHeight: 280, minWidth: 180 }}
                                  preload="metadata"
                                  muted
                                  playsInline
                                />
                                <div className="relative -mt-8 flex items-center justify-center h-8 bg-black/40">
                                  <Play className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            )}

                            {/* Voice message */}
                            {msg.messageType === 'voice' && msg.mediaUrl && (
                              <div className="px-3 py-2.5">
                                <VoicePlayer
                                  url={msg.mediaUrl}
                                  duration={msg.mediaDuration || 0}
                                  isMe={isMe}
                                />
                              </div>
                            )}

                            {/* Caption for non-text messages */}
                            {msg.messageType !== 'text' && msg.content && !['📷 Photo', '🎥 Video', '🎤 Voice note'].includes(msg.content) && (
                              <div className="px-4 pb-2 text-sm leading-relaxed">
                                {linkifyText(msg.content)}
                              </div>
                            )}
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

      {/* Recording indicator */}
      {isRecording && (
        <div className="bg-red-50 border-t border-red-100 py-2 px-4">
          <div className="max-w-3xl mx-auto flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-600">Recording</span>
            </div>
            <span className="text-sm text-red-500 font-mono">{formatDuration(recordingTime)}</span>
            <Button
              onClick={stopRecording}
              size="sm"
              className="bg-red-500 hover:bg-red-600 rounded-xl h-8 px-4 text-sm"
            >
              <MicOff className="h-3.5 w-3.5 mr-1.5" /> Send
            </Button>
          </div>
        </div>
      )}

      {/* Message Input Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shrink-0">
        <div className="max-w-3xl mx-auto px-3 py-2">
          {/* Quick action row */}
          <div className="flex items-center gap-1 mb-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors"
              title="Send photo"
              disabled={isSending}
            >
              <ImageIcon className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors"
              title="Send video"
              disabled={isSending}
            >
              <Video className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors"
              title="Take photo"
              disabled={isSending}
            >
              <Camera className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'hover:bg-gray-100 text-gray-400 hover:text-emerald-600'
              }`}
              title={isRecording ? 'Stop recording' : 'Record voice note'}
              disabled={isSending}
            >
              {isRecording ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
            </button>
          </div>

          {/* Text input + send */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendText()
                }
              }}
              className="flex-1 h-11 rounded-xl border-gray-200 text-sm focus:border-emerald-400 focus:ring-emerald-400"
              disabled={loading || isSending}
            />
            <Button
              onClick={handleSendText}
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
