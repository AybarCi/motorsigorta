import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    // Upsert logic for duplicate phone
    const existing = await this.prisma.lead.findUnique({
      where: { phone: createLeadDto.phone },
    });

    if (existing) {
      return this.prisma.lead.update({
        where: { id: existing.id },
        data: {
          insurance_category: createLeadDto.insurance_category,
          insurance_type: createLeadDto.insurance_type,
          dynamic_fields: createLeadDto.dynamic_fields,
          utm_source: createLeadDto.utm_source || existing.utm_source,
          utm_campaign: createLeadDto.utm_campaign || existing.utm_campaign,
          lead_source: createLeadDto.lead_source || existing.lead_source,
          status: 'NEW', 
          updated_at: new Date(),
        },
      });
    }

    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const tracking_id = `TRK-${year}-${random}`;

    return this.prisma.lead.create({
      data: {
        tracking_id,
        insurance_category: createLeadDto.insurance_category,
        insurance_type: createLeadDto.insurance_type,
        dynamic_fields: createLeadDto.dynamic_fields,
        phone: createLeadDto.phone,
        utm_source: createLeadDto.utm_source,
        utm_campaign: createLeadDto.utm_campaign,
        lead_source: createLeadDto.lead_source,
      },
    });
  }

  findAll() {
    return this.prisma.lead.findMany({
      orderBy: { created_at: 'desc' },
    });
  }
}
