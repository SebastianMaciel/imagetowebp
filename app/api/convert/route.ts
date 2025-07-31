import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Verificar que sea un archivo de imagen válido (PNG, JPG, JPEG)
    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File must be a PNG, JPG, or JPEG image' },
        { status: 400 }
      );
    }

    // Convertir el archivo a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convertir a WebP con calidad 80
    const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

    // Devolver el WebP como blob
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
