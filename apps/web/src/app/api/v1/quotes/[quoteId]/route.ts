import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  try {
    const { quoteId } = await params;
    
    await prisma.quote.delete({
      where: { id: quoteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error deleting quote:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete quote' }, { status: 500 });
  }
}
