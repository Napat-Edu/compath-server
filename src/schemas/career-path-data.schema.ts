import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CareerPathDataDocument = HydratedDocument<CareerPathData>;

@Schema()
export class CareerPathData {
    @Prop()
    career_path_name: string;

    @Prop()
    career_path_description: string;

    @Prop()
    related_careers: string[];

    @Prop()
    base_salary: number;

    @Prop()
    icon_svg: string;
}

export const CareerPathDataSchema = SchemaFactory.createForClass(CareerPathData);