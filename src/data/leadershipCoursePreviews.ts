import type { LeadershipCourseId } from './leadershipPricing';

type CoursePreview = {
  summary: string;
  image: string;
  alt: string;
};

export const leadershipCoursePreviews: Partial<Record<LeadershipCourseId, CoursePreview>> = {
  'leadership-001': {
    summary: 'Build your understanding of leadership, personal responsibility and the principles that help you guide people with purpose.',
    image: '/lessons/classrooms/module-1-01.jpg',
    alt: 'African facilitator guiding adult learners through a classroom discussion',
  },
  'leadership-004': {
    summary: 'Use strategic foresight to develop a clear vision, build commitment and turn that vision into an implementation plan.',
    image: '/lessons/classrooms/module-3-04.jpg',
    alt: 'Facilitator leading a vision and goal-setting class',
  },
  'leadership-005': {
    summary: 'Assess your competitive environment, choose strategic priorities and turn a five-year strategy into measurable action.',
    image: '/scenes/bootcamp-team.jpg',
    alt: 'Participants working through a planning exercise',
  },
  'leadership-006': {
    summary: 'Set expectations, delegate responsibly and build systems for performance, feedback and employee development.',
    image: '/lessons/classrooms/module-5-05.jpg',
    alt: 'Facilitator discussing workplace communication with adult learners',
  },
  'leadership-010': {
    summary: 'Identify root causes, evaluate trade-offs and make responsible decisions under uncertainty or pressure.',
    image: '/lessons/classrooms/module-4-06.jpg',
    alt: 'Instructor guiding a group through a planning session',
  },
  'leadership-014': {
    summary: 'Recognise emotional triggers, regulate your responses and practise empathy in feedback, conflict and team leadership.',
    image: '/lessons/classrooms/module-1-03.jpg',
    alt: 'Facilitator teaching self-awareness to adult learners',
  },
  'leadership-015': {
    summary: 'Align people, structures and resources with institutional goals and build systems that sustain performance over time.',
    image: '/scenes/leadership-meeting.jpg',
    alt: 'Professionals discussing leadership around a meeting table',
  },
};
