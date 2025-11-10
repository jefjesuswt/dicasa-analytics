import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'connection_logs' })
export class ConnectionLog extends Document {
  @Prop({ required: true })
  protocol: 'https';

  @Prop({ required: true })
  path: string;

  @Prop()
  ip?: string;

  @Prop({ type: Date, default: Date.now, expires: 2592000 })
  createdAt: Date;
}

export const ConnectionLogSchema = SchemaFactory.createForClass(ConnectionLog);
