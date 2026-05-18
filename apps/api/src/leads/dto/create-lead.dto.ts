import { InsuranceType } from '@prisma/client';

export class CreateLeadDto {
  insurance_category: string;
  insurance_type: InsuranceType;
  dynamic_fields: any;
  phone: string;
  utm_source?: string;
  utm_campaign?: string;
  lead_source?: string;
}
