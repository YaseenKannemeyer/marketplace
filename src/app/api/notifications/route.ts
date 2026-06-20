import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Count unread conversation messages where user is receiver
    const unreadMessages = await db.conversationMessage.count({
      where: {
        conversation: {
          OR: [
            { buyerId: userId },
            { sellerId: userId },
          ],
        },
        senderId: { not: userId },
        read: false,
      },
    });

    // Get latest unread messages for notification preview
    const recentUnread = await db.conversationMessage.findMany({
      where: {
        conversation: {
          OR: [
            { buyerId: userId },
            { sellerId: userId },
          ],
        },
        senderId: { not: userId },
        read: false,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        conversation: {
          include: {
            listing: { select: { id: true, title: true, images: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const notifications = recentUnread.map((msg) => ({
      id: msg.id,
      type: 'message' as const,
      title: `Message from ${msg.sender.name}`,
      body: msg.content,
      sender: msg.sender,
      conversationId: msg.conversation.id,
      listing: msg.conversation.listing
        ? { id: msg.conversation.listing.id, title: msg.conversation.listing.title, images: msg.conversation.listing.images }
        : null,
      createdAt: msg.createdAt,
    }));

    return NextResponse.json({
      unreadCount: unreadMessages,
      notifications,
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, conversationId } = await request.json();
    if (!userId || !conversationId) {
      return NextResponse.json({ error: 'userId and conversationId required' }, { status: 400 });
    }

    // Mark all messages in conversation as read
    await db.conversationMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
