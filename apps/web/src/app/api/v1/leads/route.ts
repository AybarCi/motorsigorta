import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phone: body.phone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: body.phone,
          last_activity_at: new Date(),
        },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { last_activity_at: new Date() },
      });
    }

    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const tracking_id = `TRK-${year}-${random}`;

    const newLead = await prisma.lead.create({
      data: {
        tracking_id,
        customer_id: customer.id,
        insurance_category: body.insurance_category,
        insurance_type: body.insurance_type,
        dynamic_fields: body.dynamic_fields,
        utm_source: body.utm_source,
        utm_campaign: body.utm_campaign,
        lead_source: body.lead_source,
        status: 'NEW',
      },
    });

    return NextResponse.json({ success: true, traceId: newLead.tracking_id });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process lead' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      where: { is_archived: false },
      include: { customer: true },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}
