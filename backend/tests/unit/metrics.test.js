import {
  incrementCounter,
  observeRequestDuration,
  renderPrometheus,
  resetMetrics,
} from '../../src/utils/metrics.js';

beforeEach(() => resetMetrics());

describe('metrics registry', () => {
  test('counters accumulate and render in Prometheus format', () => {
    incrementCounter('http_requests_total');
    incrementCounter('http_requests_total', 2);
    const out = renderPrometheus();
    expect(out).toMatch(/dgp_http_requests_total 3/);
    expect(out).toMatch(/# TYPE dgp_http_requests_total counter/);
  });

  test('duration histogram records buckets, sum and count', () => {
    observeRequestDuration(10);
    observeRequestDuration(300);
    const out = renderPrometheus();
    expect(out).toMatch(/dgp_http_request_duration_ms_count 2/);
    expect(out).toMatch(/dgp_http_request_duration_ms_sum 310/);
    expect(out).toMatch(/le="\+Inf"} 2/);
  });

  test('reset clears everything', () => {
    incrementCounter('x');
    resetMetrics();
    expect(renderPrometheus()).not.toMatch(/dgp_x /);
  });
});
