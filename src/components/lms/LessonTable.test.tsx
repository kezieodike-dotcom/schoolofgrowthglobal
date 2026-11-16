import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LessonTable } from './LeadershipLessonBlocks.js';

test('Word table cells keep embedded line breaks and pipes without interpreting source HTML', () => {
  const rows = [['Topic', 'Details'], ['AI | automation', 'First line\nSecond line <script>untrusted()</script>']];
  const markup = renderToStaticMarkup(createElement(LessonTable, { content: 'Topic|Details\nAI|First<br>Second', rows }));
  assert.ok(markup.includes('AI | automation'));
  assert.ok(markup.includes('First line\nSecond line'));
  assert.ok(markup.includes('&lt;script&gt;'));
  assert.ok(!markup.includes('<script>'));
  assert.ok(!markup.includes('&lt;br&gt;'));
  assert.equal((markup.match(/<td /g) ?? []).length, 2);
});
