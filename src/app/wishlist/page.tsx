'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/marketplace'
import { toast } from 'sonner'
import {
  ArrowLeft, Heart, MapPin, Clock, Eye, BookOpen, Smartphone,
  Home, Shirt, Car, Armchair, Dumbbell, Briefcase, Coffee, Gift,
  Trash2,
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

type WishlistItemData = {
  id: string
  userId: string
  listingId: string
  createdAt: string
  listing: {
    id: string
    title: string
    description: string
    price: number
    condition: string
    location: string
    images: string
    views: number
    status: string
    createdAt: string
    seller: { id: string; name: string; avatar: string; university: string | null }
    category: { id: string; name: string; icon: string; color: string }
    university: { id: string; name: string; shortName: string } | null
  }
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
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}

export default function WishlistPage() {
  const router = useRouter()
  const { currentUser } = useMarketplaceStore()
  const [items, setItems] = useState<WishlistItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth')
      return
    }
    fetchWishlist()
  }, [currentUser, router])

  const fetchWishlist = async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/wishlist?userId=${currentUser.id}`)
      if (res.ok) {
        setItems(await res.json())
      }
    } catch {
      toast.error('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (listingId: string) => {
    if (!currentUser) return
    setRemoving(listingId)
    try {
      const res = await fetch(`/api/wishlist?userId=${currentUser.id}&listingId=${listingId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setItems(prev => prev.filter(item => item.listingId !== listingId))
        toast.success('Removed from wishlist')
      }
    } catch {
      toast.error('Failed to remove item')
    } finally {
      setRemoving(null)
    }
  }

  if (!currentUser) return null

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
            <span className="hidden sm:inline text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            <h1 className="text-lg font-bold text-gray-900">My Wishlist</h1>
            {!loading && items.length > 0 && (
              <span className="text-sm text-gray-400">({items.length})</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-3.5 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-red-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Browse the marketplace and tap the heart icon on any listing to save it here for later.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl px-8 font-semibold shadow-lg shadow-emerald-200/40"
            >
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => {
              const images = JSON.parse(item.listing.images || '[]') as string[]
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden hover:shadow-xl hover:shadow-gray-200/40 hover:border-emerald-200/60 transition-all duration-500 group"
                >
                  <div
                    className="relative aspect-square bg-gray-50 overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/listing/${item.listingId}`)}
                  >
                    {images[0] ? (
                      <img
                        src={images[0]}
                        alt={item.listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50/80 via-gray-50 to-teal-50/80">
                        <div className="text-center p-4 opacity-60">
                          {ICON_MAP[item.listing.category.icon]}
                          <p className="text-xs text-gray-400 mt-2 font-medium">{item.listing.category.name}</p>
                        </div>
                      </div>
                    )}
                    {/* Price overlay */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm ${item.listing.price === 0 ? 'bg-emerald-500/90' : 'bg-black/60'} text-white`}>
                        {formatPrice(item.listing.price)}
                      </span>
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(item.listingId) }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-md"
                      disabled={removing === item.listingId}
                    >
                      {removing === item.listingId ? (
                        <div className="h-4 w-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
                      )}
                    </button>
                    {/* Condition badge */}
                    <span
                      className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm"
                      style={{ backgroundColor: item.listing.category.color + 'DD', color: 'white' }}
                    >
                      {item.listing.condition}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <h3
                      className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5em] hover:text-emerald-800 transition-colors cursor-pointer"
                      onClick={() => router.push(`/listing/${item.listingId}`)}
                    >
                      {item.listing.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span className="text-[11px] truncate">{item.listing.location}</span>
                      </div>
                      <span className="text-gray-200">·</span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span className="text-[11px]">{timeAgo(item.listing.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className="text-[10px] text-gray-400">Saved {timeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
