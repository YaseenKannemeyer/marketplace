---
Task ID: 2
Agent: Main Agent
Task: Add login/signup with email validation and Stories Tray

Work Log:
- Updated Prisma schema with password, verified fields on User model and new Story model
- Created API routes: /api/auth/login, /api/auth/signup, /api/auth/verify-email, /api/stories
- Email validation: checks format regex, SA student domains (.ac.za auto-verified), password strength (8+ chars, uppercase, number)
- Built Login dialog with email/password fields and show/hide toggle
- Built Signup dialog with name, email, university, password strength indicator, confirm password
- Built Stories Tray with gradient ring borders, verified badge, user avatars, horizontal scroll
- Built Story Viewer full-screen overlay with progress bars, auto-advance timer (5s), gradient/image backgrounds, caption, university info
- Built Create Story dialog with gradient picker and caption preview
- User dropdown menu with Create Story, New Listing, Sign Out options
- Zustand persist middleware for auth state persistence
- Fixed issues: EyeOpen icon not in lucide-react, z-index Tailwind 4 compatibility, story viewer timer loop

Stage Summary:
- Login/Signup system with email validation working
- 12 stories seeded across 8 users with gradient and image backgrounds
- Story Viewer with auto-advance, progress bars, and tap navigation
- Auth state persisted across page reloads
- Mobile responsive verified
