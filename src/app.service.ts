import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ResumeHistory } from './schemas/resume-history.schema';
import { Model } from 'mongoose';
import { CareerPathData } from './schemas/career-path-data.schema';
import { SkillData } from './schemas/skill-data.schema';
import { CareerPathDataDto } from './dtos/career-path-data.dto';
import { ResumeHistoryDto } from './dtos/resume-input.dto';
import { IUserResumeInfo } from './interfaces/career-prediction.interface';
import { SkillDataDto } from './dtos/skill-data.dto';
import { ICareerPathClassify, ICareerPathWithSkill } from './interfaces/career-insight.interface';

@Injectable()
export class AppService {
  constructor() {}

  getHello(): string {
    return `This is ${process.env.MODE} mode`;
  }
}

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
    @InjectModel(CareerPathData.name)
    private careerPathDataModel: Model<CareerPathData>,
    @InjectModel(SkillData.name)
    private skillDataModel: Model<SkillData>,
  ) {}

  async getCareerPathInfo(careerPath: string) {
    try {
      if(careerPath == 'Developer') {
        return new Developer();
      } else if(careerPath == 'Designer') {
        return new Designer();
      } else if(careerPath == 'Data & AI') {
        return new DataAI();
      } else if(careerPath == 'Security') {
        return new Security();
      } else if(careerPath == 'Cloud Management') {
        return new CloudManagement();
      } else if(careerPath == 'QA & Tester') {
        return new Tester();
      } else {
        return new Error('invalid career path');
      }
    } catch (err) {
      return err;
    }
  }

  async createNewHistory(
    owner: string,
    resume: IUserResumeInfo,
    careerPath: string,
  ) {
    try {
      const newResumeHistory: ResumeHistoryDto = {
        resume_owner: owner,
        resume_input: resume,
        input_date: new Date(),
        prediction_result: careerPath,
      };
      const newHistoryModel = new this.resumeHistoryModel(newResumeHistory);
      const createdHistory = await newHistoryModel.save();
      return createdHistory;
    } catch (err) {
      return err;
    }
  }

  async getPredictionHistoriesByEmail(email: string) {
    const histories = await this.resumeHistoryModel
      .find({
        resume_owner: email,
      })
      .exec();
    return histories;
  }

  async getPredictionHistoryById(objectId: string) {
    const history = await this.resumeHistoryModel.findById(objectId).exec();
    return history;
  }

  async deletePredictionHistoryById(id: string) {
    const result = await this.resumeHistoryModel.deleteOne({ _id: id });
    if (result.acknowledged) {
      return { msg: 'delete successful' };
    } else {
      return { msg: 'error occured' };
    }
  }

  async getAllSkillData() {
    const skillDatas: SkillDataDto[] = await this.skillDataModel.find().exec();
    return skillDatas;
  }

  async getCareerPathDataWithSkill(careerPath: string) {
    try {
      const careerInfo: ICareerPathWithSkill = await this.careerPathDataModel
        .aggregate([
          {
            $match: {
              career_path_name: careerPath,
            },
          },
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
            },
          },
        ])
        .then((data) => data[0]);

      const careerPathInfoWithSkill: ICareerPathWithSkill = careerInfo;
      return careerPathInfoWithSkill;
    } catch (error) {
      return error;
    }
  }

  async getAllCareerData() {
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

    return careerPathData;
  }
}

@Injectable()
export class ResumeService {
  constructor(
    @InjectModel(ResumeHistory.name)
    private resumeHistoryModel: Model<ResumeHistory>,
  ) {}

  async countCareermate(careerPath: string): Promise<number> {
    try {
      const careermate_count = await this.resumeHistoryModel
        .countDocuments({
          prediction_result: careerPath,
          $and: [
            { 'resume_input.skill': { $nin: ['-', '.'] } },
            { 'resume_input.experience': { $nin: ['-', '.'] } },
          ],
        })
        .exec();
      return careermate_count;
    } catch (err) {
      return err;
    }
  }

  mapCareerAndSkill(careerPathData: ICareerPathWithSkill, skillDatas: SkillDataDto[], userResume: IUserResumeInfo) {
    const mappedRelatedCareer = careerPathData.related_careers.map((career) => {
      const updatedSkillDomains = career.skill_domains.map((domain) => {
        const updatedSkillList = domain.skill_list.map((skill) => {
          return this.classifyCoreSkill(skill, userResume.skill);
        });
        return { ...domain, skill_list: updatedSkillList };
      });
    
      const alt_skills = this.classifyAlternativeSkill(
        skillDatas,
        userResume.skill,
      );
    
      return { ...career, skill_domains: updatedSkillDomains, alt_skills };
    });
    return mappedRelatedCareer;
  }

