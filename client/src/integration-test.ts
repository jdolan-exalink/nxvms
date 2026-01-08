/**
 * NXvms Client - Integration Test Script
 * 
 * Tests the connection between the React Frontend and NestJS Backend
 * Run with: npm run test:integration
 */

import axios from 'axios';

const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
};

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  duration: number;
}

const results: TestResult[] = [];
const BACKEND_URL = 'http://localhost:3000/api/v1';
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

function log(message: string, color: keyof typeof COLORS = 'RESET') {
  console.log(`${COLORS[color]}${message}${COLORS.RESET}`);
}

function logSection(title: string) {
  console.log('');
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'CYAN');
  log(title, 'CYAN');
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'CYAN');
  console.log('');
}

async function testBackendHealth(): Promise<void> {
  const start = Date.now();
  const test = 'Backend Health Check';

  try {
    const response = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 5000,
    });

    if (response.status === 200 && response.data.status === 'healthy') {
      results.push({
        name: test,
        status: 'pass',
        message: 'Backend is running and healthy',
        duration: Date.now() - start,
      });
      log(`✅ ${test}`, 'GREEN');
    } else {
      throw new Error('Backend returned unexpected response');
    }
  } catch (error: any) {
    results.push({
      name: test,
      status: 'fail',
      message: error.message || 'Backend health check failed',
      duration: Date.now() - start,
    });
    log(`❌ ${test}: ${error.message}`, 'RED');
  }
}

async function testDatabaseConnection(): Promise<void> {
  const start = Date.now();
  const test = 'Database Connection';

  try {
    const response = await axios.get(`${BACKEND_URL}/health/db`, {
      timeout: 5000,
    });

    if (response.status === 200 && response.data.status === 'connected') {
      results.push({
        name: test,
        status: 'pass',
        message: 'Database is connected',
        duration: Date.now() - start,
      });
      log(`✅ ${test}`, 'GREEN');
    } else {
      throw new Error('Database connection check failed');
    }
  } catch (error: any) {
    results.push({
      name: test,
      status: 'fail',
      message: error.message || 'Database connection failed',
      duration: Date.now() - start,
    });
    log(`❌ ${test}: ${error.message}`, 'RED');
  }
}

async function testLogin(): Promise<string | null> {
  const start = Date.now();
  const test = 'User Login';

  try {
    const response = await axios.post(`${BACKEND_URL}/auth/login`, TEST_CREDENTIALS, {
      timeout: 5000,
    });

    if (response.status === 200 && response.data.access_token) {
      results.push({
        name: test,
        status: 'pass',
        message: `Successfully logged in as ${TEST_CREDENTIALS.username}`,
        duration: Date.now() - start,
      });
      log(`✅ ${test}`, 'GREEN');
      return response.data.access_token;
    } else {
      throw new Error('Login returned unexpected response');
    }
  } catch (error: any) {
    results.push({
      name: test,
      status: 'fail',
      message: error.message || 'Login failed',
      duration: Date.now() - start,
    });
    log(`❌ ${test}: ${error.message}`, 'RED');
    return null;
  }
}

async function testGetProfile(token: string): Promise<void> {
  const start = Date.now();
  const test = 'Get User Profile';

  try {
    const response = await axios.get(`${BACKEND_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });

    if (response.status === 200 && response.data.username) {
      results.push({
        name: test,
        status: 'pass',
        message: `Retrieved profile for user: ${response.data.username}`,
        duration: Date.now() - start,
      });
      log(`✅ ${test}`, 'GREEN');
    } else {
      throw new Error('Profile retrieval returned unexpected response');
    }
  } catch (error: any) {
    results.push({
      name: test,
      status: 'fail',
      message: error.message || 'Failed to get profile',
      duration: Date.now() - start,
    });
    log(`❌ ${test}: ${error.message}`, 'RED');
  }
}

async function testGetCameras(token: string): Promise<void> {
  const start = Date.now();
  const test = 'List Cameras';

  try {
    const response = await axios.get(`${BACKEND_URL}/cameras`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });

    if (response.status === 200) {
      const count = Array.isArray(response.data) ? response.data.length : 0;
      results.push({
        name: test,
        status: 'pass',
        message: `Found ${count} cameras`,
        duration: Date.now() - start,
      });
      log(`✅ ${test}: ${count} cameras found`, 'GREEN');
    } else {
      throw new Error('Camera list returned unexpected response');
    }
  } catch (error: any) {
    results.push({
      name: test,
      status: 'fail',
      message: error.message || 'Failed to list cameras',
      duration: Date.now() - start,
    });
    log(`❌ ${test}: ${error.message}`, 'RED');
  }
}

async function testSwaggerDocumentation(): Promise<void> {
  const start = Date.now();
  const test = 'Swagger API Documentation';

  try {
    const response = await axios.get(`http://localhost:3000/api/docs`, {
      timeout: 5000,
    });

    if (response.status === 200) {
      results.push({
        name: test,
        status: 'pass',
        message: 'Swagger UI is available',
        duration: Date.now() - start,
      });
      log(`✅ ${test}`, 'GREEN');
    } else {
      throw new Error('Swagger UI returned unexpected response');
    }
  } catch (error: any) {
    results.push({
      name: test,
      status: 'fail',
      message: error.message || 'Swagger UI not accessible',
      duration: Date.now() - start,
    });
    log(`❌ ${test}: ${error.message}`, 'RED');
  }
}

