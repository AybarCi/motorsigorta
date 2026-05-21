import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // We select everything EXCEPT file_data to keep the response lightweight
    const quotes = await prisma.quote.findMany({
      where: { lead_id: id },
      select: {
        id: true,
        lead_id: true,
        company_name: true,
        premium: true,
        file_name: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ success: true, data: quotes });
  } catch (error) {
    console.error('API Error fetching quotes:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const formData = await req.formData();
    const company_name = formData.get('company_name') as string;
    const premiumStr = formData.get('premium') as string;
    const file = formData.get('file') as File;

    if (!company_name || !premiumStr || !file) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const premium = parseFloat(premiumStr);
    
    // Convert File to Buffer/Bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const newQuote = await prisma.quote.create({
      data: {
        lead_id: id,
        company_name,
        premium,
        file_name: file.name,
        file_data: buffer,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        id: newQuote.id,
        company_name: newQuote.company_name,
        premium: newQuote.premium,
        file_name: newQuote.file_name,
        created_at: newQuote.created_at,
      }
    });
  } catch (error) {
    console.error('API Error creating quote:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload quote' }, { status: 500 });
  }
}
