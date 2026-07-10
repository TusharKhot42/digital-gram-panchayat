import { smsProvider } from './sms.provider.js';
import { voiceProvider } from './voice.provider.js';
import { emailProvider } from './email.provider.js';

// Channel -> provider registry. inApp has no external provider (stored only).
const registry = {
  sms: smsProvider,
  voice: voiceProvider,
  email: emailProvider,
};

/**
 * @param {string} channel
 * @returns {import('./provider.interface.js').NotificationProvider | null}
 */
export function getProvider(channel) {
  return registry[channel] || null;
}

export { smsProvider, voiceProvider, emailProvider };
