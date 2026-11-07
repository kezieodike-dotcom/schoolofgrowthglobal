import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { COURSES } from '../data/mockData.js';
import { COURSE_COVERS, INTENSIVE_COURSES, getCourseCover } from '../data/courseIntroductions.js';
import { CourseIntroductionCard } from '../components/CourseIntroductionCard.js';

test('every single course and two-week intensive has a relevant local cover', () => {
  const singleCoverSources = new Set<string>();
  for (const course of COURSES.filter(course => !['growth-foundation-cohort', 'growth-accelerator', 'executive-circle', 'elite-council'].includes(course.id))) {
    assert.ok(COURSE_COVERS[course.id], course.id);
    const cover = getCourseCover(course);
    assert.ok(fs.existsSync(path.join(process.cwd(), 'public', cover.src)), cover.src);
    assert.ok(cover.alt.length > 30);
    assert.ok(!cover.src.startsWith('/people/'), course.id);
    assert.ok(!singleCoverSources.has(cover.src), `Repeated single-course cover: ${cover.src}`);
    singleCoverSources.add(cover.src);
  }
  assert.equal(INTENSIVE_COURSES.length, 2);
  for (const course of INTENSIVE_COURSES) {
    assert.ok(fs.existsSync(path.join(process.cwd(), 'public', course.cover.src)), course.id);
    assert.equal(course.moduleTitles.length, 3);
  }
});

test('curated covers replace legacy images without overwriting admin uploads', () => {
  const course = { id: 'algorithmic-strategy', title: 'AI Governance', heroImage: '/people/w3-balogun.jpg' };
  assert.equal(getCourseCover(course).src, COURSE_COVERS[course.id].src);
  assert.equal(getCourseCover({ ...course, heroImage: '/uploads/custom-ai.jpg' }).src, '/uploads/custom-ai.jpg');
  assert.equal(getCourseCover({ ...course, id: 'new-course', heroImage: '/uploads/new.jpg' }).src, '/uploads/new.jpg');
});

test('course introductions put an undimmed picture before the title and expose separate real links', () => {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null,
    React.createElement(CourseIntroductionCard, {
      id: 'example', title: 'A clear course title', description: 'Original course description.',
      cover: { src: '/scenes/leadership-meeting.jpg', alt: 'Professionals learning leadership together' },
      eyebrow: 'School of Leadership', duration: '2 weeks', detail: 'Self-paced',
      primaryAction: { label: 'Enrol now', to: '/checkout/growth-foundation-fast-track?delivery=self-paced' },
      secondaryAction: { label: 'More info', to: '/courses/example' },
    })));
  assert.ok(html.indexOf('<img') < html.indexOf('<h3'));
  assert.match(html, /loading="lazy"/);
  assert.doesNotMatch(html, /grayscale|opacity-75|bg-gradient-to-t/);
  assert.match(html, /href="\/courses\/example"/);
  assert.match(html, /delivery=self-paced/);
  assert.equal((html.match(/<a /g) ?? []).length, 2);
  assert.doesNotMatch(html, /<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a\b/);
  assert.match(html, /A clear course title/);
});
