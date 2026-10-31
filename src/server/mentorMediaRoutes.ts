import { Router } from 'express';
import { authorizedConversation, mentorEndpoint, MentorApiError } from './mentorAccess.js';
import { createVoiceUpload, completeVoiceUpload, voicePlaybackUrl } from './mentorMediaStore.js';
import { appendMessage } from './messageStore.js';

export function createMentorMediaRouter() {
  const router = Router();
  router.post('/messages/:threadId/voice/upload-url', mentorEndpoint(async (req, res) => {
    const { thread, role } = await authorizedConversation(req);
    res.json(await createVoiceUpload(thread.id, role, req.body));
  }));
  router.post('/messages/:threadId/voice/complete', mentorEndpoint(async (req, res) => {
    const { thread, role } = await authorizedConversation(req);
    const audio = await completeVoiceUpload(thread.id, role, req.body?.path, req.body?.uploadToken);
    res.json({ thread: await appendMessage(thread.id, role, 'Voice note', audio) });
  }));
  router.get('/messages/:threadId/voice/:messageId/url', mentorEndpoint(async (req, res) => {
    const { thread } = await authorizedConversation(req);
    const message = thread.messages.find((item) => item.id === req.params.messageId);
    if (!message?.audio) throw new MentorApiError(404, 'No such voice note.');
    res.json(await voicePlaybackUrl(message.audio.path));
  }));
  return router;
}
