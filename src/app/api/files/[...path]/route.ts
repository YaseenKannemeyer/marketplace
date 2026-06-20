import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');

// Map of extensions to MIME types
const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  ogg: 'audio/ogg',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
};

/**
 * BACKWARD COMPATIBILITY ROUTE
 *
 * New uploads go to Cloudinary, but this route stays active so that
 * any old URLs stored in the database (e.g., seed data with /api/files/...)
 * still work. If a file exists on local disk, it serves it.
 * Otherwise returns 404.
 *
 * Once all old data is migrated to Cloudinary, this route can be safely deleted.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const relativePath = segments.join('/');
    const filePath = path.join(UPLOAD_ROOT, relativePath);

    // Security: prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(UPLOAD_ROOT))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check file exists on local disk
    try {
      await stat(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = await readFile(filePath);
    const ext = filePath.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
      },
    });
  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
