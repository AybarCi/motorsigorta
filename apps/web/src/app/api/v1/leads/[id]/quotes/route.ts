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
        installments: true,
        notes: true,
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
    const file = formData.get('file') as File | null;
    const customer_full_name = formData.get('customer_full_name') as string;
    const installments = formData.get('installments') as string | null;
    const notes = formData.get('notes') as string | null;

    if (!company_name || !premiumStr) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const premium = parseFloat(premiumStr);
    
    if (customer_full_name) {
      const lead = await prisma.lead.findUnique({
        where: { id },
        select: { customer_id: true }
      });
      if (lead) {
        await prisma.customer.update({
          where: { id: lead.customer_id },
          data: { full_name: customer_full_name }
        });
      }
    }
    
    let file_name = "";
    let buffer = Buffer.alloc(0);

    if (file && file.name && file.size > 0) {
      file_name = file.name;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    const newQuote = await prisma.quote.create({
      data: {
        lead_id: id,
        company_name,
        premium,
        file_name,
        file_data: buffer,
        installments,
        notes,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        id: newQuote.id,
        company_name: newQuote.company_name,
        premium: newQuote.premium,
        file_name: newQuote.file_name,
        installments: newQuote.installments,
        notes: newQuote.notes,
        created_at: newQuote.created_at,
      }
    });
  } catch (error) {
    console.error('API Error creating quote:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload quote' }, { status: 500 });
  }
}
