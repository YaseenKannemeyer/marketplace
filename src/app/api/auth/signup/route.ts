import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// SA student email domains
const VALID_SA_DOMAINS = [
  'uct.ac.za', 'wits.ac.za', 'sun.ac.za', 'up.ac.za',
  'ukzn.ac.za', 'uj.ac.za', 'ru.ac.za', 'nwu.ac.za',
  'ufs.ac.za', 'ul.ac.za', 'unisa.ac.za', 'mandela.ac.za',
  'cput.ac.za', 'dut.ac.za', 'tut.ac.za', 'vut.ac.za',
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
]

// Password requirements
const PASSWORD_MIN_LENGTH = 8

export async function POST(request: Request) {
  try {
    const { name, email, password, university, campus, phone } = await request.json()

    // Validate name
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    }

    // Validate email format
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Validate email domain
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain || !VALID_SA_DOMAINS.includes(domain)) {
      return NextResponse.json({
        error: `Please use a valid email address. Accepted domains include: ${VALID_SA_DOMAINS.slice(0, 6).join(', ')} and more.`,
        validDomains: VALID_SA_DOMAINS,
      }, { status: 400 })
    }

    // Validate password
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json({ error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` }, { status: 400 })
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: 'Password must contain at least one uppercase letter' }, { status: 400 })
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ error: 'Password must contain at least one number' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    // Check if domain is a .ac.za domain for auto-verification
    const isStudentEmail = domain.endsWith('.ac.za')

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password, // In production, hash with bcrypt
        phone: phone || null,
        university: university || null,
        campus: campus || null,
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        verified: isStudentEmail,
        bio: '',
      },
    })

    // Send verification email simulation
    // In production: await sendVerificationEmail(user.email, verificationToken)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      university: user.university,
      campus: user.campus,
      bio: user.bio,
      verified: user.verified,
      message: isStudentEmail
        ? 'Account created! Your student email has been automatically verified.'
        : 'Account created! Please check your email to verify your account.',
      isStudentEmail,
    }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
