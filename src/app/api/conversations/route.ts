import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get all conversations where user is buyer or seller
    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            status: true,
          },
        },
        buyer: {
          select: { id: true, name: true, avatar: true, verified: true },
        },
        seller: {
          select: { id: true, name: true, avatar: true, verified: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    // Format conversations
    const formatted = conversations.map(c => {
      const otherUser = c.buyerId === userId ? c.seller : c.buyer
      return {
        id: c.id,
        otherUser,
        listing: c.listing,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unreadCount: c._count.messages,
        createdAt: c.createdAt,
      }
    })

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { buyerId, sellerId, listingId } = body

    if (!buyerId || !sellerId || !listingId) {
      return NextResponse.json({ error: 'Buyer ID, seller ID, and listing ID are required' }, { status: 400 })
    }

    if (buyerId === sellerId) {
      return NextResponse.json({ error: 'Cannot start conversation with yourself' }, { status: 400 })
    }

    // Check if conversation already exists
    const existing = await db.conversation.findFirst({
      where: {
        AND: [
          { listingId },
          {
            OR: [
              { buyerId, sellerId },
              { buyerId: sellerId, sellerId: buyerId },
            ],
          },
        ],
      },
      include: {
        listing: { select: { id: true, title: true, price: true, images: true } },
        buyer: { select: { id: true, name: true, avatar: true, verified: true } },
        seller: { select: { id: true, name: true, avatar: true, verified: true } },
      },
    })

    if (existing) {
      const otherUser = existing.buyerId === buyerId ? existing.seller : existing.buyer
      return NextResponse.json({
        id: existing.id,
        otherUser,
        listing: existing.listing,
        lastMessage: existing.lastMessage,
        lastMessageAt: existing.lastMessageAt,
        createdAt: existing.createdAt,
      })
    }

    // Create new conversation
    const conversation = await db.conversation.create({
      data: { buyerId, sellerId, listingId },
      include: {
        listing: { select: { id: true, title: true, price: true, images: true } },
        buyer: { select: { id: true, name: true, avatar: true, verified: true } },
        seller: { select: { id: true, name: true, avatar: true, verified: true } },
      },
    })

    const otherUser = conversation.buyerId === buyerId ? conversation.seller : conversation.buyer

    return NextResponse.json({
      id: conversation.id,
      otherUser,
      listing: conversation.listing,
      lastMessage: null,
      lastMessageAt: null,
      createdAt: conversation.createdAt,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
