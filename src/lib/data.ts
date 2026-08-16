/**
 * Public data facade for the portfolio.
 * Domain registries live in focused modules so content changes do not create a
 * single 500-line dependency surface for every consumer.
 */
export type { ExperienceLogo, WorkExperience, Project, Education, Certification } from "./data/types"
export { personalInfo, social } from "./data/personal"
export { getWorkExperience } from "./data/work"
export { getProjects } from "./data/projects"
export { getEducation } from "./data/education"
export { getCertifications } from "./data/certifications"
export { canonicalTechnologies, skills } from "./data/skills"
export { getAboutMe } from "./data/about"
