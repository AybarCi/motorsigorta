import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const newPolicy = await prisma.policy.create({
      data: {
        policy_number: body.policy_number,
        customer_id: body.customer_id,
        lead_id: body.lead_id,
        insurance_type: body.insurance_type,
        company_name: body.company_name,
        premium_amount: body.premium_amount,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        document_url: body.document_url,
        mime_type: body.mime_type,
        file_size: body.file_size,
        status: 'ACTIVE',
        renewal_status: 'PENDING',
      },
    });

    // Update Lead status to SOLD
    if (body.lead_id) {
      await prisma.lead.update({
        where: { id: body.lead_id },
        data: { status: 'SOLD', updated_at: new Date() },
      });
    }

    // Update Customer last activity
    await prisma.customer.update({
      where: { id: body.customer_id },
      data: { last_activity_at: new Date() },
    });

    return NextResponse.json({ success: true, data: newPolicy });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create policy' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const policies = await prisma.policy.findMany({
      where: { is_archived: false },
      include: { customer: true },
      orderBy: { end_date: 'asc' }, // Order by end_date for renewals
    });
    return NextResponse.json({ success: true, data: policies });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch policies' }, { status: 500 });
  }
}
