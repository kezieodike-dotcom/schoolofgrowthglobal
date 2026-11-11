import { readFile } from 'node:fs/promises';
import { isPaidCourseId } from '../src/data/paidCourseCatalogue.js';
import { isReadyLeadershipCourse, LEADERSHIP_BUCKET, leadershipStorage } from '../src/server/leadershipCourseStore.js';
import { loadServerEnv } from '../src/server/loadEnv.js';

const maxBytes = 2 * 1024 * 1024;

async function publish() {
  const ids = [...new Set(process.argv.slice(2))];
  if (!ids.length || !ids.every(isPaidCourseId)) {
    throw new Error('Provide the catalogue IDs of the reviewed individual courses to publish.');
  }
  const files = await Promise.all(ids.map(async id => {
    const text = (await readFile(`data/lms/${id}.json`, 'utf8')).replace(/^\uFEFF/, '');
    if (Buffer.byteLength(text) > maxBytes || !isReadyLeadershipCourse(id, JSON.parse(text))) {
      throw new Error(`${id} must be a valid, published individual course smaller than 2 MB.`);
    }
    return { id, text };
  }));

  loadServerEnv();
  const storage = leadershipStorage();
  if (!storage) throw new Error('The server Supabase configuration is required.');

  const bucketPath = `/bucket/${LEADERSHIP_BUCKET}`;
  let response = await storage(bucketPath);
  let bucket = await response.json();
  if (response.status === 404 || String(bucket?.statusCode) === '404' || bucket?.error === 'not_found') {
    const created = await storage('/bucket', {
      method: 'POST',
      body: JSON.stringify({
        id: LEADERSHIP_BUCKET, name: LEADERSHIP_BUCKET, public: false,
        file_size_limit: maxBytes, allowed_mime_types: ['application/json'],
      }),
    });
    if (!created.ok && created.status !== 409) throw new Error(`Private bucket creation failed (${created.status}).`);
    response = await storage(bucketPath);
    bucket = await response.json();
  }
  if (!response.ok || bucket?.public !== false) {
    throw new Error('Refusing to upload paid lessons because the storage bucket could not be verified as private.');
  }

  for (const { id, text } of files) {
    const object = `${LEADERSHIP_BUCKET}/${id}.json`;
    const uploaded = await storage(`/object/${object}`, {
      method: 'POST', headers: { 'x-upsert': 'true', 'Cache-Control': 'no-cache' }, body: text,
    });
    if (!uploaded.ok) throw new Error(`Upload failed for ${id} (${uploaded.status}).`);
    const verified = await storage(`/object/authenticated/${object}`);
    if (!verified.ok || await verified.text() !== text) throw new Error(`Upload could not be verified for ${id}.`);
    console.log(`Published and verified ${id}.`);
  }
}

publish().catch(error => {
  console.error(error instanceof Error ? error.message : 'Course publication failed.');
  process.exitCode = 1;
});
