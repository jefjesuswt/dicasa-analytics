import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Appointment,
  AppointmentStatus,
  AuditLog,
  ConnectionLog,
  Property,
  SecurityAlert,
  Session,
  Visit,
} from './entities';
import { PermanenceMetrics } from './interfaces/permanence.interface';
import { SchedulingRateMetrics } from './interfaces';
import {
  CreateAuditLogDto,
  CreateVisitDto,
  HeartbeatDto,
  StartSessionDto,
} from './dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(Visit.name) private visitModel: Model<Visit>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLog>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(SecurityAlert.name) private alertModel: Model<SecurityAlert>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
    @InjectModel(ConnectionLog.name)
    private connectionLogModel: Model<ConnectionLog>,
  ) {}

  // VISITAS

  async createVisit(createVisitDto: CreateVisitDto): Promise<Visit> {
    const today = new Date().toISOString().split('T')[0];

    const filter = {
      fingerprint: createVisitDto.fingerprint,
      day: today,
    };

    const update = {
      $set: {
        path: createVisitDto.path,
        fingerprint: createVisitDto.fingerprint,
        day: today,
      },
    };

    const visit = await this.visitModel.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
    });

    return visit;
  }

  async getVisitCount(): Promise<number> {
    return this.visitModel.countDocuments().exec();
  }

  async getVisitCountByDay(day: string): Promise<number> {
    return this.visitModel.countDocuments({ day: day }).exec();
  }

  async startSession(startSessionDto: StartSessionDto): Promise<Session> {
    const now = new Date();

    const existingSession = await this.sessionModel.findOne({
      sessionId: startSessionDto.sessionId,
    });

    if (existingSession) {
      existingSession.lastSeenAt = now;
      return existingSession.save();
    }

    const newSession = new this.sessionModel({
      sessionId: startSessionDto.sessionId,
      fingerprint: startSessionDto.fingerprint,
      startTime: now,
      lastSeenAt: now,
    });

    return newSession.save();
  }

  async sendHeartbeat(heartbeatDto: HeartbeatDto): Promise<{ status: string }> {
    const now = new Date();

    const result = await this.sessionModel.updateOne(
      { sessionId: heartbeatDto.sessionId },
      { $set: { lastSeenAt: now } },
    );

    if (result.matchedCount === 0) {
      throw new Error('Session not found');
    }

    return { status: 'ok' };
  }

  // PERMANENCIA

  async getPermanenceMetrics(): Promise<PermanenceMetrics> {
    const pipeline = [
      {
        $match: {
          durationInSeconds: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalDuration_DN: { $sum: '$durationInSeconds' },
          totalSessions_TV: { $count: {} },
        },
      },
      {
        $project: {
          _id: 0,
          totalDuration_DN: '$totalDuration_DN',
          totalSessions_TV: '$totalSessions_TV',
          averagePermanence_PM: {
            $divide: ['$totalDuration_DN', '$totalSessions_TV'],
          },
        },
      },
    ];

    const result =
      await this.sessionModel.aggregate<PermanenceMetrics>(pipeline);

    if (result.length === 0) {
      return {
        totalDuration_DN: 0,
        totalSessions_TV: 0,
        averagePermanence_PM: 0,
      };
    }

    return result[0];
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleSessionDurationProcessing() {
    this.logger.log('Running Session Duration Processing Job...');

    const deadThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutos atrás

    const sessionsToProcess = await this.sessionModel.find({
      lastSeenAt: { $lt: deadThreshold },
      durationInSeconds: 0,
    });

    if (sessionsToProcess.length === 0) {
      this.logger.log('No new sessions to process.');
      return;
    }

    this.logger.log(`Found ${sessionsToProcess.length} sessions to process.`);

    const bulkOps = sessionsToProcess.map((session) => {
      const durationMs =
        session.lastSeenAt.getTime() - session.startTime.getTime();
      const durationSec = Math.round(durationMs / 1000);

      return {
        updateOne: {
          filter: { _id: session._id },
          update: { $set: { durationInSeconds: durationSec } },
        },
      };
    });

    await this.sessionModel.bulkWrite(bulkOps);
    this.logger.log('Successfully processed session durations.');
  }

  // CIFRADO

  async getCipherMetrics() {
    // 2. Contar éxitos
    const encryptedRequests = await this.connectionLogModel.countDocuments();

    // 3. Contar fallos
    const unencryptedRequests = await this.alertModel.countDocuments();

    // 4. Calcular el total
    const totalRequests = encryptedRequests + unencryptedRequests;

    const percentage =
      totalRequests > 0 ? (encryptedRequests / totalRequests) * 100 : 100; // Si no hay peticiones, es 100%

    return {
      total_peticiones: totalRequests,
      peticiones_cifradas_https: encryptedRequests,
      peticiones_no_cifradas_http: unencryptedRequests,
      porcentaje_cumplimiento: `${percentage.toFixed(2)}%`,
    };
  }

  // AUTENTICACION

  async createAuditLog(dto: CreateAuditLogDto): Promise<AuditLog> {
    const newLog = new this.auditModel(dto);
    return newLog.save();
  }

  // AGENDAMIENTO

  async getSchedulingRate(): Promise<SchedulingRateMetrics> {
    const tsCount = await this.appointmentModel.countDocuments({
      status: {
        $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
      },
    });

    // CA = Citas Concretadas
    const caCount = await this.appointmentModel.countDocuments({
      status: AppointmentStatus.CONFIRMED,
    });

    if (tsCount === 0) {
      return { rate: '0.00', completed: 0, total: 0 };
    }

    const rate = (caCount / tsCount) * 100;
    return { rate: rate.toFixed(2), completed: caCount, total: tsCount };
  }

  async getDashboardStats() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      permanence,
      cipher,
      scheduling,
      activeUsers,
      totalVisits,
      totalProperties,
      inventoryStats,
      recentLogs,
    ] = await Promise.all([
      this.getPermanenceMetrics(),
      this.getCipherMetrics(),
      this.getSchedulingRate(),
      this.sessionModel.countDocuments({
        lastSeenAt: { $gte: fiveMinutesAgo },
      }),
      this.visitModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      this.propertyModel.countDocuments({}),
      this.propertyModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.auditLogModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('action userId createdAt details'),
    ]);

    return {
      kpis: {
        activeUsers,
        totalVisitsMonth: totalVisits,
        avgPermanence: Math.round(permanence.averagePermanence_PM),
        schedulingRate: scheduling.rate,
        cipherCompliance: cipher.porcentaje_cumplimiento,
        totalProperties,
      },
      charts: {
        inventory: inventoryStats,
        schedulingFunnel: {
          total: scheduling.total,
          completed: scheduling.completed,
        },
      },
      security: {
        recentLogs,
        alertsCount: cipher.peticiones_no_cifradas_http,
      },
    };
  }
}
