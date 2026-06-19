'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMarketplaceStore, type ListingDetail, type Category, type University, type Message } from '@/store/marketplace'
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
  Search,
  Plus,
  MapPin,
  Clock,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  BookOpen,
  Smartphone,
  Home,
  Shirt,
  Car,
  Armchair,
  Dumbbell,
  Briefcase,
  Coffee,
  Gift,
  ArrowUpDown,
  Send,
  User,
  GraduationCap,
  LayoutGrid,
  SlidersHorizontal,
  TrendingUp,
  CheckCircle2,
  Tag,
  Star,
  Shield,
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

const SA_PROVINCES = [
  'All Provinces',
  'Western Cape',
  'Gauteng',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'North West',
  'Mpumalanga',
  'Northern Cape',
]

const CONDITIONS = ['All Conditions', 'New', 'Like New', 'Good', 'Fair', 'Used']

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

// ─── Header Component ───
function Header() {
  const { searchQuery, setSearchQuery, setViewMode, currentUserId, setCurrentUserId } = useMarketplaceStore()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">StudentMarket</h1>
              <p className="text-[10px] text-emerald-600 font-medium leading-tight">South Africa</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search textbooks, electronics, accommodation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 bg-gray-50 border-gray-200 rounded-full text-sm focus:bg-white focus:border-emerald-400 focus:ring-emerald-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Select value={currentUserId} onValueChange={setCurrentUserId}>
              <SelectTrigger className="w-auto h-10 gap-1.5 rounded-full border-gray-200 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user-1">Sipho Mkhize (UCT)</SelectItem>
                <SelectItem value="user-2">Thandi Ndlovu (Wits)</SelectItem>
                <SelectItem value="user-3">Kgosi Molefe (SU)</SelectItem>
                <SelectItem value="user-4">Lerato Mahlangu (UP)</SelectItem>
                <SelectItem value="user-5">Bongani Dlamini (UKZN)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setViewMode('create')}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-full gap-1.5 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Sell</span>
            </Button>
          </div>
        </div>
      </div>
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
          <button
            onClick={() => setSelectedCategory('')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              !selectedCategory
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedCategory === cat.id ? { backgroundColor: cat.color } : undefined}
            >
              {ICON_MAP[cat.icon]}
              <span className="hidden sm:inline">{cat.name}</span>
              {cat._count.listings > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {cat._count.listings}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Filter Bar ───
function FilterBar({ universities }: { universities: University[] }) {
  const {
    selectedUniversity,
    setSelectedUniversity,
    selectedCondition,
    setSelectedCondition,
    sortBy,
    setSortBy,
    resetFilters,
  } = useMarketplaceStore()
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {(selectedUniversity || selectedCondition) && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 flex-wrap"
              >
                <Select value={selectedUniversity || 'all'} onValueChange={(v) => setSelectedUniversity(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-auto h-9 gap-1.5 text-sm border-gray-200 bg-white">
                    <GraduationCap className="h-3.5 w-3.5 text-gray-500" />
                    <SelectValue placeholder="University" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Universities</SelectItem>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.id}>
                        {uni.shortName} ({uni._count.listings})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCondition || 'all'} onValueChange={(v) => setSelectedCondition(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-auto h-9 gap-1.5 text-sm border-gray-200 bg-white">
                    <CheckCircle2 className="h-3.5 w-3.5 text-gray-500" />
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c.toLowerCase().includes('all') ? 'all' : c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(selectedUniversity || selectedCondition) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-9 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sort - right side */}
          <div className="ml-auto flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto h-9 gap-1.5 text-sm border-gray-200 bg-white">
                <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="overflow-hidden cursor-pointer group border-gray-200 hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
        onClick={onClick}
      >
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {images[0] ? (
            <img
              src={images[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center p-4">
                {ICON_MAP[listing.category.icon]}
                <p className="text-xs text-gray-400 mt-2">{listing.category.name}</p>
              </div>
            </div>
          )}
          {/* Condition badge */}
          <Badge
            className="absolute top-2 left-2 text-[10px] font-medium"
            style={{ backgroundColor: listing.category.color + 'DD', color: 'white' }}
          >
            {listing.condition}
          </Badge>
          {/* Price */}
          <div className="absolute bottom-2 left-2">
            <span className={`text-lg font-bold px-2.5 py-1 rounded-lg ${
              listing.price === 0
                ? 'bg-green-500 text-white'
                : 'bg-white/95 text-gray-900 backdrop-blur-sm'
            }`}>
              {formatPrice(listing.price)}
            </span>
          </div>
          {/* Heart */}
          <button
            className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation() }}
          >
            <Heart className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug mb-1.5">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={listing.seller.avatar} />
                <AvatarFallback className="text-[8px]">{listing.seller.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500 truncate max-w-[80px]">{listing.seller.name.split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {listing.views}
              </span>
              <span>{timeAgo(listing.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Listing Grid ───
function ListingGrid({ listings, onSelectListing }: { listings: ListingDetail[]; onSelectListing: (l: ListingDetail) => void }) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No listings found</h3>
        <p className="text-sm text-gray-400 text-center max-w-sm">
          Try adjusting your filters or search terms to find what you&apos;re looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onClick={() => onSelectListing(listing)}
        />
      ))}
    </div>
  )
}

// ─── Listing Detail Dialog ───
function ListingDetailDialog() {
  const {
    selectedListing,
    setSelectedListing,
    setViewMode,
    currentUserId,
  } = useMarketplaceStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [imageIndex, setImageIndex] = useState(0)
  const [liked, setLiked] = useState(false)

  const images = selectedListing ? JSON.parse(selectedListing.images || '[]') as string[] : []
  const isOpen = !!selectedListing

  useEffect(() => {
    if (selectedListing) {
      fetch(`/api/listings/${selectedListing.id}/messages`)
        .then((r) => r.json())
        .then((data) => setMessages(data))
        .catch(() => {})
    }
  }, [selectedListing])

  const handleSendMessage = async () => {
    if (!selectedListing || !newMessage.trim()) return
    const msg = newMessage.trim()
    setNewMessage('')
    try {
      const res = await fetch(`/api/listings/${selectedListing.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: msg,
          senderId: currentUserId,
          receiverId: selectedListing.sellerId,
        }),
      })
      if (res.ok) {
        const newMsg = await res.json()
        setMessages((prev) => [...prev, newMsg])
      }
    } catch {
      toast.error('Failed to send message')
    }
  }

  const handleClose = () => {
    setSelectedListing(null)
    setImageIndex(0)
  }

  if (!selectedListing) return null

  const isOwner = currentUserId === selectedListing.sellerId

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="md:flex">
          {/* Left - Images */}
          <div className="md:w-1/2 bg-gray-100">
            <div className="relative aspect-square">
              {images[0] ? (
                <img
                  src={images[imageIndex]}
                  alt={selectedListing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    {ICON_MAP[selectedListing.category.icon] &&
                      <div className="text-6xl text-gray-300 mb-3">{ICON_MAP[selectedListing.category.icon]}</div>
                    }
                    <p className="text-sm text-gray-400">{selectedListing.category.name}</p>
                  </div>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === imageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-1 p-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      i === imageIndex ? 'border-emerald-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Details */}
          <div className="md:w-1/2 p-5">
            <DialogHeader className="space-y-2 mb-4">
              <div className="flex items-start justify-between">
                <Badge style={{ backgroundColor: selectedListing.category.color, color: 'white' }} className="text-xs">
                  {ICON_MAP_SM[selectedListing.category.icon]}
                  <span className="ml-1">{selectedListing.category.name}</span>
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLiked(!liked)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Share2 className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <DialogTitle className="text-xl leading-tight">{selectedListing.title}</DialogTitle>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${selectedListing.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {formatPrice(selectedListing.price)}
                </span>
                {selectedListing.price > 0 && selectedListing.negotiable && (
                  <span className="text-sm text-emerald-600 font-medium">Negotiable</span>
                )}
              </div>
              <DialogDescription className="sr-only">View listing details and contact the seller</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mb-5">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs">Condition</p>
                    <p className="font-medium">{selectedListing.condition}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs">Location</p>
                    <p className="font-medium truncate">{selectedListing.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs">Posted</p>
                    <p className="font-medium">{timeAgo(selectedListing.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs">Views</p>
                    <p className="font-medium">{selectedListing.views} views</p>
                  </div>
                </div>
              </div>

              {/* University */}
              {selectedListing.university && (
                <div className="flex items-center gap-2 text-sm bg-emerald-50 p-2.5 rounded-lg">
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-emerald-700">{selectedListing.university.name}</span>
                  {selectedListing.campus && (
                    <span className="text-emerald-500">• {selectedListing.campus}</span>
                  )}
                </div>
              )}

              <Separator />

              {/* Description */}
              <div>
                <h4 className="font-semibold text-sm mb-1.5">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedListing.description}</p>
              </div>

              <Separator />

              {/* Seller */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Seller</h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedListing.seller.avatar} />
                    <AvatarFallback>{selectedListing.seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm">{selectedListing.seller.name}</p>
                      <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    {selectedListing.seller.university && (
                      <p className="text-xs text-gray-500">{selectedListing.seller.university}</p>
                    )}
                    {selectedListing.seller.bio && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{selectedListing.seller.bio}</p>
                    )}
                  </div>
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-medium text-gray-600">4.8</span>
                </div>
              </div>
            </div>

            {/* Contact / Message */}
            {!isOwner && (
              <>
                <Separator />
                <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-3">Message Seller</h4>

                  {/* Messages */}
                  {messages.length > 0 && (
                    <div className="max-h-48 overflow-y-auto space-y-2 mb-3 p-3 bg-gray-50 rounded-xl">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-2 ${msg.senderId === currentUserId ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={msg.sender.avatar} />
                            <AvatarFallback className="text-[8px]">{msg.sender.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-sm ${
                            msg.senderId === currentUserId
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700'
                          }`}>
                            <p>{msg.content}</p>
                            <p className={`text-[10px] mt-0.5 ${msg.senderId === currentUserId ? 'text-emerald-200' : 'text-gray-400'}`}>
                              {timeAgo(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 h-10 rounded-xl border-gray-200"
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
              </>
            )}

            {isOwner && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl text-sm text-amber-700 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                This is your listing
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Create Listing Dialog ───
function CreateListingDialog({
  categories,
  universities,
  onCreated,
}: {
  categories: Category[]
  universities: University[]
  onCreated: () => void
}) {
  const { viewMode, setViewMode, currentUserId } = useMarketplaceStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [campus, setCampus] = useState('')
  const [location, setLocation] = useState('')
  const [condition, setCondition] = useState('Used')
  const [negotiable, setNegotiable] = useState(true)
  const [imageUrls, setImageUrls] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !categoryId || !location) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsSubmitting(true)
    try {
      const images = imageUrls
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean)
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price) || 0,
          categoryId,
          universityId: universityId || null,
          campus,
          location,
          condition,
          negotiable,
          images,
          sellerId: currentUserId,
        }),
      })
      if (res.ok) {
        toast.success('Listing created successfully!')
        setViewMode('browse')
        onCreated()
      } else {
        toast.error('Failed to create listing')
      }
    } catch {
      toast.error('Failed to create listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={viewMode === 'create'} onOpenChange={(open) => !open && setViewMode('browse')}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4 text-emerald-600" />
            </div>
            Create New Listing
          </DialogTitle>
          <DialogDescription className="sr-only">Create a new listing to sell your items</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Images */}
          <div>
            <Label className="text-sm font-medium">Photos (one URL per line)</Label>
            <Textarea
              placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              className="mt-1.5 min-h-[80px] text-sm"
            />
          </div>

          {/* Title */}
          <div>
            <Label className="text-sm font-medium">Title *</Label>
            <Input
              placeholder="What are you selling?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">Description *</Label>
            <Textarea
              placeholder="Describe your item in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 min-h-[100px]"
              required
            />
          </div>

          {/* Price and Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Price (ZAR)</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">R</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-8"
                  min="0"
                />
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-gray-600">Price is negotiable</span>
              </label>
            </div>
            <div>
              <Label className="text-sm font-medium">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      {ICON_MAP_SM[cat.icon]}
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* University */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">University</Label>
              <Select value={universityId || 'none'} onValueChange={(v) => setUniversityId(v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {universities.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id}>
                      {uni.shortName} - {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Campus</Label>
              <Input
                placeholder="e.g., Upper Campus"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="text-sm font-medium">Location *</Label>
            <Input
              placeholder="e.g., UCT, Rondebosch"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 rounded-xl font-medium"
          >
            {isSubmitting ? 'Creating...' : 'Publish Listing'}
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
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Student Marketplace
            </h2>
            <p className="text-emerald-100 text-sm md:text-base max-w-lg">
              Buy and sell textbooks, electronics, accommodation, and more with students across South Africa.
              Trusted by students at 10+ universities.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                <TrendingUp className="h-4 w-4" /> 27+ Active Listings
              </span>
              <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                <Shield className="h-4 w-4" /> Verified Students
              </span>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-3 text-center">
            {[
              { icon: <BookOpen className="h-6 w-6" />, label: 'Textbooks', count: '6' },
              { icon: <Smartphone className="h-6 w-6" />, label: 'Electronics', count: '6' },
              { icon: <Home className="h-6 w-6" />, label: 'Accommodation', count: '3' },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="flex justify-center mb-1">{item.icon}</div>
                <p className="text-xs font-medium">{item.label}</p>
                <p className="text-lg font-bold">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Loading Skeleton ───
function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square" />
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </CardContent>
        </Card>
      ))}
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
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Tag className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">StudentMarket</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              South Africa&apos;s student-to-student marketplace. Buy and sell with campus confidence.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Popular Categories</h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li className="hover:text-emerald-600 cursor-pointer">Textbooks & Notes</li>
              <li className="hover:text-emerald-600 cursor-pointer">Electronics</li>
              <li className="hover:text-emerald-600 cursor-pointer">Accommodation</li>
              <li className="hover:text-emerald-600 cursor-pointer">Clothing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Top Campuses</h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li className="hover:text-emerald-600 cursor-pointer">UCT</li>
              <li className="hover:text-emerald-600 cursor-pointer">Wits</li>
              <li className="hover:text-emerald-600 cursor-pointer">Stellenbosch</li>
              <li className="hover:text-emerald-600 cursor-pointer">University of Pretoria</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Support</h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li className="hover:text-emerald-600 cursor-pointer">Help Centre</li>
              <li className="hover:text-emerald-600 cursor-pointer">Safety Tips</li>
              <li className="hover:text-emerald-600 cursor-pointer">Report a Problem</li>
              <li className="hover:text-emerald-600 cursor-pointer">Terms & Conditions</li>
            </ul>
          </div>
        </div>
        <Separator className="my-6" />
        <p className="text-xs text-gray-400 text-center">
          Made with care for South African students.
        </p>
      </div>
    </footer>
  )
}

// ─── Main Page ───
export default function MarketplacePage() {
  const {
    viewMode,
    setViewMode,
    setSelectedListing,
    searchQuery,
    selectedCategory,
    selectedUniversity,
    selectedCondition,
    sortBy,
  } = useMarketplaceStore()

  const [listings, setListings] = useState<ListingDetail[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [universities, setUniversities] = useState<University[]>([])
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
      if (res.ok) {
        const data = await res.json()
        setListings(data.listings)
      }
    } catch {
      toast.error('Failed to load listings')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedUniversity, selectedCondition, sortBy])

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories).catch(() => {})
    fetch('/api/universities').then((r) => r.json()).then(setUniversities).catch(() => {})
  }, [])

  useEffect(() => {
    fetchListings()
  }, [fetchListings, refreshKey])

  const handleSelectListing = (listing: ListingDetail) => {
    setSelectedListing(listing)
  }

  const handleCreated = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {viewMode === 'browse' && (
        <>
          <CategoryBar categories={categories} />
          <FilterBar universities={universities} />

          <HeroBanner />

          <main className="flex-1">
            {isLoading ? (
              <LoadingGrid />
            ) : (
              <ListingGrid listings={listings} onSelectListing={handleSelectListing} />
            )}
          </main>
        </>
      )}

      <ListingDetailDialog />

      <CreateListingDialog
        categories={categories}
        universities={universities}
        onCreated={handleCreated}
      />

      <Footer />
    </div>
  )
}
