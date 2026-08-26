import { NOTIFICATION_PROMPT_POSITION_CLASS } from './ContentNotificationCenter.js';

const requiredClasses = ['fixed', 'bottom-24', 'right-4', 'sm:right-6', 'lg:right-10'];

for (const className of requiredClasses) {
  if (!NOTIFICATION_PROMPT_POSITION_CLASS.split(/\s+/).includes(className)) {
    throw new Error(`Notification prompt should include ${className}.`);
  }
}

if (NOTIFICATION_PROMPT_POSITION_CLASS.includes('top-24')) {
  throw new Error('Notification prompt should no longer appear at the top of the viewport.');
}

if (NOTIFICATION_PROMPT_POSITION_CLASS.includes('bottom-6')) {
  throw new Error('Notification prompt should sit higher than the bottom edge of the hero.');
}

if (NOTIFICATION_PROMPT_POSITION_CLASS.includes('inset-x-4')) {
  throw new Error('Notification prompt should sit on the right side, not centered across the viewport.');
}
