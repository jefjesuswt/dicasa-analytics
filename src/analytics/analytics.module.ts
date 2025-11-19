import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

import { MongooseModule } from '@nestjs/mongoose';
import {
  Appointment,
  AppointmentSchema,
  AuditLog,
  AuditLogSchema,
  ConnectionLog,
  ConnectionLogSchema,
  SecurityAlert,
  SecurityAlertSchema,
  Session,
  SessionSchema,
  Visit,
  VisitSchema,
} from './entities';
import { ConnectionAuditMiddleware } from '../common/middleware/connection-audit.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Visit.name, schema: VisitSchema },
      { name: Session.name, schema: SessionSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: ConnectionLog.name, schema: ConnectionLogSchema },
      { name: SecurityAlert.name, schema: SecurityAlertSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ConnectionAuditMiddleware).forRoutes('*');
  }
}
