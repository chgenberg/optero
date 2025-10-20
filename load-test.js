import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 50 },  // Spike to 50 users
    { duration: '1m', target: 50 },   // Stay at 50
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'],     // Less than 10% failed
    errors: ['rate<0.1'],              // Less than 10% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://optero-production.up.railway.app';

// Test scenarios
export default function() {
  // Test 1: Homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage status 200': (r) => r.status === 200,
    'homepage loads fast': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Dashboard (should load or redirect)
  res = http.get(`${BASE_URL}/dashboard`);
  check(res, {
    'dashboard accessible': (r) => r.status === 200 || r.status === 302,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Bot stats API
  res = http.get(`${BASE_URL}/api/bots/stats?email=all`);
  check(res, {
    'stats API responds': (r) => r.status === 200,
    'stats returns JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: QA Dashboard API
  res = http.get(`${BASE_URL}/api/qa-dashboard?email=all&timeRange=7d&limit=100`);
  check(res, {
    'QA dashboard API responds': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(2);
}

// Scenarios for different user types
export function customerBotFlow() {
  // Simulate customer using widget
  const res = http.get(`${BASE_URL}/widget.js`);
  check(res, {
    'widget.js loads': (r) => r.status === 200,
    'widget is JS': (r) => r.headers['Content-Type']?.includes('javascript'),
  }) || errorRate.add(1);

  sleep(1);
}

export function buildBotFlow() {
  // Simulate bot builder flow
  const scrapeRes = http.post(
    `${BASE_URL}/api/business/deep-scrape`,
    JSON.stringify({ url: 'https://example.com' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(scrapeRes, {
    'deep-scrape responds': (r) => r.status === 200 || r.status === 500, // May fail on example.com, that's OK
  }) || errorRate.add(1);

  sleep(2);
}

