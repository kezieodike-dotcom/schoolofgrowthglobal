import { SPECIALIST_COURSES } from './specialistCourses.js';

export interface ProfessionalCourse {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  category: string;
  faculty: string;
  schoolId: string;
  feeNaira: number;
  hours: string;
  moduleCount: number;
  questionCount: number;
  assessmentDescription: string;
  applicationDescription: string;
  image: string;
  alt: string;
  summary: string;
  audience: string;
  outcomes: readonly string[];
}

export const PROFESSIONAL_FACULTY = 'Faculty of Organizational Excellence and Workplace Operations';

export const PROFESSIONAL_COURSES = [
  {
    id: 'customer-relationship-service-excellence',
    code: 'SGG-POO-002',
    title: 'Customer Relationship Management and Service Excellence',
    shortTitle: 'Turn good service into lasting relationships.',
    category: 'Customer experience',
    faculty: PROFESSIONAL_FACULTY,
    schoolId: 'marketing-sales-and-business-development',
    feeNaira: 2500,
    hours: '12–14 training hours',
    moduleCount: 6,
    questionCount: 15,
    assessmentDescription: '15-question knowledge assessment',
    applicationDescription: 'Workplace exercises and project',
    image: '/courses/customer-service-excellence-v1.webp',
    alt: 'Nigerian customer service professional listening attentively to a client at a reception desk',
    summary: 'Understand customer needs, communicate with confidence, resolve complaints and build the relationships that bring people back.',
    audience: 'Customer service teams, front-desk staff, sales professionals, supervisors and business owners.',
    outcomes: ['Understand the customer journey and set service standards', 'Handle complaints and recover customer confidence', 'Manage customer records and protect their information', 'Use feedback and service indicators to improve performance'],
  },
  {
    id: 'professional-ethics-workplace-integrity',
    code: 'SGG-POO-003',
    title: 'Professional Ethics, Workplace Conduct and Organizational Integrity',
    shortTitle: 'Build a reputation people can trust.',
    category: 'Workplace integrity',
    faculty: PROFESSIONAL_FACULTY,
    schoolId: 'human-resources-and-talent-management',
    feeNaira: 2500,
    hours: '12–14 training hours',
    moduleCount: 7,
    questionCount: 15,
    assessmentDescription: '15-question knowledge assessment',
    applicationDescription: 'Workplace exercises and project',
    image: '/courses/professional-ethics-integrity-v1.webp',
    alt: 'Nigerian colleagues discussing a workplace policy openly and respectfully around a meeting table',
    summary: 'Make responsible decisions, handle sensitive information and contribute to a respectful, accountable and ethical workplace.',
    audience: 'Employees, supervisors, managers, administrators, HR teams, public servants and organizational leaders.',
    outcomes: ['Apply professional ethics to everyday workplace decisions', 'Recognise conflicts of interest and protect confidentiality', 'Respond appropriately to misconduct and workplace concerns', 'Strengthen accountability and responsible use of resources'],
  },
  ...SPECIALIST_COURSES,
] as const satisfies readonly ProfessionalCourse[];

export type ProfessionalCourseId = typeof PROFESSIONAL_COURSES[number]['id'];
export function isProfessionalCourseId(value: unknown): value is ProfessionalCourseId {
  return PROFESSIONAL_COURSES.some(course => course.id === value);
}
