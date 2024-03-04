import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CareerPathData } from 'src/schemas/career-path-data.schema';

@Injectable()
export class CareerPathService {
  constructor(
    @InjectModel(CareerPathData.name)
    private careerPathDataModel: Model<CareerPathData>,
  ) {}

  async getCareerPathData() {
    const careerPathData = await this.careerPathDataModel.aggregate([
      {
        $unwind: '$related_careers',
      },
      {
        $lookup: {
          from: 'skilldomains',
          localField: 'related_careers.skill_domains',
          foreignField: 'id',
          as: 'career_domains',
        },
      },
      {
        $unwind: '$career_domains',
      },
      {
        $lookup: {
          from: 'skilldatas',
          localField: 'career_domains.skill_list',
          foreignField: 'id',
          as: 'skill_data',
        },
      },
      {
        $group: {
          _id: {
            career_path_id: '$_id',
            career_path_name: '$career_path_name',
            career_path_description: '$career_path_description',
            base_salary: '$base_salary',
            icon_svg: '$icon_svg',
            career: '$related_careers.career',
          },
          skill_domains: {
            $push: {
              id: '$career_domains.id',
              name: '$career_domains.name',
              skill_list: '$skill_data.name',
              is_in_resume: '$career_domains.is_in_resume',
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id.career_path_id',
          career_path_name: { $first: '$_id.career_path_name' },
          career_path_description: {
            $first: '$_id.career_path_description',
          },
          base_salary: { $first: '$_id.base_salary' },
          icon_svg: { $first: '$_id.icon_svg' },
          related_careers: {
            $push: {
              career: '$_id.career',
              skill_domains: '$skill_domains',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          career_path_name: 1,
          career_path_description: 1,
          related_careers: 1,
          base_salary: 1,
          icon_svg: 1,
        },
      },
    ]);

    return careerPathData;
  }
}
