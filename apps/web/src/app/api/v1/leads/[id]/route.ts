import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Fetch existing lead with customer info
    const existingLead = await prisma.lead.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!existingLead) {
      return NextResponse.json({ success: false, error: 'Talep bulunamadı' }, { status: 404 });
    }

    // Phone duplicate validation
    if (body.phone && body.phone !== existingLead.customer.phone) {
      const conflictingCustomer = await prisma.customer.findUnique({
        where: { phone: body.phone },
      });
      if (conflictingCustomer) {
        return NextResponse.json(
          { success: false, error: 'Bu telefon numarası zaten sisteme kayıtlı başka bir müşteriye ait!' },
          { status: 400 }
        );
      }

      // Update customer phone and name
      await prisma.customer.update({
        where: { id: existingLead.customer_id },
        data: {
          phone: body.phone,
          full_name: body.full_name !== undefined ? body.full_name : undefined,
          birth_date: body.birth_date !== undefined ? (body.birth_date ? new Date(body.birth_date) : null) : undefined,
        },
      });
    } else if (
      (body.full_name !== undefined && body.full_name !== existingLead.customer.full_name) ||
      body.birth_date !== undefined
    ) {
      // Update customer name and/or birth_date
      await prisma.customer.update({
        where: { id: existingLead.customer_id },
        data: {
          full_name: body.full_name !== undefined ? body.full_name : undefined,
          birth_date: body.birth_date !== undefined ? (body.birth_date ? new Date(body.birth_date) : null) : undefined,
        },
      });
    }

    // Update Lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
        last_contacted_at: body.last_contacted_at ? new Date(body.last_contacted_at) : undefined,
        next_follow_up_at: body.next_follow_up_at ? new Date(body.next_follow_up_at) : undefined,
        existing_policy_expires_at: body.existing_policy_expires_at !== undefined ? (body.existing_policy_expires_at ? new Date(body.existing_policy_expires_at) : null) : undefined,
        assigned_to: body.assigned_to,
        is_archived: body.is_archived,
        dynamic_fields: body.dynamic_fields !== undefined ? body.dynamic_fields : undefined,
        updated_at: new Date(),
      },
      include: { customer: true },
    });

    // Update Customer last activity
    if (body.last_contacted_at || body.status || body.phone || body.full_name) {
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
