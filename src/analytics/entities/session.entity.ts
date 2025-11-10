import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ required: true, unique: true, index: true })
  sessionId: string;

  @Prop({ required: true, index: true })
  fingerprint: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  lastSeenAt: Date;

  @Prop({ type: Number, default: 0 })
  durationInSeconds: number;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
