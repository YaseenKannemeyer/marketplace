import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/wishlist?userId=xxx — fetch all wishlist items for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const items = await db.wishlistItem.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            seller: { select: { id: true, name: true, avatar: true, university: true } },
            category: { select: { id: true, name: true, icon: true, color: true } },
            university: { select: { id: true, name: true, shortName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

// POST /api/wishlist — add item to wishlist (toggle)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, listingId } = body

    if (!userId || !listingId) {
      return NextResponse.json({ error: 'userId and listingId are required' }, { status: 400 })
    }

    // Check if already exists
    const existing = await db.wishlistItem.findUnique({
      where: { userId_listingId: { userId, listingId } },
    })

    if (existing) {
      // Remove it (toggle off)
      await db.wishlistItem.delete({ where: { id: existing.id } })
      return NextResponse.json({ action: 'removed', id: existing.id })
    } else {
      // Add it
      const item = await db.wishlistItem.create({
        data: { userId, listingId },
        include: {
          listing: {
            include: {
              seller: { select: { id: true, name: true, avatar: true, university: true } },
              category: { select: { id: true, name: true, icon: true, color: true } },
              university: { select: { id: true, name: true, shortName: true } },
            },
          },
        },
      })
      return NextResponse.json({ action: 'added', item }, { status: 201 })
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error)
    return NextResponse.json({ error: 'Failed to toggle wishlist' }, { status: 500 })
  }
}

// DELETE /api/wishlist — remove item from wishlist
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const listingId = searchParams.get('listingId')

    if (!userId || !listingId) {
      return NextResponse.json({ error: 'userId and listingId are required' }, { status: 400 })
    }

    await db.wishlistItem.delete({
      where: { userId_listingId: { userId, listingId } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
