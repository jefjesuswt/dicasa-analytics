import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConnectionLog, SecurityAlert } from '../../analytics/entities';

@Injectable()
export class ConnectionAuditMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(SecurityAlert.name)
    private alertModel: Model<SecurityAlert>,
    @InjectModel(ConnectionLog.name)
    private connectionLogModel: Model<ConnectionLog>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl === '/') {
      return next();
    }

    const protocol = req.headers['x-forwarded-proto'];

    if (protocol === 'http') {
      this.alertModel
        .create({
          protocol: 'http',
          path: req.originalUrl,
          ip: req.ip,
          headers: req.headers,
        })
        .catch((err) => console.error('Error logging security alert:', err));

      throw new ForbiddenException(
        'Acceso denegado. Solo se aceptan conexiones seguras (HTTPS).',
      );
    } else if (protocol === 'https') {
      this.connectionLogModel
        .create({
          protocol: 'https',
          path: req.originalUrl,
          ip: req.ip,
        })
        .catch((err) => console.error('Error logging connection:', err));

      next();
    } else {
      // Es 'unknown' (ej. desarrollo local en http://localhost)
      // No registramos nada, pero permitimos que continúe.
      next();
    }
  }
}
