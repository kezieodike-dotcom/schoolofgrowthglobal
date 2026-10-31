import React, { useState } from 'react';
import type { LmsLesson } from '../../types';
import { getLessonClassroom } from '../../lib/lessonClassrooms';

export const LessonHero: React.FC<{ courseId: string; lesson: LmsLesson }> = ({ courseId, lesson }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const asset = getLessonClassroom(courseId, lesson);
  if (!asset || asset.src === failedSrc) return null;

  return (
    <figure className="my-6 overflow-hidden rounded-lg bg-slate-100 sm:my-8" data-lesson-classroom>
      <img
        src={asset.src}
        alt={asset.alt}
        width={1200}
        height={800}
        className="block h-auto w-full"
        decoding="async"
        fetchPriority="high"
        onError={() => setFailedSrc(asset.src)}
      />
    </figure>
  );
};
