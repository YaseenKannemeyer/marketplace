import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  seller: { id: string; name: string; avatar: string; university: string | null; campus: string | null; bio: string | null; phone: string | null }
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

export type AuthUser = {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  university: string | null
  campus: string | null
  bio: string | null
  verified: boolean
  profileImages?: string | null
}

export type StoryItem = {
  id: string
  userId: string
  type: string
  mediaUrl: string
  caption: string | null
  backgroundColor: string
  linkUrl: string | null
  createdAt: string
  expiresAt: string
}

export type StoryGroup = {
  user: {
    id: string
    name: string
    avatar: string | null
    university: string | null
    verified: boolean
  }
  stories: StoryItem[]
}

export type ConversationSummary = {
  id: string
  otherUser: { id: string; name: string; avatar: string; verified: boolean }
  listing: { id: string; title: string; price: number; images: string; status: string }
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  createdAt: string
}

export type ConversationMessage = {
  id: string
  conversationId: string
  senderId: string
  content: string
  messageType: string
  mediaUrl: string | null
  mediaDuration: number | null
  read: boolean
  createdAt: string
  sender: { id: string; name: string; avatar: string }
}

type ViewMode = 'browse' | 'detail' | 'create' | 'login' | 'signup'

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

  // Auth
  currentUser: AuthUser | null
  setCurrentUser: (user: AuthUser | null) => void
  logout: () => void

  // Legacy compat
  currentUserId: string | null

  // Stories
  viewingStoryGroup: StoryGroup | null
  viewingStoryIndex: number
  setViewingStoryGroup: (group: StoryGroup | null) => void
  setViewingStoryIndex: (index: number) => void
  showCreateStory: boolean
  setShowCreateStory: (show: boolean) => void

  // Reset filters
  resetFilters: () => void
}

export const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set) => ({
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

      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user, currentUserId: user?.id || null }),
      logout: () => set({ currentUser: null, currentUserId: null }),

      currentUserId: null as string | null,

      viewingStoryGroup: null,
      viewingStoryIndex: 0,
      setViewingStoryGroup: (group) => set({ viewingStoryGroup: group, viewingStoryIndex: 0 }),
      setViewingStoryIndex: (index) => set({ viewingStoryIndex: index }),
      showCreateStory: false,
      setShowCreateStory: (show) => set({ showCreateStory: show }),

      resetFilters: () =>
        set({
          searchQuery: '',
          selectedCategory: '',
          selectedUniversity: '',
          selectedCondition: '',
          sortBy: 'newest',
        }),
    }),
    {
      name: 'studentmarket-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentUserId: state.currentUserId,
      }),
    }
  )
)
