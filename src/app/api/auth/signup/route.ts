import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// SA student email domains - includes university portals and subdomains
const VALID_SA_DOMAINS = [
  'uct.ac.za', 'wits.ac.za', 'sun.ac.za', 'up.ac.za',
  'ukzn.ac.za', 'uj.ac.za', 'ru.ac.za', 'nwu.ac.za',
  'ufs.ac.za', 'ul.ac.za', 'unisa.ac.za', 'mandela.ac.za',
  'cput.ac.za', 'mycput.ac.za', 'dut.ac.za', 'tut.ac.za',
  'vut.ac.za', 'wsu.ac.za', 'unizulu.ac.za', 'uwc.ac.za',
  'smu.ac.za', 'sancu.ac.za', 'mahinda.ac.za', 'ufh.ac.za',
  'cut.ac.za', 'nwu.ac.za', 'tut.ac.za',
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

    // Validate email format - accepts student numbers like 219045678@mycput.ac.za
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Validate email domain
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain || !VALID_SA_DOMAINS.includes(domain)) {
      return NextResponse.json({
        error: `Please use a valid email address. Accepted domains: .ac.za university emails (${VALID_SA_DOMAINS.filter(d => d.endsWith('.ac.za')).join(', ')}) or personal email.`,
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

    // Auto-detect university from email domain
    const domainToUni: Record<string, string> = {
      'uct.ac.za': 'University of Cape Town',
      'wits.ac.za': 'University of the Witwatersrand',
      'sun.ac.za': 'Stellenbosch University',
      'up.ac.za': 'University of Pretoria',
      'ukzn.ac.za': 'University of KwaZulu-Natal',
      'uj.ac.za': 'University of Johannesburg',
      'ru.ac.za': 'Rhodes University',
      'nwu.ac.za': 'North-West University',
      'ufs.ac.za': 'University of the Free State',
      'ul.ac.za': 'University of Limpopo',
      'unisa.ac.za': 'University of South Africa',
      'cput.ac.za': 'Cape Peninsula University of Technology',
      'mycput.ac.za': 'Cape Peninsula University of Technology',
      'dut.ac.za': 'Durban University of Technology',
      'tut.ac.za': 'Tshwane University of Technology',
      'vut.ac.za': 'Vaal University of Technology',
      'wsu.ac.za': 'Walter Sisulu University',
      'unizulu.ac.za': 'University of Zululand',
      'uwc.ac.za': 'University of the Western Cape',
      'cut.ac.za': 'Central University of Technology',
      'mandela.ac.za': 'Nelson Mandela University',
      'ufh.ac.za': 'University of Fort Hare',
      'smu.ac.za': 'Sefako Makgatho Health Sciences University',
    }

    const autoUniversity = domainToUni[domain] || university || null

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password, // In production, hash with bcrypt
        phone: phone || null,
        university: autoUniversity,
        campus: campus || null,
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        verified: isStudentEmail,
        bio: '',
      },
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
