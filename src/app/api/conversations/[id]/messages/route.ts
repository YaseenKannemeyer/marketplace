import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const messages = await db.conversationMessage.findMany({
      where: { conversationId: id },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Mark messages as read
    if (userId) {
      await db.conversationMessage.updateMany({
        where: {
          conversationId: id,
          senderId: { not: userId },
          read: false,
        },
        data: { read: true },
      })
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { senderId, content } = body

    if (!senderId || !content) {
      return NextResponse.json({ error: 'Sender ID and content are required' }, { status: 400 })
    }

    // Create message
    const message = await db.conversationMessage.create({
      data: {
        conversationId: id,
        senderId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    })

    // Update conversation last message
    await db.conversation.update({
      where: { id },
      data: {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
