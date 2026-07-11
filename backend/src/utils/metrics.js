/**
 * Provider-agnostic, dependency-free metrics registry. Records counters + a request-duration
 * histogram in memory and can render them in Prometheus text-exposition format, so a scraper
 * (Prometheus/Grafana) can be pointed at `GET /api/v1/metrics` with no vendor lock-in and no
 * paid dependency. Swap this module for a real client later without touching call sites.
 */

const counters = new Map(); // name -> count
const buckets = [5, 25, 50, 100, 250, 500, 1000, 2500]; // ms
const durations = { buckets: new Array(buckets.length).fill(0), sum: 0, count: 0 };

/** Increment a named counter (e.g. `http_requests_total`). */
export function incrementCounter(name, by = 1) {
  counters.set(name, (counters.get(name) || 0) + by);
}

/** Record a request duration in milliseconds into the histogram. */
export function observeRequestDuration(ms) {
  durations.sum += ms;
  durations.count += 1;
  for (let i = 0; i < buckets.length; i += 1) {
    if (ms <= buckets[i]) durations.buckets[i] += 1;
  }
}

/** Reset all metrics (used in tests). */
export function resetMetrics() {
  counters.clear();
  durations.buckets.fill(0);
  durations.sum = 0;
  durations.count = 0;
}

/** Render the current snapshot in Prometheus text-exposition format. */
export function renderPrometheus() {
  const lines = [];
  lines.push('# HELP dgp_http_requests_total Total HTTP requests by outcome.');
  lines.push('# TYPE dgp_http_requests_total counter');
  for (const [name, value] of counters) {
    lines.push(`dgp_${name} ${value}`);
  }
  lines.push('# HELP dgp_http_request_duration_ms Request duration histogram (ms).');
  lines.push('# TYPE dgp_http_request_duration_ms histogram');
  let cumulative = 0;
  for (let i = 0; i < buckets.length; i += 1) {
    cumulative += durations.buckets[i];
    lines.push(`dgp_http_request_duration_ms_bucket{le="${buckets[i]}"} ${cumulative}`);
  }
  lines.push(`dgp_http_request_duration_ms_bucket{le="+Inf"} ${durations.count}`);
  lines.push(`dgp_http_request_duration_ms_sum ${durations.sum}`);
  lines.push(`dgp_http_request_duration_ms_count ${durations.count}`);
  return `${lines.join('\n')}\n`;
}
