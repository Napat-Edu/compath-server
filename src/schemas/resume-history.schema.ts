import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IUserResume } from 'src/interfaces/career-prediction.interface';

export type ResumeHistoryDocument = HydratedDocument<ResumeHistory>;

@Schema()
export class ResumeHistory {
  @Prop()
  resume_owner: string;

  @Prop({ type: Object })
  resume_input: IUserResume;

  @Prop()
  input_date: Date;
}

export const ResumeHistorySchema = SchemaFactory.createForClass(ResumeHistory);
