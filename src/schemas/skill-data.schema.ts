import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SkillDataDocument = HydratedDocument<SkillData>;
@Schema()
export class SkillData {
    @Prop()
    id: string;

    @Prop()
    name: string[];
}

export const SkillDataSchema =
    SchemaFactory.createForClass(SkillData);
