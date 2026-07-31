import { HELP_CATEGORIES } from './schema.js';
import { CITIZEN_TOPICS } from './topics.citizen.js';
import { OFFICER_TOPICS } from './topics.officer.js';

// Direct re-export form — rollup resolves this reliably when the package is consumed through
// the `export *` chain in ../index.js.
export { HELP_CATEGORIES, localizedText } from './schema.js';
// Offline assistant matcher (no LLM — see matcher.js for why).
export {
  CONFIDENCE,
  normalize,
  tokenize,
  detectLanguage,
  expand,
  rankTopics,
  answerQuestion,
  suggestedTopics,
} from './matcher.js';
export { CITIZEN_TOPICS } from './topics.citizen.js';
export { OFFICER_TOPICS } from './topics.officer.js';

/** Every topic, both audiences. */
export const HELP_TOPICS = [...CITIZEN_TOPICS, ...OFFICER_TOPICS];

/** Topics an audience should see ('citizen' | 'officer'); 'both' matches either. */
export function topicsFor(audience) {
  return HELP_TOPICS.filter((t) => t.audience === audience || t.audience === 'both');
}

/** Look a topic up by id. */
export function getTopic(id) {
  return HELP_TOPICS.find((t) => t.id === id) || null;
}

/** Categories that actually contain at least one topic for this audience, in canonical order. */
export function categoriesFor(audience) {
  const present = new Set(topicsFor(audience).map((t) => t.category));
  return HELP_CATEGORIES.filter((c) => present.has(c));
}

/** Total FAQ entries across a topic list — used by the Help Center summary line. */
export function countFaqs(topics = HELP_TOPICS) {
  return topics.reduce((n, t) => n + (t.faqs?.length || 0), 0);
}

/** Normalise for comparison: lowercase, strip punctuation, collapse whitespace. */
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build the searchable haystack for a topic: both languages of the title, summary, step text,
 * FAQ questions and keywords. Searching both languages at once means a Marathi speaker can
 * still find a topic by typing an English word they recognise ("QR", "PDF") and vice versa.
 */
function haystack(topic) {
  const parts = [];
  const both = (v) => {
    if (!v) return;
    parts.push(v.en || '', v.mr || '');
  };
  both(topic.title);
  both(topic.summary);
  (topic.steps || []).forEach((s) => both(s.text));
  (topic.faqs || []).forEach((f) => {
    both(f.q);
    both(f.a);
  });
  (topic.requirements || []).forEach(both);
  parts.push(...(topic.keywords?.en || []), ...(topic.keywords?.mr || []));
  parts.push(topic.id.replace(/-/g, ' '));
  return norm(parts.join(' '));
}

/**
 * Bilingual search. Scores a topic by where the query matches — a title hit ranks above a
 * keyword hit, which ranks above a body hit — so the most relevant guide is first. Every term
 * in a multi-word query must appear somewhere (AND), which keeps "birth certificate" from
 * returning every certificate topic.
 *
 * @param {string} query
 * @param {{ audience?: 'citizen'|'officer', category?: string }} [options]
 * @returns {import('./schema.js').HelpTopic[]}
 */
export function searchTopics(query, { audience, category } = {}) {
  let pool = audience ? topicsFor(audience) : HELP_TOPICS;
  if (category && category !== 'all') pool = pool.filter((t) => t.category === category);

  const q = norm(query);
  if (!q) return pool;

  const terms = q.split(' ').filter(Boolean);

  return pool
    .map((topic) => {
      const hay = haystack(topic);
      // Every term must match somewhere, otherwise the topic is not a result at all.
      if (!terms.every((term) => hay.includes(term))) return null;

      const title = norm(`${topic.title.en} ${topic.title.mr}`);
      const keys = norm([...(topic.keywords?.en || []), ...(topic.keywords?.mr || [])].join(' '));
      let score = 1;
      if (title.includes(q)) score += 100;
      if (terms.every((t) => title.includes(t))) score += 40;
      if (terms.every((t) => keys.includes(t))) score += 20;
      const summary = norm(`${topic.summary?.en} ${topic.summary?.mr}`);
      if (summary.includes(q)) score += 10;
      return { topic, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.topic);
}
