import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Find or create customer
    const birthDateParsed = body.birth_date ? new Date(body.birth_date) : null;
    const existingPolicyExpiresAtParsed = body.existing_policy_expires_at ? new Date(body.existing_policy_expires_at) : null;

    let customer = await prisma.customer.findUnique({
      where: { phone: body.phone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: body.phone,
          full_name: body.full_name || body.dynamic_fields?.full_name || null,
          birth_date: birthDateParsed,
          last_activity_at: new Date(),
        },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { 
          full_name: body.full_name || body.dynamic_fields?.full_name || customer.full_name,
          birth_date: birthDateParsed !== null ? birthDateParsed : customer.birth_date,
          last_activity_at: new Date(),
        },
      });
    }

    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const tracking_id = body.tracking_id || `TRK-${year}-${random}`;

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
        existing_policy_expires_at: existingPolicyExpiresAtParsed,
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
      include: { customer: true },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}
