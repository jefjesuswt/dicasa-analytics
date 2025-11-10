import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Visit extends Document {
  @Prop({ required: true, index: true })
  fingerprint: string;

  @Prop({ required: true })
  path: string;

  @Prop({ index: true })
  day: string;
}
export const VisitSchema = SchemaFactory.createForClass(Visit);

VisitSchema.index({ fingerprint: 1, day: 1 }, { unique: true });
