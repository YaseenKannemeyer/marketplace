import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const now = new Date()
    const stories = await db.story.findMany({
      where: { expiresAt: { gte: now } },
      include: {
        user: { select: { id: true, name: true, avatar: true, university: true, verified: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group stories by user
    const grouped = stories.reduce((acc, story) => {
      if (!acc[story.userId]) {
        acc[story.userId] = {
          user: story.user,
          stories: [],
        }
      }
      acc[story.userId].stories.push(story)
      return acc
    }, {} as Record<string, { user: typeof stories[0]['user']; stories: typeof stories }>)

    // Convert to array sorted by most recent story
    const storyGroups = Object.values(grouped).sort((a, b) =>
      new Date(b.stories[0].createdAt).getTime() - new Date(a.stories[0].createdAt).getTime()
    )

    return NextResponse.json(storyGroups)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, caption, type, mediaUrl, backgroundColor } = await request.json()

    if (!userId || !caption) {
      return NextResponse.json({ error: 'User ID and caption are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const story = await db.story.create({
      data: {
        userId,
        caption,
        type: type || 'gradient',
        mediaUrl: mediaUrl || '',
        backgroundColor: backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        expiresAt,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, university: true, verified: true } },
      },
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 })
  }
}
