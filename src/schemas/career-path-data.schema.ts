import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { ISalary } from "src/interfaces/career-prediction.interface";

export type CareerPathDataDocument = HydratedDocument<CareerPathData>;

@Schema()
export class CareerPathData {
    @Prop()
    career_path_name: string;

    @Prop()
    career_path_description: string;

    @Prop()
    related_careers: string[];

    @Prop({ type: Object })
    base_salary: ISalary;

    @Prop()
    icon_svg: string;
}

export const CareerPathDataSchema = SchemaFactory.createForClass(CareerPathData);