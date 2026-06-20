# Work Log - StudentMarket Project

---
Task ID: 1
Agent: Main Agent
Task: Migrate file upload system from local disk to Cloudinary + add postinstall + create .env.example

Work Log:
- Explored entire upload system: found /api/upload (write to disk), /api/files (serve from disk), file-upload.tsx (dropzone UI)
- Found all frontend consumers of file URLs (page.tsx, profile, chat, listing pages) — no frontend changes needed since they render whatever URL is stored in DB
- Created /src/lib/cloudinary.ts with uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl utilities
- Rewrote /api/upload/route.ts to use Cloudinary upload_stream instead of fs.writeFile
- Kept /api/files/[...path]/route.ts for backward compatibility (serves old local files)
- Added Cloudinary image cleanup to /api/listings/[id]/route.ts DELETE handler
- Added "postinstall": "prisma generate" to package.json scripts
- Created .env.example with all required variables documented
- Installed cloudinary@2.10.0 npm package
- Verified build passes with 0 errors (28 routes compiled)

Stage Summary:
- Upload system now uploads to Cloudinary cloud storage (works on Vercel)
- Old /api/files/ URLs still work for seed data (backward compatible)
- Listing deletion now cleans up Cloudinary images
- postinstall script ensures Prisma Client is generated on every deploy
- .env.example provides a template for all required environment variables
