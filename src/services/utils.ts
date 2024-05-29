export const sortByLocale = (key: string | number) => (a, b) =>
  a[key].localeCompare(b[key]);

export const sortSkillList = (skillList: string[][]) =>
  skillList.sort(sortByLocale(0));

export const sortSkillDomains = (domains) =>
  domains
    .sort(sortByLocale('id'))
    .map((domain) => ({
      ...domain,
      skill_list: sortSkillList(domain.skill_list),
    }));

export const sortCareers = (careers) =>
  careers
    .sort(sortByLocale('career'))
    .map((career) => ({
      ...career,
      soft_skills: career.soft_skills.sort(sortByLocale('id')),
      skill_domains: sortSkillDomains(career.skill_domains),
    }));
