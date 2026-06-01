import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Update Lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
        last_contacted_at: body.last_contacted_at ? new Date(body.last_contacted_at) : undefined,
        next_follow_up_at: body.next_follow_up_at ? new Date(body.next_follow_up_at) : undefined,
        assigned_to: body.assigned_to,
        is_archived: body.is_archived,
        updated_at: new Date(),
      },
    });

    // Update Customer last activity
    if (body.last_contacted_at || body.status) {
      await prisma.customer.update({
        where: { id: updatedLead.customer_id },
        data: { last_activity_at: new Date() },
      });
    }

    return NextResponse.json({ success: true, data: updatedLead });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete lead' }, { status: 500 });
  }
}
