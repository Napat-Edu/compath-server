import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CareerPathData } from 'src/schemas/career-path-data.schema';

@Injectable()
export class CareerExplorationService {
  constructor(
    @InjectModel(CareerPathData.name)
    private careerPathDataModel: Model<CareerPathData>,
  ) {}

  async getCareerExplorationData() {
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
        $lookup: {
          from: 'skilldatas',
          localField: 'related_careers.soft_skills',
          foreignField: 'id',
          as: 'career_soft_skills',
        },
      },
      {
        $unwind: '$career_soft_skills',
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
            career: '$related_careers.career',
          },
          skill_domains: {
            $addToSet: {
              id: '$career_domains.id',
              name: '$career_domains.name',
              skill_list: '$skill_data.name',
              is_in_resume: '$career_domains.is_in_resume',
            },
          },
          soft_skills: {
            $addToSet: {
              id: '$career_soft_skills.id',
              name: '$career_soft_skills.name',
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
          related_careers: {
            $push: {
              career: '$_id.career',
              soft_skills: '$soft_skills',
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
        },
      },
    ]);

    const sortedCareerPathData = careerPathData
      .sort((a, b) => a.career_path_name.localeCompare(b.career_path_name))
      .map((careerPath) => {
        const sortedCareerPath = careerPath.related_careers.sort((a, b) =>
          a.career.localeCompare(b.career),
        );
        return {
          ...careerPath,
          related_careers: sortedCareerPath.map((career) => {
            const sortedSkillDomain = career.skill_domains.sort((a, b) =>
              a.id.localeCompare(b.id),
            );
            const mappedSkillDomain = sortedSkillDomain.map((domain) => {
              return {
                ...domain,
                skill_list: domain.skill_list.sort((a, b) =>
                  a[0].localeCompare(b[0]),
                ),
              };
            });
            return {
              ...career,
              soft_skills: career.soft_skills.sort((a, b) =>
                a.id.localeCompare(b.id),
              ),
              skill_domains: mappedSkillDomain,
            };
          }),
        };
      });

    return sortedCareerPathData;
  }
}