  sortCareerData(careerPathData) {
    const sortedCareerPathData = careerPathData
      .sort((a, b) => a.career_path_name.localeCompare(b.career_path_name))
      .map(careerPath => ({
        ...careerPath,
        related_careers: careerPath.related_careers
          .sort((a, b) => a.career.localeCompare(b.career))
          .map(career => ({
            ...career,
            soft_skills: this.sortByLocaleCompare(career.soft_skills, item => item.id),
            skill_domains: this.processSkillDomains(career.skill_domains)
          }))
      }));

    return sortedCareerPathData;
  }

  sortByLocaleCompare (items, accessor) {
    return items.sort((a, b) => accessor(a).localeCompare(accessor(b)));
  };

  processSkillDomains (domains) {
    return domains.map(domain => ({
      ...domain,
      skill_list: this.sortByLocaleCompare(domain.skill_list,item => item[0])
    })).sort((a, b) => a.id.localeCompare(b.id));
  };

  splitUserSkill(userSkill: string) {
    const userSkillWithLineBreak = userSkill
      .replace(/[,\/]/g, '\n')
      .replace(/\((.*?)\)/g, (_, content) => `\n${content}\n`);
    const splittedUserSkill = userSkillWithLineBreak.split('\n');
    const trimmedUserSkill = splittedUserSkill.map((userSkill) =>
      userSkill.trim(),
    );
    return trimmedUserSkill;
  }

  removeDuplicateSkill(data: ICareerPathClassify) {
    const uniqedData: ICareerPathClassify = {
      ...data,
      related_careers: data.related_careers.map((career) => {
        const currentCareerDomain = career.skill_domains;
        return {
          ...career,
          alt_skills: career.alt_skills.filter((altSkill) => {
            return !currentCareerDomain.some((domain) => {
              return domain.skill_list.some((skill) => {
                return skill.name.join('') == altSkill.name.join('');
              });
            });
          }),
        };
      }),
    };
    return uniqedData;
  }

  classifyCoreSkill(skills: string[], userSkill: string) {
    const splittedUserSkill = this.splitUserSkill(userSkill);
    const isExisInResume = skills.some((skill) =>
      splittedUserSkill.some(
        (splitUserSkill) =>
          splitUserSkill.toLocaleLowerCase() == skill.toLocaleLowerCase(),
      ),
    );
    return {
      name: skills,
      isExisInResume: isExisInResume,
    };
  }

  classifyAlternativeSkill(skillDatas: SkillDataDto[], userSkill: string) {
    const splittedUserSkill = this.splitUserSkill(userSkill);
    const classifiedSkill = skillDatas.map((skillData) => {
      if (
        skillData.name.some((skill) =>
          splittedUserSkill.some(
            (splitUserSkill) =>
              splitUserSkill.toLocaleLowerCase() == skill.toLocaleLowerCase(),
          ),
        )
      ) {
        return { name: skillData.name };
      } else {
        return { name: [] };
      }
    });
    const filteredSkill = classifiedSkill.filter(
      (skill) => skill.name.length > 0,
    );
    return filteredSkill;
  }
}

export class Developer implements CareerPathDataDto {
  related_careers: [{"career":"Frontend Developer","skill_domains":["domain01","domain02","domain03","domain04","domain05","domain06"],"soft_skills":["900","901","902","903","904","905","906","907","908"]},{"career":"Backend Developer","skill_domains":["domain01","domain04","domain05","domain06","domain07","domain08","domain09"],"soft_skills":["900","901","902","903","904","905","906","907","908"]},{"career":"Full-Stack Developer","skill_domains":["domain01","domain02","domain03","domain04","domain05","domain06","domain07","domain08","domain09"],"soft_skills":["900","901","902","903","904","905","906","907","908"]},{"career":"Mobile Developer","skill_domains":["domain01","domain05","domain06","domain10"],"soft_skills":["900","901","902","903","904","905","906","907","908"]}];
  career_path_name: 'Developer';
  career_path_description: 'ผู้รังสรรค์ ออกแบบ เขียนโค้ดเพื่อพัฒนาหรือแก้ไขซอฟต์แวร์ให้เป็นไปตามที่ต้องการ';
  base_salary: {
    min_salary: 27000,
    max_salary: 40000
  };
}

