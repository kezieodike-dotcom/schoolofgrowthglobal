import crypto from 'node:crypto';
import { Router } from 'express';
import { authorizedConversation, mentorEndpoint, MentorApiError } from './mentorAccess.js';
import { currentCall, startCall, updateCallStatus, appendCallSignal, callSignals } from './mentorCallStore.js';

export function callIceConfiguration(): { iceServers: RTCIceServer[]; relayConfigured: boolean } {
  const iceServers: RTCIceServer[] = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }];
  const urls = (process.env.TURN_URLS || '').split(',').map((value) => value.trim()).filter((url) => /^turns?:[^\s]+$/.test(url));
  const secret = process.env.TURN_SHARED_SECRET;
  if (urls.length && secret) {
    const username = `${Math.floor(Date.now() / 1000) + 5 * 3600}:sgg`;
    const credential = crypto.createHmac('sha1', secret).update(username).digest('base64');
    iceServers.push({ urls, username, credential });
  }
  return { iceServers, relayConfigured: iceServers.length > 1 };
}

export function createMentorCallRouter() {
  const router = Router();
  router.get('/mentor-calls/:threadId', mentorEndpoint(async (req, res) => {
    const { thread, role } = await authorizedConversation(req);
    const call = await currentCall(thread.id, role);
    const signals = call && req.query.callId === call.id && ['ringing', 'accepted'].includes(call.status)
      ? await callSignals(thread.id, call.id, role, typeof req.query.after === 'string' ? req.query.after : undefined) : [];
    res.json({ call, signals, ...callIceConfiguration() });
  }));
  router.post('/mentor-calls/:threadId/start', mentorEndpoint(async (req, res) => {
    const { thread, role } = await authorizedConversation(req);
    if (req.body?.mode !== 'audio' && req.body?.mode !== 'video') throw new MentorApiError(400, 'Choose an audio or video call.');
    res.json({ call: await startCall(thread.id, role, req.body.mode), ...callIceConfiguration() });
  }));
  router.post('/mentor-calls/:threadId/:callId/status', mentorEndpoint(async (req, res) => {
    const { thread, role } = await authorizedConversation(req);
    res.json({ call: await updateCallStatus(thread.id, req.params.callId, role, req.body?.status) });
  }));
  router.post('/mentor-calls/:threadId/:callId/signals', mentorEndpoint(async (req, res) => {
    const { thread, role } = await authorizedConversation(req);
    await appendCallSignal(thread.id, req.params.callId, role, req.body);
    res.json({ ok: true });
  }));
  return router;
}
