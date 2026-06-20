import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, avatar: true, university: true, campus: true, bio: true, phone: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
        university: { select: { id: true, name: true, shortName: true } },
        messages: {
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
            receiver: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Increment view count
    await db.listing.update({ where: { id }, data: { views: { increment: 1 } } })

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch the listing first to get image URLs for cleanup
    const listing = await db.listing.findUnique({
      where: { id },
      select: { images: true },
    })

    // Delete listing from database
    await db.listing.delete({ where: { id } })

    // Clean up images from Cloudinary (fire-and-forget, don't block the response)
    if (listing?.images) {
      try {
        const imageUrls: string[] = typeof listing.images === 'string'
          ? JSON.parse(listing.images)
          : Array.isArray(listing.images)
            ? listing.images
            : [];

        for (const url of imageUrls) {
          const publicId = getPublicIdFromUrl(url)
          if (publicId) {
            deleteFromCloudinary(publicId).catch((err) =>
              console.warn(`[Cloudinary] Failed to delete ${publicId}:`, err)
            )
          }
        }
      } catch (err) {
        console.warn('[Cloudinary] Image cleanup failed:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
