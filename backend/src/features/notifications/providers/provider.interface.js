/**
 * Notification provider contract. Every channel provider implements this shape so the
 * notification service never depends on a concrete vendor. Swapping Twilio<->MSG91, or
 * adding Email / Push / WhatsApp, means adding a provider — business modules don't change.
 *
 * @typedef {Object} NotificationProvider
 * @property {string} channel  - 'sms' | 'voice' | 'email' | ...
 * @property {(msg: OutboundMessage) => Promise<DeliveryResult>} send
 *
 * @typedef {Object} OutboundMessage
 * @property {string} to      - destination (mobile / email)
 * @property {string} title
 * @property {string} message
 * @property {Object.<string, any>} [metadata]
 *
 * @typedef {Object} DeliveryResult
 * @property {'sent'|'delivered'|'failed'|'skipped'} status
 * @property {string} [providerMessageId]
 * @property {string} [error]
 */

export {};
