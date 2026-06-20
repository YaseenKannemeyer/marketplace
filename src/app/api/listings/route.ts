import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const universityId = searchParams.get('universityId') || ''
    const condition = searchParams.get('condition') || ''
    const sortBy = searchParams.get('sortBy') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')

    const where: Record<string, unknown> = { status: 'active' }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (universityId) where.universityId = universityId
    if (condition) where.condition = condition

    const orderBy: Record<string, string> =
      sortBy === 'price_low'
        ? { price: 'asc' }
        : sortBy === 'price_high'
          ? { price: 'desc' }
          : { createdAt: 'desc' }

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        include: {
          seller: { select: { id: true, name: true, avatar: true, university: true } },
          category: { select: { id: true, name: true, icon: true, color: true } },
          university: { select: { id: true, name: true, shortName: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.listing.count({ where }),
    ])

    // Increment views
    await Promise.all(
      listings.map((l) => db.listing.update({ where: { id: l.id }, data: { views: { increment: 1 } } }))
    )

    return NextResponse.json({ listings, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, price, categoryId, universityId, campus, location, condition, negotiable, images, sellerId } = body

    const listing = await db.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        categoryId,
        universityId: universityId || null,
        campus,
        location,
        condition: condition || 'Used',
        negotiable: negotiable !== false,
        images: images ? JSON.stringify(images) : '[]',
        sellerId: sellerId || 'user-1',
      },
      include: {
        seller: { select: { id: true, name: true, avatar: true, university: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
        university: { select: { id: true, name: true, shortName: true } },
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
