import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/wishlist/check?userId=xxx&listingId=xxx — check if a listing is wishlisted
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const listingId = searchParams.get('listingId')

    if (!userId || !listingId) {
      return NextResponse.json({ error: 'userId and listingId are required' }, { status: 400 })
    }

    const item = await db.wishlistItem.findUnique({
      where: { userId_listingId: { userId, listingId } },
    })

    return NextResponse.json({ wishlisted: !!item })
  } catch (error) {
    console.error('Error checking wishlist:', error)
    return NextResponse.json({ error: 'Failed to check wishlist' }, { status: 500 })
  }
}
