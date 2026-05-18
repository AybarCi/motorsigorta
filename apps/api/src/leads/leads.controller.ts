import { Controller, Post, Body, Get } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('v1/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    try {
      const data = await this.leadsService.create(createLeadDto);
      return { success: true, data, error: null, traceId: data.tracking_id };
    } catch (error) {
      return { success: false, data: null, error: error.message, traceId: null };
    }
  }

  @Get()
  async findAll() {
    const data = await this.leadsService.findAll();
    return { success: true, data, error: null };
  }
}
