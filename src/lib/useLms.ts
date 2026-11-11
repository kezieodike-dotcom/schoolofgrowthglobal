import { useState, useEffect, useCallback, useRef } from 'react';
import { LmsCourse, LmsProgress, LmsSubmission } from '../types';
import { isPaidCourseId } from '../data/paidCourseCatalogue';
import { intensiveAccessToken, leadershipAccessToken } from './useEnrollment';
import { isIntensiveCourseId } from '../data/intensiveCourses';

const DEFAULT_USER_ID = 'student-demo';

function courseHeaders(courseId: string, json = false): HeadersInit {
  const token = isPaidCourseId(courseId) ? leadershipAccessToken(courseId) : isIntensiveCourseId(courseId) ? intensiveAccessToken(courseId) : undefined;
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export interface LmsAssessmentQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
}

export interface LmsAssessmentResult {
  score: number;
  total: number;
  percentage: number;
  passMark: number;
  passed: boolean;
  attempt: number;
  submittedAt: string;
}

// ─── Course Fetching ────────────────────────────────────────────────────────

export function useLmsCourse(courseId: string) {
  const [course, setCourse] = useState<LmsCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setCourse(null);
    setError(null);
    fetch(`/api/lms/courses/${encodeURIComponent(courseId)}`, { headers: courseHeaders(courseId), signal: controller.signal })
      .then(async response => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.id !== courseId || !Array.isArray(body.modules)) throw new Error(body?.error ?? 'Could not load this course.');
        if (!controller.signal.aborted) setCourse(body);
      })
      .catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Could not load this course.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [courseId]);

  return { course, loading, error };
}

// ─── Progress Tracking ──────────────────────────────────────────────────────

export function useLmsProgress(courseId: string, totalLessons: number) {
  const [saveError, setSaveError] = useState<string | null>(null);
  const [progress, setProgress] = useState<LmsProgress>({
    userId: DEFAULT_USER_ID,
    courseId,
    completedLessons: [],
    progressPercentage: 0,
  });

  useEffect(() => {
    const controller = new AbortController();
    setProgress({ userId: DEFAULT_USER_ID, courseId, completedLessons: [], progressPercentage: 0 });
    fetch(`/api/lms/progress/${DEFAULT_USER_ID}/${courseId}`, { headers: courseHeaders(courseId), signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Progress unavailable')))
      .then((data: LmsProgress) => setProgress(data))
      .catch(() => {});
    return () => controller.abort();
  }, [courseId]);

  const markLessonComplete = useCallback((lessonId: string) => {
    setSaveError(null);
    setProgress(prev => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      const updated = {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        progressPercentage: totalLessons > 0
          ? Math.round(((prev.completedLessons.length + 1) / totalLessons) * 100)
          : 0,
      };
      fetch('/api/lms/progress', {
        method: 'POST',
        headers: courseHeaders(courseId, true),
        body: JSON.stringify(updated),
      }).then(response => {
        if (!response.ok) throw new Error('Your progress could not be saved. Please try marking this lesson complete again.');
      }).catch(() => {
        setSaveError('Your progress could not be saved. Check your connection and try marking this lesson complete again.');
        setProgress(current => {
          const completedLessons = current.completedLessons.filter(id => id !== lessonId);
          return { ...current, completedLessons, progressPercentage: totalLessons ? Math.round(completedLessons.length / totalLessons * 100) : 0 };
        });
      });
      return updated;
    });
  }, [courseId, totalLessons]);

  const isLessonComplete = (lessonId: string) =>
    progress.completedLessons.includes(lessonId);

  return { progress, markLessonComplete, isLessonComplete, saveError };
}

// ─── Submission (Auto-Save) ─────────────────────────────────────────────────

export function useLmsSubmission(courseId: string, blockId: string, moduleId = 'module-1') {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/lms/submission/${DEFAULT_USER_ID}/${courseId}/${blockId}`, { headers: courseHeaders(courseId), signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then((sub: LmsSubmission | null) => {
        if (sub) setData(sub.data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [courseId, blockId]);

  const save = useCallback((newData: any) => {
    setData(newData);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSaving(true);
      const submission: LmsSubmission = {
        userId: DEFAULT_USER_ID,
        courseId,
        moduleId,
        lessonId: '',
        blockId,
        data: newData,
      };
      fetch('/api/lms/submission', {
        method: 'POST',
        headers: courseHeaders(courseId, true),
        body: JSON.stringify(submission),
      })
        .then(response => { setSaving(false); if (response.ok) setSavedAt(new Date()); })
        .catch(() => setSaving(false));
    }, 1500);
  }, [courseId, blockId, moduleId]);

  return { data, save, saving, savedAt };
}

export function useLmsAssessment(
  courseId: string,
  moduleId: string,
  lessonId: string,
  enabled: boolean
) {
  const [questions, setQuestions] = useState<LmsAssessmentQuestion[]>([]);
  const [passMark, setPassMark] = useState(70);
  const [result, setResult] = useState<LmsAssessmentResult | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/lms/assessment/${DEFAULT_USER_ID}/${courseId}/${moduleId}/${lessonId}`, {
      cache: 'no-store',
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.error ?? 'Could not load the assessment.');
        return body;
      })
      .then((body) => {
        setQuestions(body.questions ?? []);
        setPassMark(body.passMark ?? 70);
        setResult(body.result ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the assessment.'))
      .finally(() => setLoading(false));
  }, [courseId, moduleId, lessonId, enabled]);

  const submit = useCallback(async (answers: Record<string, string>) => {
    setSubmitting(true);
    setError(null);
    try {
      const request = () => fetch('/api/lms/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        credentials: 'same-origin',
        body: JSON.stringify({
          userId: DEFAULT_USER_ID,
          courseId,
          moduleId,
          lessonId,
          answers,
        }),
      });
      let response: Response;
      try {
        response = await request();
      } catch (firstError) {
        // A transient connection drop should not discard a completed test.
        response = await request();
        if (!response) throw firstError;
      }
      const responseText = await response.text();
      let body: { result?: LmsAssessmentResult; error?: string } | null = null;
      try {
        body = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error(`Assessment service returned an invalid response (${response.status}). Please try again.`);
      }
      if (!response.ok) throw new Error(body?.error ?? `Assessment submission failed (${response.status}).`);
      if (!body?.result) throw new Error('The assessment server returned no result. Please try again.');
      setResult(body.result);
      return body.result as LmsAssessmentResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the assessment.');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [courseId, moduleId, lessonId]);

  return { questions, passMark, result, loading, submitting, error, submit };
}