export class Designer implements CareerPathDataDto {
  related_careers: [{"career":"UX Researcher","skill_domains":["domain32","domain33","domain39","domain40","domain42","domain43","domain44","domain45"],"soft_skills":["900","902","907","909","910","911","912","913"]},{"career":"UI Designer","skill_domains":["domain01","domain34","domain35","domain36","domain38","domain39","domain40","domain41","domain42","domain43","domain44","domain45"],"soft_skills":["902","906","907","909","910","911","912","914","915","916","917"]},{"career":"UX Writer","skill_domains":["domain37","domain38","domain39","domain40","domain41","domain42","domain43","domain44","domain45"],"soft_skills":["900","902","907","909"]},{"career":"Web Designer","skill_domains":["domain01","domain36","domain38","domain39","domain40","domain41","domain42","domain45"],"soft_skills":["900","901","909"]},{"career":"Product Designer","skill_domains":["domain01","domain32","domain33","domain34","domain35","domain36","domain38","domain39","domain40","domain41","domain42","domain43","domain44","domain45"],"soft_skills":["901","902","906","907","909","910","911","912","914","915","916","918"]}];
  career_path_name: 'Designer';
  career_path_description: 'ออกแบบและสร้างประสบการณ์ดิจิทัลโปรดักที่ดี ผ่านอินเทอร์เฟซที่ใช้งานง่าย สวยงาม และการออกแบบที่ใส่ใจผู้ใช้';
  base_salary: {
    min_salary: 20000,
    max_salary: 45000
  };
}

export class DataAI implements CareerPathDataDto {
  related_careers: [{"career":"Data Engineer","skill_domains":["domain05","domain06","domain21","domain31"],"soft_skills":["901","902","907","913","916"]},{"career":"Data Scientist","skill_domains":["domain05","domain06","domain22","domain23","domain31"],"soft_skills":["901","907","910","922"]},{"career":"Data Analyst","skill_domains":["domain05","domain06","domain20","domain24","domain31"],"soft_skills":["901","902","914","916","918"]}];
  career_path_name: 'Data & AI';
  career_path_description: 'ผู้วิเคราะห์ข้อมูลเพื่อในไปประกอบการตัดสินใจต่าง ๆ หรือพัฒนาและปรับปรุงโมเดลปัญญาประดิษฐ์เพื่อจุดประสงค์เฉพาะทาง';
  base_salary: {
    min_salary: 25000,
    max_salary: 40000
  };
}

export class Security implements CareerPathDataDto {
  related_careers: [{"career":"Cybersecurity Engineer","skill_domains":["domain01","domain12","domain13","domain25","domain26","domain27","domain28","domain29","domain30"],"soft_skills":["901","902","913","919","920","921"]},{"career":"Cybersecurity Analyst","skill_domains":["domain01","domain12","domain13","domain25","domain26","domain27","domain28","domain29","domain30"],"soft_skills":["901","902","913","919","920","921","924"]}];
  career_path_name: 'Security';
  career_path_description: 'ออกแบบและดูแลระบบความปลอดภัยของข้อมูลและเครือข่าย รวมถึงป้องกันและตรวจสอบการบุกรุกทางไซเบอร์';
  base_salary: {
    min_salary: 25000,
    max_salary: 40000
  };
}

export class CloudManagement implements CareerPathDataDto {
  related_careers: [{"career":"DevOps","skill_domains":["domain01","domain05","domain06","domain09","domain11","domain12","domain13","domain14"],"soft_skills":["900","901","902","903","904","905","906","907","908"]},{"career":"System Architecture","skill_domains":["domain01","domain05","domain06","domain09","domain11","domain12","domain13","domain15","domain16","domain17"],"soft_skills":["900","901","902","903","904","905","906","907","908"]}];
  career_path_name: 'Cloud Management';
  career_path_description: 'บริหารจัดการระบบคลาวด์เพื่อให้บริการที่มีประสิทธิภาพและมีคุณภาพ รวมถึงพัฒนาและปรับปรุงโครงสร้างคลาวด์';
  base_salary: {
    min_salary: 30000,
    max_salary: 40000
  };
}

export class Tester implements CareerPathDataDto {
  related_careers: 
  [{"career":"Quality Assurance Engineer (Manual/Automate)","skill_domains":["domain04","domain05","domain06","domain18","domain19","domain20"],"soft_skills":["901","902","909","913","922","923"]},{"career":"Software Tester (Manual/Automate)","skill_domains":["domain04","domain05","domain06","domain18","domain19"],"soft_skills":["902","909","913","922","923"]}];
  career_path_name: 'QA & Tester';
  career_path_description: 'ทดสอบและตรวจสอบซอฟต์แวร์เพื่อความเสถียรและประสิทธิภาพ รวมถึงรายงานและแก้ไขข้อผิดพลาดที่พบ เพื่อให้ทำงานตามที่ต้องการได้';
  base_salary: {
    min_salary: 27000,
    max_salary: 45000
  };
}