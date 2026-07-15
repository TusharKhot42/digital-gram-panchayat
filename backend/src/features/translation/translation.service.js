import { SUPPORTED_LANGUAGES } from '@dgp/shared';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { mockTranslationProvider } from './providers/mock.provider.js';

/**
 * Provider-agnostic translation. The active provider is chosen by TRANSLATION_PROVIDER; only
 * the dependency-free mock ships today (no paid service). A real provider (Google/OpenAI/…)
 * registers here with the same `translate(text, from, to)` contract — no caller changes.
 */
const registry = {
  mock: mockTranslationProvider,
};

function getProvider() {
  return registry[env.TRANSLATION_PROVIDER] || mockTranslationProvider;
}

/** Register a real provider at boot (e.g. setTranslationProvider('google', googleProvider)). */
export function setTranslationProvider(name, provider) {
  if (name && provider) registry[name] = provider;
}

/** Heuristic source-language detection: any Devanagari => Marathi, else English. */
export function detectLanguage(text) {
  return /[ऀ-ॿ]/.test(text || '') ? 'mr' : 'en';
}

/**
 * Produce both language versions of a piece of user-entered text. The source language keeps
 * the original text verbatim; the other is machine-translated. Empty/whitespace input yields
 * empty strings for both. Never throws — on provider failure the original is reused so content
 * is never lost.
 *
 * @param {string} text
 * @param {string} [sourceLang] - override detection when the UI language is known
 * @returns {Promise<{ en: string, mr: string, source: string }>}
 */
export async function translateToBoth(text, sourceLang) {
  const source =
    sourceLang && SUPPORTED_LANGUAGES.includes(sourceLang) ? sourceLang : detectLanguage(text);
  const out = { en: '', mr: '', source };
  if (!text || !text.trim()) return out;
  out[source] = text;
  const target = source === 'en' ? 'mr' : 'en';
  try {
    out[target] = await getProvider().translate(text, source, target);
  } catch (err) {
    logger.error('Translation failed; falling back to source text', err);
    out[target] = text; // never lose content
  }
  return out;
}

/**
 * Translate several named fields at once. Returns `{ field: { en, mr } }`, skipping
 * empty/undefined fields. Used to build the `i18n` block stored on notices/notifications/etc.
 */
export async function translateFields(fields, sourceLang) {
  const result = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue;
    const both = await translateToBoth(String(value), sourceLang);
    result[key] = { en: both.en, mr: both.mr };
  }
  return result;
}
