---
Task ID: 1
Agent: Main
Task: Add profile section, email validation for SA student numbers, separate product page, and full user-to-user chat system

Work Log:
- Updated Prisma schema: added Conversation, ConversationMessage models, profileImages field on User
- Created seed data: 10 users (including 219045678@mycput.ac.za), 6 conversations with 20+ messages
- Updated signup API: accepts student number emails (219045678@mycput.ac.za), added 26 SA university domains including subdomains
- Created API routes: /api/profile (GET/PUT), /api/profile/password (PUT), /api/conversations (GET/POST), /api/conversations/[id]/messages (GET/POST)
- Created /listing/[id] page: full product detail with image gallery, thumbnail strip, seller card, inline chat, contact info tabs
- Created /profile page: edit name/bio/phone/university/campus/avatar, change password with strength meter, manage profile photos
- Created /chat page: conversation list with unread badges, search, listing references
- Created /chat/[id] page: full chat interface with message history, date separators, real-time polling, listing card reference
- Updated main page: listing cards now navigate to /listing/[id], header has profile/chat/message links, removed old dialog-based detail view

Stage Summary:
- Build successful, all 20 routes verified (pages + APIs)
- 27 listings, 10 users, 6 conversations, 14 stories seeded
- Email validation supports: 219045678@mycput.ac.za format, sipho@uct.ac.za format, and 26+ SA domains
- Chat system: conversation creation, message send/receive, unread tracking, real-time polling

---
Task ID: 2
Agent: Main
Task: Replace product listing image upload with drag-and-drop file uploader

Work Log:
- Installed react-dropzone dependency
- Created /src/components/ui/file-upload.tsx with FileUploader, FileInput, FileUploaderContent, FileUploaderItem components
- Created /api/upload route with file type validation, 5MB size limit, unique filename generation, saves to public/uploads/listings/
- Updated CreateListingDialog in page.tsx: replaced textarea URL input with drag-and-drop FileUploader component
- Added file preview thumbnails with size labels, remove button on hover, max 4 files
- Added upload progress state with animated upload indicator
- Build passes with zero errors, /api/upload route registered

Stage Summary:
- CreateListingDialog now uses a polished drag-and-drop image uploader matching the uilayouts file-upload pattern
- Users can click to browse or drag-and-drop images (JPG, PNG, GIF, WEBP up to 5MB each, max 4 photos)
- Images are uploaded to /api/upload which saves to public/uploads/listings/ and returns URLs
- File previews show image thumbnails with size labels and hover-to-remove buttons

---
Task ID: 3
Agent: Main
Task: Replace profile picture and gallery photo inputs with drag-and-drop file uploaders

Work Log:
- Updated /api/upload route: added folder parameter supporting 'listings', 'profiles', 'avatars'
- Created public/uploads/profiles and public/uploads/avatars directories
- Updated profile page: added FileUploader imports and DropzoneOptions for avatar (single file) and gallery (multi file)
- Replaced avatar URL text input with drag-and-drop uploader that auto-uploads on file select
- Replaced gallery photo URL paste input with drag-and-drop uploader for profile photos
- Gallery shows saved photos in grid + pending uploads as thumbnails with size labels
- Fixed passwordStrength type error (was missing score property)

Stage Summary:
- Profile picture now uses a drag-and-drop dropzone (single image, auto-saves on upload)
- Gallery photos use the same FileUploader component (up to 6 photos, drag-and-drop)
- All uploads go through /api/upload with folder-specific paths
- Build passes with zero errors

---
Task ID: 4
Agent: Main
Task: Fix image uploads, add story photo upload, add notification system

Work Log:
- FIXED: Rewrote /api/upload to save files to project-root /uploads/ directory (not public/) with mkdir recursive safety
- Created /api/files/[...path] route to serve uploaded images with MIME detection, caching, and directory traversal protection
- Updated CreateStoryDialog: added Background/Photo toggle, full drag-and-drop image uploader for photo stories, preview with remove button
- Updated Header: added Bell notification icon with pulsing red badge (unread count), dropdown showing latest unread messages with sender avatar, message preview, listing reference, and mark-as-read on click
- Created /api/notifications route: GET returns unread count + latest 10 notifications, PUT marks messages as read
- Notifications poll every 15 seconds for real-time updates

Stage Summary:
- Image uploads now write to project-root /uploads/ and served via /api/files/ — works reliably in dev and production
- Stories support two modes: gradient backgrounds (existing) and photo upload (new, drag-and-drop)
- Notification bell in header shows unread message count, dropdown with message previews, click to navigate to chat and auto-mark-read
- Build passes with 22 routes, zero errors

---
Task ID: 5
Agent: Main
Task: Fix profile pic upload, create gated auth page

Work Log:
- FIXED: Profile picture upload bug — uploadAvatar() was reading stale avatarFile state (React batching). Changed to pass file directly as parameter.
- Created /auth page: beautiful full-page login/signup with split layout (hero left, form right), SA university branding, institutional email validation, password strength meter
- Created AuthGate component on main page: redirects to /auth when no currentUser in Zustand
- All sign-out buttons redirect to /auth after logout
- Profile page redirects to /auth via useEffect (not during render)

Stage Summary:
- Profile picture upload now works: file is passed directly to uploadAvatar(file) instead of reading from stale state
- /auth is now the entry point — users must sign in or create account before seeing any listings
- Beautiful auth page with hero panel (desktop), login/signup toggle, university selector, password strength
- Build passes with 23 routes, zero errors