async function runAllTests(): Promise<void> {
  console.log('');
  log('╔════════════════════════════════════════════════════════════╗', 'CYAN');
  log('║     NXvms Client-Server Integration Test                  ║', 'CYAN');
  log('╚════════════════════════════════════════════════════════════╝', 'CYAN');
  console.log('');

  log(`Testing Backend: ${BACKEND_URL}`, 'BLUE');
  log(`Test Credentials: ${TEST_CREDENTIALS.username} / ${TEST_CREDENTIALS.password}`, 'BLUE');
  console.log('');

  // Step 1: Check backend is running
  logSection('Step 1: Backend Connectivity');
  await testBackendHealth();
  await testDatabaseConnection();

  // Step 2: Test authentication
  logSection('Step 2: Authentication');
  const token = await testLogin();

  if (!token) {
    log('❌ Cannot proceed without valid token', 'RED');
    printSummary();
    process.exit(1);
  }

  // Step 3: Test authenticated endpoints
  logSection('Step 3: Authenticated Endpoints');
  await testGetProfile(token);
  await testGetCameras(token);

  // Step 4: Test API documentation
  logSection('Step 4: API Documentation');
  await testSwaggerDocumentation();

  // Summary
  logSection('Test Summary');
  printSummary();

  // Check if all tests passed
  const allPassed = results.every((r) => r.status === 'pass');
  process.exit(allPassed ? 0 : 1);
}

function printSummary(): void {
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const total = results.length;

  console.log('');
  log(`✅ Passed: ${passed}/${total}`, 'GREEN');
  log(`❌ Failed: ${failed}/${total}`, 'RED');
  console.log('');

  if (failed === 0) {
    log('🎉 All tests passed! Client-Server integration is working correctly.', 'GREEN');
    console.log('');
    log('Next steps:', 'CYAN');
    log('1. Start frontend: npm run dev', 'CYAN');
    log('2. Open http://localhost:5173', 'CYAN');
    log('3. Login with admin / admin123', 'CYAN');
    log('4. Test the application', 'CYAN');
  } else {
    log('⚠️  Some tests failed. Please check the errors above.', 'YELLOW');
    console.log('');
    log('Troubleshooting:', 'CYAN');
    log('1. Ensure backend is running: npm run start:dev (in server directory)', 'CYAN');
    log('2. Check backend is accessible: curl http://localhost:3000/api/v1/health', 'CYAN');
    log('3. Verify database is running: docker-compose ps', 'CYAN');
    log('4. Check logs: docker-compose logs -f', 'CYAN');
  }

  console.log('');
  log('Test Details:', 'CYAN');
  results.forEach((result) => {
    const status = result.status === 'pass' ? '✅' : '❌';
    const color = result.status === 'pass' ? 'GREEN' : 'RED';
    log(`${status} ${result.name}`, color);
    log(`   Message: ${result.message}`, 'BLUE');
    log(`   Duration: ${result.duration}ms`, 'BLUE');
  });

  console.log('');
}

// Run tests
runAllTests().catch((error) => {
  log(`Fatal error: ${error.message}`, 'RED');
  process.exit(1);
});
