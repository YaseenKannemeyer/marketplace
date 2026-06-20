---
Task ID: 1
Agent: Super Z (main)
Task: Add share button, wishlist system, remove listing, and my-listings page

Work Log:
- Read entire codebase to understand existing structure (page.tsx, listing/[id]/page.tsx, profile, auth, prisma schema, store, API routes)
- Added WishlistItem model to Prisma schema with userId/listingId unique constraint and cascading deletes
- Ran `prisma db push` to sync DB schema
- Created `/api/wishlist/route.ts` with GET (list user wishlist), POST (toggle add/remove), DELETE (remove)
- Created `/api/wishlist/check/route.ts` to check if a specific listing is wishlisted by a user
- Updated `/listing/[id]/page.tsx` with:
  - Working Share button (Web Share API with clipboard fallback)
  - Working Wishlist/Heart toggle button (persists to DB)
  - Remove/Delete listing button for sellers (with confirmation dialog)
- Created `/wishlist/page.tsx` - full wishlist page with grid layout, remove buttons, empty state
- Created `/my-listings/page.tsx` - seller's listings page with stats bar (total/active/views), search, delete buttons
- Added "My Listings" and "Wishlist" links to the user dropdown menu in the header
- Added `useSearchParams` to handle `?view=create` URL param for the New Listing button
- Built project successfully with zero errors, all APIs tested

Stage Summary:
- Wishlist feature: fully working with DB persistence, toggle on listing detail page, dedicated page
- Share: uses Web Share API (mobile) with clipboard fallback (desktop)
- Remove listing: DELETE button for owners on detail page + my-listings page
- My Listings page: shows all user's listings with stats, search, and delete capability
- All 4 new routes: /wishlist, /my-listings, /api/wishlist, /api/wishlist/check
