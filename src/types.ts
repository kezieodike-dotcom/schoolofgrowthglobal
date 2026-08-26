export type ViewType =
  | 'home'
  | 'course-detail'
  | 'student-dashboard'
  | 'command-center';

export interface School {
  id: string;
  name: string;
  code: string;
  iconName: string;
  tagline: string;
  overview: string;
  programCount: number;
  keyTopics: string[];
  careerPaths: string[];
  certifications: string[];
  accentColor: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  location: string;
  bio: string;
  rating: number;
  sessions: number;
  rate: string;
  availability: 'Available' | 'Limited' | 'Waitlist';
  avatar: string;
  featured?: boolean;
  specialization?: string;
  yearsExperience?: number;
  languages?: string[];
  regionsServed?: string[];
  menteeCount?: number;
  intro?: string;
  availableDays?: string[];
}

export interface GrowthJob {
  id: string;
  title: string;
  organization: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  level: string;
  salary: string;
  posted: string;
  closes: string;
  summary: string;
  requirements: string[];
  tags: string[];
  image: string;
  applicationEmail?: string;
  featured?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  type: 'Conference' | 'Webinar' | 'Seminar' | 'Workshop' | 'Bootcamp' | 'Virtual Summit';
  date: string;
  time: string;
  location: string;
  mode: 'In-Person' | 'Virtual' | 'Hybrid';
  speaker: string;
  description: string;
  price: string;
  seatsLeft: number;
  image: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  authorRole: string;
  readTime: string;
  date: string;
  image: string;
  featured?: boolean;
}

export interface Course {
  id: string;
  title: string;
  schoolId: string;
  schoolName: string;
  duration: string;
  level: 'Executive' | 'Emerging Leaders' | 'Senior Directorate' | 'Frontier';
  format: string;
  instructorName: string;
  instructorRole: string;
  instructorAvatar: string;
  rating: number;
  reviewCount: number;
  status: string;
  heroImage: string;
  description: string;
  outcomes: string[];
  modules: {
    week: string;
    title: string;
    description: string;
    topics: string[];
  }[];
  price: string;
  featured?: boolean;
}

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  institution: string;
  bio: string;
  credentials: string[];
  avatar: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  organization: string;
  avatar: string;
  metric: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: string;
}

export interface StudentTrack {
  id: string;
  title: string;
  schoolName: string;
  progressPercentage: number;
  nextModule: string;
  dueDate: string;
  modulesCompleted: number;
  moduleCount: number;
  instructorName: string;
  instructorAvatar: string;
}

export interface StudentSession {
  id: string;
  title: string;
  type: 'Live Class' | 'Mentor Session' | 'Assessment' | 'Workshop';
  date: string;
  time: string;
  mode: 'Virtual' | 'In-Person';
  host: string;
}

export interface StudentCertificate {
  id: string;
  title: string;
  status: 'Earned' | 'In Progress' | 'Locked';
  issued?: string;
  credentialId?: string;
  /** Percent complete; only meaningful while status is In Progress. */
  progressPercentage?: number;
  target?: string;
}

export interface StudentProgress {
  name: string;
  title: string;
  company: string;
  tier: string;
  avatar: string;
  completionPercentage: number;
  daysAhead: number;
  activeTracks: StudentTrack[];
  completedCourses: number;
  totalCertificates: number;
  studyHours: number;
  upcoming: StudentSession[];
  certificates: StudentCertificate[];
  mentor: {
    name: string;
    role: string;
    avatar: string;
    nextSession: string;
  };
}
