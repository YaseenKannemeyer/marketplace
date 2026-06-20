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
    const { senderId, content, messageType, mediaUrl, mediaDuration } = body

    if (!senderId) {
      return NextResponse.json({ error: 'Sender ID is required' }, { status: 400 })
    }

    // For text messages, content is required. For media, mediaUrl is required.
    const type = messageType || 'text'
    if (type === 'text' && !content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }
    if ((type === 'image' || type === 'video' || type === 'voice') && !mediaUrl) {
      return NextResponse.json({ error: 'Media URL is required for this message type' }, { status: 400 })
    }

    // Build the summary text for the conversation's lastMessage field
    let lastMessageText = content || ''
    if (type === 'image') lastMessageText = '📷 Photo'
    if (type === 'video') lastMessageText = '🎥 Video'
    if (type === 'voice') lastMessageText = '🎤 Voice note'

    // Create message
    const message = await db.conversationMessage.create({
      data: {
        conversationId: id,
        senderId,
        content: content || '',
        messageType: type,
        mediaUrl: mediaUrl || null,
        mediaDuration: mediaDuration || null,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    })

    // Update conversation last message
    await db.conversation.update({
      where: { id },
      data: {
        lastMessage: lastMessageText,
        lastMessageAt: new Date(),
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
