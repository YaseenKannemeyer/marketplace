import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        university: true,
        campus: true,
        bio: true,
        profileImages: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            sentMessages: true,
            receivedMessages: true,
            buyerConversations: true,
            sellerConversations: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { userId, name, bio, phone, university, campus, avatar, profileImages } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (bio !== undefined) updateData.bio = bio
    if (phone !== undefined) updateData.phone = phone
    if (university !== undefined) updateData.university = university
    if (campus !== undefined) updateData.campus = campus
    if (avatar !== undefined) updateData.avatar = avatar
    if (profileImages !== undefined) updateData.profileImages = JSON.stringify(profileImages)

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      university: user.university,
      campus: user.campus,
      bio: user.bio,
      profileImages: user.profileImages,
      verified: user.verified,
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
