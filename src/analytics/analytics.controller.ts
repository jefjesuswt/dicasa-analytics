import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SchedulingRateMetrics } from './interfaces';
import {
  CreateAuditLogDto,
  CreateVisitDto,
  HeartbeatDto,
  StartSessionDto,
} from './dto';
import { Visit } from './entities';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // VISITAS

  @Post('visit')
  async createVisit(@Body() createVisitDto: CreateVisitDto): Promise<Visit> {
    console.log(createVisitDto);
    return this.analyticsService.createVisit(createVisitDto);
  }

  @Get('visits')
  async getVisits(): Promise<number> {
    return this.analyticsService.getVisitCount();
  }

  // PERMANENCIA

  @Post('session/start')
  startSession(@Body() startSessionDto: StartSessionDto) {
    return this.analyticsService.startSession(startSessionDto);
  }

  @Post('session/heartbeat')
  @HttpCode(HttpStatus.OK)
  sendHeartbeat(@Body() heartbeatDto: HeartbeatDto) {
    this.analyticsService.sendHeartbeat(heartbeatDto).catch((err) => {
      console.error('Heartbeat failed:', err);
    });
    return { status: 'received' };
  }

  @Get('metrics/permanence')
  getPermanenceMetrics() {
    return this.analyticsService.getPermanenceMetrics();
  }

  // CIFRADO

  @Get('metrics/cipher')
  getCipherMetrics() {
    return this.analyticsService.getCipherMetrics();
  }

  @Post('audit')
  createAuditLog(@Body() dto: CreateAuditLogDto) {
    this.analyticsService.createAuditLog(dto).catch((err) => {
      console.error('Error logging audit:', err);
    });
    return { status: 'received' };
  }

  // AUTENTICACION

  @Get('metrics/scheduling-rate')
  getSchedulingRate(): Promise<SchedulingRateMetrics> {
    return this.analyticsService.getSchedulingRate();
  }

  @Get('visits/count/by-day')
  async getVisitsByDay(@Query('day') day: string): Promise<number> {
    return this.analyticsService.getVisitCountByDay(day);
  }
}
