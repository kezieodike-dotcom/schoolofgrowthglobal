import { getStudentSubmission, saveStudentSubmission } from './lmsStore.js';

export const MODULE_8_ASSESSMENT = {
  courseId: 'growth-foundation',
  moduleId: 'module-8',
  lessonId: 'module-8-lesson-16',
  blockId: 'module-8-objective-test',
  passMark: 70,
  questions: [
    {
      id: 'q1',
      prompt: 'Which statement best describes digital literacy?',
      options: [
        { id: 'A', label: 'Owning an expensive smartphone.' },
        { id: 'B', label: 'Spending several hours each day on social media.' },
        { id: 'C', label: 'Using digital technologies effectively, evaluating information, communicating responsibly, and protecting information.' },
        { id: 'D', label: 'Knowing how to install one mobile application.' },
      ],
      answer: 'C',
    },
    {
      id: 'q2',
      prompt: 'You receive an unexpected message claiming that your bank account will be suspended unless you click a link and provide your password and verification code. What is the safest response?',
      options: [
        { id: 'A', label: 'Click immediately because the message may be urgent.' },
        { id: 'B', label: 'Reply with your password but not your account number.' },
        { id: 'C', label: 'Forward the message to friends so they can test the link.' },
        { id: 'D', label: "Avoid the link, do not share credentials, and verify the message through the bank's official channel." },
      ],
      answer: 'D',
    },
    {
      id: 'q3',
      prompt: 'What is the main purpose of the CLEAR prompt framework?',
      options: [
        { id: 'A', label: 'To help users provide context, limitations, expected outcomes, audience, and response format.' },
        { id: 'B', label: 'To guarantee that every AI-generated answer is correct.' },
        { id: 'C', label: 'To eliminate the need for human judgment.' },
        { id: 'D', label: 'To ensure that AI always produces the shortest possible answer.' },
      ],
      answer: 'A',
    },
    {
      id: 'q4',
      prompt: 'An AI tool produces a convincing statement about a new regulation but provides no verifiable evidence. What should the user do before relying on the statement?',
      options: [
        { id: 'A', label: 'Publish it because the language sounds professional.' },
        { id: 'B', label: 'Verify the claim using appropriate authoritative sources and correct any errors.' },
        { id: 'C', label: 'Assume that all AI-generated legal information is accurate.' },
        { id: 'D', label: 'Ask the AI to repeat the same statement several times and accept it if the answers match.' },
      ],
      answer: 'B',
    },
    {
      id: 'q5',
      prompt: 'Which is an example of responsible AI use in education?',
      options: [
        { id: 'A', label: 'Submitting fabricated references because an AI tool generated them.' },
        { id: 'B', label: 'Entering confidential student records into any available AI service.' },
        { id: 'C', label: "Using AI to explain a concept, checking the information, and completing the assignment according to the institution's academic-integrity rules." },
        { id: 'D', label: 'Accepting every AI-generated answer without reviewing it.' },
      ],
      answer: 'C',
    },
  ],
} as const;

export type AssessmentResult = {
  score: number;
  total: number;
  percentage: number;
  passMark: number;
  passed: boolean;
  attempt: number;
  submittedAt: string;
};

export function isModule8Assessment(courseId: string, moduleId: string, lessonId: string): boolean {
  return courseId === MODULE_8_ASSESSMENT.courseId
    && moduleId === MODULE_8_ASSESSMENT.moduleId
    && lessonId === MODULE_8_ASSESSMENT.lessonId;
}

export function getAssessmentResult(userId: string, courseId: string, moduleId: string, lessonId: string): AssessmentResult | null {
  if (!isModule8Assessment(courseId, moduleId, lessonId)) return null;
  const submission = getStudentSubmission(userId, courseId, MODULE_8_ASSESSMENT.blockId);
  if (!submission || submission.data?.kind !== 'objective_test_result') return null;
  return submission.data.result as AssessmentResult;
}

export function gradeModule8Assessment(
  userId: string,
  courseId: string,
  moduleId: string,
  lessonId: string,
  answers: Record<string, string>
): AssessmentResult {
  if (!isModule8Assessment(courseId, moduleId, lessonId)) {
    throw new Error('Assessment not found.');
  }

  const score = MODULE_8_ASSESSMENT.questions.reduce(
    (total, question) => total + (answers[question.id] === question.answer ? 1 : 0),
    0
  );
  const total = MODULE_8_ASSESSMENT.questions.length;
  const percentage = Math.round((score / total) * 100);
  const previous = getAssessmentResult(userId, courseId, moduleId, lessonId);
  const result: AssessmentResult = {
    score,
    total,
    percentage,
    passMark: MODULE_8_ASSESSMENT.passMark,
    passed: percentage >= MODULE_8_ASSESSMENT.passMark,
    attempt: (previous?.attempt ?? 0) + 1,
    submittedAt: new Date().toISOString(),
  };

  saveStudentSubmission({
    userId,
    courseId,
    moduleId,
    lessonId,
    blockId: MODULE_8_ASSESSMENT.blockId,
    data: { kind: 'objective_test_result', result },
  });

  return result;
}
