import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog extends Document {
  @Prop({ required: true, index: true })
  userId: string; // El ID del usuario/agente desde el JWT

  @Prop({ required: true, index: true })
  action: string; // Ej: 'CREATE_PROPERTY', 'UPDATE_APPOINTMENT'

  @Prop({ index: true })
  resourceId?: string; // El ID del recurso afectado (ej. la propiedad)
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
