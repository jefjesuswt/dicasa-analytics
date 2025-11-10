import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  action: string;

  @Prop({ index: true })
  resourceId?: string;

  @Prop({ type: Object })
  details?: Record<string, any>;
}
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
