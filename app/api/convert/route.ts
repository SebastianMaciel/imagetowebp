import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Verificar que sea un archivo PNG
    if (!file.type.includes('png')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un PNG' },
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
    console.error('Error al convertir la imagen:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
