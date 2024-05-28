import { Injectable } from "@nestjs/common";
import { CareerPathDataDto } from "src/dtos/career-path-data.dto";

@Injectable()
export class CareerFactoryService {
    constructor() { }

    async getCareerPathInfo(careerPath: string) {
        try {
            if (careerPath == 'Developer') {
                return new Developer();
            } else if (careerPath == 'Designer') {
                return new Designer();
            } else if (careerPath == 'Data & AI') {
                return new DataAI();
            } else if (careerPath == 'Security') {
                return new Security();
            } else if (careerPath == 'Cloud Management') {
                return new CloudManagement();
            } else if (careerPath == 'QA & Tester') {
                return new Tester();
            } else {
                return new Error('invalid career path');
            }
        } catch (err) {
            return err;
        }
    }
}

export class Developer implements CareerPathDataDto {
    related_careers = [{ "career": "Frontend Developer", "skill_domains": ["domain01", "domain02", "domain03", "domain04", "domain05", "domain06"], "soft_skills": ["900", "901", "902", "903", "904", "905", "906", "907", "908"] }, { "career": "Backend Developer", "skill_domains": ["domain01", "domain04", "domain05", "domain06", "domain07", "domain08", "domain09"], "soft_skills": ["900", "901", "902", "903", "904", "905", "906", "907", "908"] }, { "career": "Full-Stack Developer", "skill_domains": ["domain01", "domain02", "domain03", "domain04", "domain05", "domain06", "domain07", "domain08", "domain09"], "soft_skills": ["900", "901", "902", "903", "904", "905", "906", "907", "908"] }, { "career": "Mobile Developer", "skill_domains": ["domain01", "domain05", "domain06", "domain10"], "soft_skills": ["900", "901", "902", "903", "904", "905", "906", "907", "908"] }];
    career_path_name = 'Developer';
    career_path_description = 'ผู้รังสรรค์ ออกแบบ เขียนโค้ดเพื่อพัฒนาหรือแก้ไขซอฟต์แวร์ให้เป็นไปตามที่ต้องการ';
    base_salary = {
        min_salary: 27000,
        max_salary: 40000
    };
}

export class Designer implements CareerPathDataDto {
    related_careers = [{ "career": "UX Researcher", "skill_domains": ["domain32", "domain33", "domain39", "domain40", "domain42", "domain43", "domain44", "domain45"], "soft_skills": ["900", "902", "907", "909", "910", "911", "912", "913"] }, { "career": "UI Designer", "skill_domains": ["domain01", "domain34", "domain35", "domain36", "domain38", "domain39", "domain40", "domain41", "domain42", "domain43", "domain44", "domain45"], "soft_skills": ["902", "906", "907", "909", "910", "911", "912", "914", "915", "916", "917"] }, { "career": "UX Writer", "skill_domains": ["domain37", "domain38", "domain39", "domain40", "domain41", "domain42", "domain43", "domain44", "domain45"], "soft_skills": ["900", "902", "907", "909"] }, { "career": "Web Designer", "skill_domains": ["domain01", "domain36", "domain38", "domain39", "domain40", "domain41", "domain42", "domain45"], "soft_skills": ["900", "901", "909"] }, { "career": "Product Designer", "skill_domains": ["domain01", "domain32", "domain33", "domain34", "domain35", "domain36", "domain38", "domain39", "domain40", "domain41", "domain42", "domain43", "domain44", "domain45"], "soft_skills": ["901", "902", "906", "907", "909", "910", "911", "912", "914", "915", "916", "918"] }];
    career_path_name = 'Designer';
    career_path_description = 'ออกแบบและสร้างประสบการณ์ดิจิทัลโปรดักที่ดี ผ่านอินเทอร์เฟซที่ใช้งานง่าย สวยงาม และการออกแบบที่ใส่ใจผู้ใช้';
    base_salary = {
        min_salary: 20000,
        max_salary: 45000
    };
}

export class DataAI implements CareerPathDataDto {
    related_careers = [{ "career": "Data Engineer", "skill_domains": ["domain05", "domain06", "domain21", "domain31"], "soft_skills": ["901", "902", "907", "913", "916"] }, { "career": "Data Scientist", "skill_domains": ["domain05", "domain06", "domain22", "domain23", "domain31"], "soft_skills": ["901", "907", "910", "922"] }, { "career": "Data Analyst", "skill_domains": ["domain05", "domain06", "domain20", "domain24", "domain31"], "soft_skills": ["901", "902", "914", "916", "918"] }];
    career_path_name = 'Data & AI';
    career_path_description = 'ผู้วิเคราะห์ข้อมูลเพื่อในไปประกอบการตัดสินใจต่าง ๆ หรือพัฒนาและปรับปรุงโมเดลปัญญาประดิษฐ์เพื่อจุดประสงค์เฉพาะทาง';
    base_salary = {
        min_salary: 25000,
        max_salary: 40000
    };
}

export class Security implements CareerPathDataDto {
    related_careers = [{ "career": "Cybersecurity Engineer", "skill_domains": ["domain01", "domain12", "domain13", "domain25", "domain26", "domain27", "domain28", "domain29", "domain30"], "soft_skills": ["901", "902", "913", "919", "920", "921"] }, { "career": "Cybersecurity Analyst", "skill_domains": ["domain01", "domain12", "domain13", "domain25", "domain26", "domain27", "domain28", "domain29", "domain30"], "soft_skills": ["901", "902", "913", "919", "920", "921", "924"] }];
    career_path_name = 'Security';
    career_path_description = 'ออกแบบและดูแลระบบความปลอดภัยของข้อมูลและเครือข่าย รวมถึงป้องกันและตรวจสอบการบุกรุกทางไซเบอร์';
    base_salary = {
        min_salary: 25000,
        max_salary: 40000
    };
}

export class CloudManagement implements CareerPathDataDto {
    related_careers = [{ "career": "DevOps", "skill_domains": ["domain01", "domain05", "domain06", "domain09", "domain11", "domain12", "domain13", "domain14"], "soft_skills": ["900", "901", "902", "903", "904", "905", "906", "907", "908"] }, { "career": "System Architecture", "skill_domains": ["domain01", "domain05", "domain06", "domain09", "domain11", "domain12", "domain13", "domain15", "domain16", "domain17"], "soft_skills": ["900", "901", "902", "903", "904", "905", "906", "907", "908"] }];
    career_path_name = 'Cloud Management';
    career_path_description = 'บริหารจัดการระบบคลาวด์เพื่อให้บริการที่มีประสิทธิภาพและมีคุณภาพ รวมถึงพัฒนาและปรับปรุงโครงสร้างคลาวด์';
    base_salary = {
        min_salary: 30000,
        max_salary: 40000
    };
}

export class Tester implements CareerPathDataDto {
    related_careers =
        [{ "career": "Quality Assurance Engineer (Manual/Automate)", "skill_domains": ["domain04", "domain05", "domain06", "domain18", "domain19", "domain20"], "soft_skills": ["901", "902", "909", "913", "922", "923"] }, { "career": "Software Tester (Manual/Automate)", "skill_domains": ["domain04", "domain05", "domain06", "domain18", "domain19"], "soft_skills": ["902", "909", "913", "922", "923"] }];
    career_path_name = 'QA & Tester';
    career_path_description = 'ทดสอบและตรวจสอบซอฟต์แวร์เพื่อความเสถียรและประสิทธิภาพ รวมถึงรายงานและแก้ไขข้อผิดพลาดที่พบ เพื่อให้ทำงานตามที่ต้องการได้';
    base_salary = {
        min_salary: 27000,
        max_salary: 45000
    };
}
