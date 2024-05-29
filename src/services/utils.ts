export const sortByLocale = (key: string) => (a, b) =>
  a[key].localeCompare(b[key]);

export const sortSkillList = (skillList: string[][]) =>
  skillList.sort((a, b) => a[0].localeCompare(b[0]));

export const sortSkillDomains = (domains) =>
  domains
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((domain) => ({
      ...domain,
      skill_list: sortSkillList(domain.skill_list),
    }));

export const sortCareers = (careers) =>
  careers
    .sort((a, b) => a.career.localeCompare(b.career))
    .map((career) => ({
      ...career,
      soft_skills: career.soft_skills.sort((a, b) => a.id.localeCompare(b.id)),
      skill_domains: sortSkillDomains(career.skill_domains),
    }));
