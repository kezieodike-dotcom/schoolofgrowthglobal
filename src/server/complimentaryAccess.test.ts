import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createComplimentaryAccess, type ComplimentaryGrant } from './complimentaryAccess.js';

test('personal invitations grant only the named course for exactly 60 days, without renewal on reuse', async () => {
  const records = new Map<string, unknown>();
  let now = Date.parse('2026-11-16T12:00:00Z');
  const access = createComplimentaryAccess({
    secret: () => 'fixture-secret', now: () => now,
    keys: async prefix => [...records.keys()].filter(key => key.startsWith(prefix + '/')).map(key => key.slice(prefix.length + 1)),
    read: async <T>(key: string) => (records.get(key) ?? null) as T | null,
    write: async (key, value, overwrite = true) => {
      if (!overwrite && records.has(key)) return false;
      records.set(key, structuredClone(value)); return true;
    },
  });
  await assert.rejects(() => access.grant('leadership-001', 'Learner', 'bad@gmail'), /email/i);
  const first = await access.grant('leadership-001', 'Fixture Learner', ' LEARNER@EXAMPLE.COM ');
  assert.equal(first.record.email, 'learner@example.com');
  assert.equal(Date.parse(first.record.expiresAt) - now, 60 * 86400_000);
  assert.equal(first.record.courseId, 'leadership-001');
  assert.ok(first.code.length >= 80);
  assert.ok(!JSON.stringify([...records.values()]).includes(first.code));
  assert.equal(await access.activate(first.code, 'wrong@example.com'), null);
  assert.equal(await access.activate(first.code + 'x', 'learner@example.com'), null);
  assert.equal(await access.activate('', 'learner@example.com'), null);
  assert.equal((await access.activate(first.code, 'learner@example.com'))?.id, first.record.id);
  assert.equal((await access.forEmail('learner@example.com')).length, 1);
  assert.deepEqual(await access.forEmail('another@example.com'), []);
  now += 15 * 86400_000;
  const repeated = await access.grant('leadership-001', 'Fixture Learner', 'learner@example.com');
  assert.equal(repeated.code, first.code);
  assert.equal(repeated.record.expiresAt, first.record.expiresAt);
  const entitlement = access.entitlement(first.record);
  assert.equal(entitlement.plan, 'leadership-001');
  assert.equal(entitlement.coursesExpireAt, first.record.expiresAt);
  assert.deepEqual(entitlement.levels, []);
  assert.equal(entitlement.mentorshipExpiresAt, first.record.createdAt);
  assert.equal(entitlement.accessKind, 'complimentary');
  assert.equal(entitlement.leadershipAccess?.expiresAt, first.record.expiresAt);
  now = Date.parse(first.record.expiresAt);
  assert.equal(await access.activate(first.code, 'learner@example.com'), null);
  now--;
  assert.ok(await access.activate(first.code, 'learner@example.com'));
  await access.revoke(first.record.id);
  assert.equal(await access.activate(first.code, 'learner@example.com'), null);
  const stored = await access.read(first.record.id) as ComplimentaryGrant;
  assert.ok(stored.revokedAt);
  assert.ok((await access.grant('leadership-001', 'Fixture Learner', 'learner@example.com')).record.revokedAt);
});
