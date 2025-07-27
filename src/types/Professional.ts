/**
 * Professional types and constants
 */

export interface Professional {
  id?: number;
  nome_completo: string;
  email: string;
  area_atuacao: string;
  skill_principal: string;
  nivel_experiencia: string;
  gestor_area: string;
  gestor_direto: string;
  disponivel_compartilhamento: boolean;
  percentual_compartilhamento?: number;
  created_at?: string;
  updated_at?: string;
}

export const AREAS = [
  'Desenvolvimento',
  'DevOps',
  'Data Science',
  'Cybersecurity',
  'Cloud',
  'Mobile',
  'Frontend',
  'Backend',
  'Fullstack',
  'QA/Testing',
  'Product Management',
  'UX/UI Design'
] as const;

export const MAIN_SKILLS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Spring Boot',
  'Django',
  'Flask',
  'AWS',
  'Azure',
  'GCP',
  'Docker',
  'Kubernetes',
  'Jenkins',
  'GitLab CI',
  'Terraform',
  'Ansible',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Elasticsearch'
] as const;

export const OTHER_SKILLS = [
  'Git',
  'Linux',
  'Agile',
  'Scrum',
  'Kanban',
  'REST APIs',
  'GraphQL',
  'Microservices',
  'Machine Learning',
  'AI',
  'Blockchain',
  'IoT',
  'Cybersecurity',
  'Penetration Testing',
  'OWASP',
  'CI/CD',
  'Monitoring',
  'Logging'
] as const;

export const SKILL_COLUMN_MAP = {
  cargo: 'cargo',
  linguagem: 'linguagem_principal',
  framework: 'framework_principal',
  cloud: 'plataforma_cloud',
  banco: 'banco_dados',
  bi: 'ferramenta_bi',
  devops: 'ferramenta_devops',
  ciberseguranca: 'ferramenta_ciberseguranca',
  ia: 'ferramenta_ia',
  blockchain: 'ferramenta_blockchain'
} as const;

export type Area = typeof AREAS[number];
export type MainSkill = typeof MAIN_SKILLS[number];
export type OtherSkill = typeof OTHER_SKILLS[number];
export type SkillColumn = keyof typeof SKILL_COLUMN_MAP;