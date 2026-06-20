'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useMarketplaceStore, type ListingDetail } from '@/store/marketplace'
import { toast } from 'sonner'
import {
  ArrowLeft, Plus, MapPin, Clock, Eye, Trash2, Edit3, Package,
  BookOpen, Smartphone, Home, Shirt, Car, Armchair, Dumbbell,
  Briefcase, Coffee, Gift, Tag, Search,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

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

export default function MyListingsPage() {
  const router = useRouter()
  const { currentUser } = useMarketplaceStore()
  const [listings, setListings] = useState<ListingDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth')
      return
    }
    fetchMyListings()
  }, [currentUser, router])

  const fetchMyListings = async () => {
    if (!currentUser) return
    try {
      // Use the listings API with a sellerId filter approach - fetch all and filter client side
      const res = await fetch('/api/listings?limit=200')
      if (res.ok) {
        const data = await res.json()
        // Filter listings belonging to current user (include all statuses)
        const myListings = data.listings.filter(
          (l: ListingDetail) => l.sellerId === currentUser.id
        )
        setListings(myListings)
      }
    } catch {
      toast.error('Failed to load your listings')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return
    setDeleting(listingId)
    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: 'DELETE' })
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== listingId))
        toast.success('Listing deleted')
      } else {
        toast.error('Failed to delete listing')
      }
    } catch {
      toast.error('Failed to delete listing')
    } finally {
      setDeleting(null)
    }
  }

  const filteredListings = searchQuery
    ? listings.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings

  const totalViews = listings.reduce((sum, l) => sum + l.views, 0)

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
            <Package className="h-5 w-5 text-emerald-600" />
            <h1 className="text-lg font-bold text-gray-900">My Listings</h1>
          </div>
          <div className="ml-auto">
            <Button
              onClick={() => router.push('/?view=create')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl h-9 px-4 text-sm font-semibold shadow-lg shadow-emerald-200/40 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Listing</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats bar */}
        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Total Listings</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{listings.filter(l => l.status === 'active').length}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Active</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Total Views</p>
            </div>
          </div>
        )}

        {/* Search */}
        {listings.length > 3 && (
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search my listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-200 rounded-xl text-sm"
            />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex">
                <Skeleton className="w-40 h-40 shrink-0" />
                <div className="p-4 flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/3 rounded-lg" />
                  <Skeleton className="h-3 w-full rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-emerald-300" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 text-sm">No listings match &quot;{searchQuery}&quot;</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">You haven&apos;t listed anything yet</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Start selling by creating your first listing. It&apos;s free and easy!
                </p>
                <Button
                  onClick={() => router.push('/?view=create')}
                  className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl px-8 font-semibold shadow-lg shadow-emerald-200/40"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Listing
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => {
              const images = JSON.parse(listing.images || '[]') as string[]
              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden hover:shadow-lg hover:shadow-gray-200/40 hover:border-emerald-200/60 transition-all duration-300 group"
                >
                  <div className="flex">
                    {/* Image */}
                    <div
                      className="w-40 h-40 shrink-0 bg-gray-50 overflow-hidden cursor-pointer relative"
                      onClick={() => router.push(`/listing/${listing.id}`)}
                    >
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50/80 via-gray-50 to-teal-50/80">
                          {ICON_MAP[listing.category.icon]}
                        </div>
                      )}
                      <Badge
                        className="absolute top-1.5 left-1.5 text-[9px] font-semibold px-1.5 py-0.5"
                        style={{ backgroundColor: listing.category.color + 'DD', color: 'white' }}
                      >
                        {listing.condition}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-3.5 flex flex-col min-w-0">
                      <h3
                        className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug cursor-pointer hover:text-emerald-700 transition-colors"
                        onClick={() => router.push(`/listing/${listing.id}`)}
                      >
                        {listing.title}
                      </h3>

                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formatPrice(listing.price)}
                      </p>

                      <div className="flex items-center gap-2 mt-auto pt-2">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Eye className="h-3 w-3" />
                          <span className="text-[11px]">{listing.views}</span>
                        </div>
                        <span className="text-gray-200">·</span>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span className="text-[11px]">{timeAgo(listing.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 rounded-lg text-xs font-medium border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
                          onClick={() => router.push(`/listing/${listing.id}`)}
                        >
                          <Edit3 className="h-3 w-3 mr-1" /> View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-xs font-medium border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                          onClick={() => handleDelete(listing.id)}
                          disabled={deleting === listing.id}
                        >
                          {deleting === listing.id ? (
                            <div className="h-3 w-3 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
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
