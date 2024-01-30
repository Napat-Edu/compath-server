import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ResumeInputDto } from 'src/dtos/resume-input.dto';

export type ResumeHistoryDocument = HydratedDocument<ResumeHistory>;

@Schema()
export class ResumeHistory {
  @Prop()
  resume_owner: string;

  @Prop({ type: Object })
  resume_input: ResumeInputDto;

  @Prop()
  input_date: Date;

  @Prop()
  prediction_result: string;
}

export const ResumeHistorySchema = SchemaFactory.createForClass(ResumeHistory);
