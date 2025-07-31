import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // File size limits
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
    const MIN_FILE_SIZE = 1024; // 1 KB

    if (file.size < MIN_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File is too small (minimum 1 KB)' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File is too large (maximum ${(
            MAX_FILE_SIZE /
            1024 /
            1024
          ).toFixed(0)} MB)`,
        },
        { status: 400 }
      );
    }

    // Verify that it's a valid image file (PNG, JPG, JPEG)
    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File must be a PNG, JPG, or JPEG image' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert to WebP with quality 80
    const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

    // Return the WebP as blob
    return new NextResponse(webpBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Content-Disposition': 'attachment; filename="converted.webp"',
      },
    });
  } catch (error) {
    console.error('Error converting image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
