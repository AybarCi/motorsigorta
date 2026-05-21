import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  try {
    const { quoteId } = await params;
    
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      return new NextResponse('Quote not found', { status: 404 });
    }

    // Determine content type based on extension (simple check)
    let contentType = 'application/octet-stream';
    if (quote.file_name.toLowerCase().endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (quote.file_name.toLowerCase().endsWith('.png')) {
      contentType = 'image/png';
    } else if (quote.file_name.toLowerCase().endsWith('.jpg') || quote.file_name.toLowerCase().endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    }

    return new NextResponse(new Uint8Array(quote.file_data), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(quote.file_name)}"`,
      },
    });

  } catch (error) {
    console.error('API Error downloading quote:', error);
    return new NextResponse('Failed to download quote', { status: 500 });
  }
}
