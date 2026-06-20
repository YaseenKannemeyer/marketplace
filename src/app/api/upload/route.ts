import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

const ALLOWED_FOLDERS = ['listings', 'profiles', 'avatars', 'stories', 'chat'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'listings';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.' },
        { status: 500 },
      );
    }

    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'listings';
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
      const isAudio = ALLOWED_AUDIO_TYPES.includes(file.type);

      if (!isImage && !isVideo && !isAudio) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: images (JPG, PNG, GIF, WEBP), videos (MP4, WebM), audio (WebM, OGG, MP3, WAV).` },
          { status: 400 },
        );
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: `Image "${file.name}" exceeds 5MB limit.` }, { status: 400 });
      }
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json({ error: `Video "${file.name}" exceeds 50MB limit.` }, { status: 400 });
      }
      if (isAudio && file.size > MAX_AUDIO_SIZE) {
        return NextResponse.json({ error: `Audio "${file.name}" exceeds 10MB limit.` }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split('.').pop() || (isImage ? 'jpg' : isVideo ? 'mp4' : 'webm');
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const result = await uploadToCloudinary(buffer, safeFolder, uniqueName);

      if (result && typeof result === 'object' && 'secure_url' in result) {
        uploadedUrls.push((result as { secure_url: string }).secure_url);
      } else {
        return NextResponse.json(
          { error: `Failed to upload "${file.name}" to Cloudinary.` },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 },
    );
  }
}
