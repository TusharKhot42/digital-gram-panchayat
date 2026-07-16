/**
 * Mock translation provider — the development default when no external API key is configured.
 * It does not call any paid service; it returns the source text with a language marker so the
 * "other language" version is present, non-empty, and visibly distinct for testing/demo. A
 * real provider (Google Translate / OpenAI / etc.) implements the same `translate` contract
 * and is selected via TRANSLATION_PROVIDER without changing any caller.
 */
export const mockTranslationProvider = {
  name: 'mock',
  translate(text, from, to) {
    if (!text) return text;
    if (from === to) return text;
    return `${text} [${to}]`;
  },
};
