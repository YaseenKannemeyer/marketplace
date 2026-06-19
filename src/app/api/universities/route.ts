import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const universities = await db.university.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { listings: { where: { status: 'active' } } } } },
    })
    return NextResponse.json(universities)
  } catch (error) {
    console.error('Error fetching universities:', error)
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 })
  }
}
