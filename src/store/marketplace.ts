import { create } from 'zustand'

export type ListingDetail = {
  id: string
  title: string
  description: string
  price: number
  negotiable: boolean
  condition: string
  categoryId: string
  universityId: string | null
  campus: string | null
  location: string
  images: string
  status: string
  views: number
  createdAt: string
  updatedAt: string
  sellerId: string
  seller: { id: string; name: string; avatar: string; university: string | null }
  category: { id: string; name: string; icon: string; color: string }
  university: { id: string; name: string; shortName: string } | null
}

export type Category = {
  id: string
  name: string
  icon: string
  color: string
  order: number
  _count: { listings: number }
}

export type University = {
  id: string
  name: string
  shortName: string
  province: string
  campuses: string
  _count: { listings: number }
}

export type Message = {
  id: string
  content: string
  listingId: string
  senderId: string
  receiverId: string
  read: boolean
  createdAt: string
  sender: { id: string; name: string; avatar: string }
  receiver: { id: string; name: string; avatar: string }
}

type ViewMode = 'browse' | 'detail' | 'create' | 'chat'

interface MarketplaceStore {
  // View state
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Selected listing for detail view
  selectedListing: ListingDetail | null
  setSelectedListing: (listing: ListingDetail | null) => void

  // Filters
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (categoryId: string) => void
  selectedUniversity: string
  setSelectedUniversity: (uniId: string) => void
  selectedCondition: string
  setSelectedCondition: (condition: string) => void
  sortBy: string
  setSortBy: (sort: string) => void

  // Chat
  currentChatListing: ListingDetail | null
  setCurrentChatListing: (listing: ListingDetail | null) => void

  // Current user (simulated)
  currentUserId: string
  setCurrentUserId: (id: string) => void

  // Reset filters
  resetFilters: () => void
}

export const useMarketplaceStore = create<MarketplaceStore>((set) => ({
  viewMode: 'browse',
  setViewMode: (mode) => set({ viewMode: mode }),

  selectedListing: null,
  setSelectedListing: (listing) => set({ selectedListing: listing }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: '',
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  selectedUniversity: '',
  setSelectedUniversity: (uniId) => set({ selectedUniversity: uniId }),
  selectedCondition: '',
  setSelectedCondition: (condition) => set({ selectedCondition: condition }),
  sortBy: 'newest',
  setSortBy: (sort) => set({ sortBy: sort }),

  currentChatListing: null,
  setCurrentChatListing: (listing) => set({ currentChatListing: listing }),

  currentUserId: 'user-1',
  setCurrentUserId: (id) => set({ currentUserId: id }),

  resetFilters: () =>
    set({
      searchQuery: '',
      selectedCategory: '',
      selectedUniversity: '',
      selectedCondition: '',
      sortBy: 'newest',
    }),
}))
