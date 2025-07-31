import JSZip from 'jszip';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // ZIP size limits
    const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50 MB
    const MAX_FILES_IN_ZIP = 20; // Prevent too many files

    if (files.length > MAX_FILES_IN_ZIP) {
      return NextResponse.json(
        { error: `Too many files (maximum ${MAX_FILES_IN_ZIP})` },
        { status: 400 }
      );
    }

    const zip = new JSZip();

    // Process each file
    for (const fileData of files) {
      try {
        // Fetch the file from the provided URL
        const response = await fetch(fileData.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${fileData.name}`);
        }

        const blob = await response.blob();
        zip.file(fileData.name, blob);
      } catch (error) {
        console.error(`Error processing file ${fileData.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({ type: 'nodebuffer' });

    // Return the ZIP file
    return new NextResponse(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="converted-images.zip"',
      },
    });
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    return NextResponse.json(
      { error: 'Failed to create ZIP file' },
      { status: 500 }
    );
  }
}
