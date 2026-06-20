import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Simulate sending verification email
    // In production: generate token, store it, send email

    return NextResponse.json({
      message: 'Verification email sent! Please check your inbox.',
      email: user.email,
    })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { email },
      data: { verified: true },
    })

    return NextResponse.json({
      message: 'Email verified successfully!',
      verified: true,
      id: user.id,
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    console.error('Verify email PUT error:', error)
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
  }
}
