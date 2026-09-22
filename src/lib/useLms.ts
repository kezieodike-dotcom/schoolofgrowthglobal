import { useState, useEffect, useCallback, useRef } from 'react';
import { LmsCourse, LmsProgress, LmsSubmission } from '../types';

const DEFAULT_USER_ID = 'student-demo';

// ─── Course Fetching ────────────────────────────────────────────────────────

export function useLmsCourse(courseId: string) {
  const [course, setCourse] = useState<LmsCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/lms/courses/${courseId}`)
      .then(r => r.json())
      .then(data => { setCourse(data); setLoading(false); })
      .catch(err => { setError(String(err)); setLoading(false); });
  }, [courseId]);

  return { course, loading, error };
}

// ─── Progress Tracking ──────────────────────────────────────────────────────

export function useLmsProgress(courseId: string, totalLessons: number) {
  const [progress, setProgress] = useState<LmsProgress>({
    userId: DEFAULT_USER_ID,
    courseId,
    completedLessons: [],
    progressPercentage: 0,
  });

  useEffect(() => {
    fetch(`/api/lms/progress/${DEFAULT_USER_ID}/${courseId}`)
      .then(r => r.json())
      .then((data: LmsProgress) => setProgress(data))
      .catch(() => {});
  }, [courseId]);

  const markLessonComplete = useCallback((lessonId: string) => {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
      return updated;
    });
  }, [courseId, totalLessons]);

  const isLessonComplete = (lessonId: string) =>
    progress.completedLessons.includes(lessonId);

  return { progress, markLessonComplete, isLessonComplete };
}

// ─── Submission (Auto-Save) ─────────────────────────────────────────────────

export function useLmsSubmission(courseId: string, blockId: string) {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/lms/submission/${DEFAULT_USER_ID}/${courseId}/${blockId}`)
      .then(r => r.json())
      .then((sub: LmsSubmission | null) => {
        if (sub) setData(sub.data);
      })
      .catch(() => {});
  }, [courseId, blockId]);

  const save = useCallback((newData: any) => {
    setData(newData);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSaving(true);
      const submission: LmsSubmission = {
        userId: DEFAULT_USER_ID,
        courseId,
        moduleId: 'module-1',
        lessonId: '',
        blockId,
        data: newData,
      };
      fetch('/api/lms/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      })
        .then(() => { setSaving(false); setSavedAt(new Date()); })
        .catch(() => setSaving(false));
    }, 1500);
  }, [courseId, blockId]);

  return { data, save, saving, savedAt };
}
