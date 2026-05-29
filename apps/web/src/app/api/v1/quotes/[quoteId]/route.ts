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

export async function PATCH(req: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  try {
    const { quoteId } = await params;
    const formData = await req.formData();
    
    const company_name = formData.get('company_name') as string | null;
    const premiumStr = formData.get('premium') as string | null;
    const installments = formData.get('installments') as string | null;
    const notes = formData.get('notes') as string | null;
    const file = formData.get('file') as File | null;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (company_name !== null) updateData.company_name = company_name;
    if (premiumStr !== null) updateData.premium = parseFloat(premiumStr);
    if (installments !== null) updateData.installments = installments;
    if (notes !== null) updateData.notes = notes;
    
    if (file && file.name && file.size > 0) {
      updateData.file_name = file.name;
      const arrayBuffer = await file.arrayBuffer();
      updateData.file_data = Buffer.from(arrayBuffer);
    }
    
    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedQuote.id,
        company_name: updatedQuote.company_name,
        premium: updatedQuote.premium,
        file_name: updatedQuote.file_name,
        installments: updatedQuote.installments,
        notes: updatedQuote.notes,
        created_at: updatedQuote.created_at,
      }
    });
  } catch (error) {
    console.error('API Error updating quote:', error);
    return NextResponse.json({ success: false, error: 'Failed to update quote' }, { status: 500 });
  }
}
