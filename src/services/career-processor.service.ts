import { Injectable } from "@nestjs/common";
import { SkillDataDto } from "src/dtos/skill-data.dto";
import { ICareerPathClassify, ISkillType } from "src/interfaces/career-insight.interface";

@Injectable()
export class CareerProcessorService {
    constructor() { }

    sortCareerPathData(careerPathData) {
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

    mapRelatedCareer(careerPathData, skillDatas, userResume) {
        const mappedRelatedCareer = careerPathData.related_careers.map((career) => {
            return {
                ...career,
                skill_domains: career.skill_domains.map((domain) => {
                    return {
                        ...domain,
                        skill_list: domain.skill_list.map((skill): ISkillType => {
                            return this.classifyCoreSkill(skill, userResume.skill);
                        }),
                    };
                }),
                alt_skills: this.classifyAlternativeSkill(skillDatas, userResume.skill),
            };
        });
        return mappedRelatedCareer;
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
}