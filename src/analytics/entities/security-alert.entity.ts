import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'security_alerts' })
export class SecurityAlert extends Document {
  @Prop({ required: true })
  protocol: 'http';

  @Prop({ required: true })
  path: string;

  @Prop()
  ip?: string;

  @Prop({ type: Object })
  headers: Record<string, any>;
}

export const SecurityAlertSchema = SchemaFactory.createForClass(SecurityAlert);
