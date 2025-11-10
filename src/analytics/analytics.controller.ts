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
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit } from './entities/visit.entity';
import { StartSessionDto } from './dto/start-session.dto';
import { HeartbeatDto } from './dto/heartbeat.dto';
import { SchedulingRateMetrics } from './interfaces';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('visit')
  async createVisit(@Body() createVisitDto: CreateVisitDto): Promise<Visit> {
    console.log(createVisitDto);
    return this.analyticsService.createVisit(createVisitDto);
  }

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

  @Get('metrics/cipher')
  getCipherMetrics() {
    return this.analyticsService.getCipherMetrics();
  }

  @Get('metrics/scheduling-rate')
  getSchedulingRate(): Promise<SchedulingRateMetrics> {
    return this.analyticsService.getSchedulingRate();
  }

  @Get('visits')
  async getVisits(): Promise<number> {
    return this.analyticsService.getVisitCount();
  }

  @Get('visits/count/by-day')
  async getVisitsByDay(@Query('day') day: string): Promise<number> {
    return this.analyticsService.getVisitCountByDay(day);
  }
}
