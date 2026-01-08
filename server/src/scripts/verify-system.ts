#!/usr/bin/env ts-node
/**
 * NXvms System Verification Script
 * Verifies that client and server are properly configured and can communicate
 */

import * as http from 'http';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: TestResult[] = [];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

function addResult(name: string, status: 'pass' | 'fail' | 'warn', message: string) {
  results.push({ name, status, message });
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? colors.green : status === 'fail' ? colors.red : colors.yellow;
  log(color, `  ${icon} ${name}: ${message}`);
}

async function testEndpoint(
  url: string,
  method: string = 'GET',
  headers?: Record<string, string>,
  body?: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const reqUrl = new URL(url);
      const options: http.RequestOptions = {
        hostname: reqUrl.hostname,
        port: reqUrl.port,
        path: reqUrl.pathname + reqUrl.search,
        method,
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      const req = http.request(options, (res) => {
        resolve(res.statusCode !== undefined && res.statusCode < 500);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      if (body) {
        req.write(body);
      }
      req.end();
    } catch (e) {
      resolve(false);
    }
  });
}

async function runTests() {
  log(colors.blue, '\n╔════════════════════════════════════════════╗');
  log(colors.blue, '║  NXvms System Verification Script          ║');
  log(colors.blue, '╚════════════════════════════════════════════╝\n');

  // Test Backend
  log(colors.blue, '🖥️  Testing Backend (NestJS Server)...\n');

  const backendUrl = 'http://localhost:3000';
  const healthEndpoint = `${backendUrl}/api/v1/health`;

  const backendOnline = await testEndpoint(healthEndpoint);
  addResult('Backend Health Endpoint', backendOnline ? 'pass' : 'fail', 
    backendOnline ? 'Backend is online' : 'Cannot reach backend on http://localhost:3000');

  if (backendOnline) {
    // Test API endpoints
    const authLoginUrl = `${backendUrl}/api/v1/auth/login`;
    const camerasUrl = `${backendUrl}/api/v1/cameras`;

    const canLogin = await testEndpoint(authLoginUrl, 'POST', {}, 
      JSON.stringify({ username: 'test', password: 'test' }));
    addResult('Auth Endpoint Available', canLogin ? 'pass' : 'fail',
      canLogin ? '/auth/login is accessible' : '/auth/login not responding');

    const canGetCameras = await testEndpoint(camerasUrl, 'GET');
    addResult('Cameras Endpoint Available', canGetCameras ? 'pass' : 'fail',
      canGetCameras ? '/cameras is accessible' : '/cameras not responding');

    // Test Swagger docs
    const swaggerUrl = `${backendUrl}/api/docs`;
    const hasSwagger = await testEndpoint(swaggerUrl);
    addResult('Swagger Documentation', hasSwagger ? 'pass' : 'warn',
      hasSwagger ? 'API docs available at /api/docs' : 'Swagger docs not found');
  }

  // Test Frontend
  log(colors.blue, '\n🎨 Testing Frontend (React Client)...\n');

  const frontendUrl = 'http://localhost:5173';
  const frontendOnline = await testEndpoint(frontendUrl);
  addResult('Frontend Dev Server', frontendOnline ? 'pass' : 'warn',
    frontendOnline ? 'Frontend dev server running' : 'Frontend not yet started (run "npm run dev" in /client)');

  // Print Summary
  log(colors.blue, '\n╔════════════════════════════════════════════╗');
  log(colors.blue, '║  Verification Results                      ║');
  log(colors.blue, '╚════════════════════════════════════════════╝\n');

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warned = results.filter((r) => r.status === 'warn').length;

  log(colors.green, `  ✅ Passed: ${passed}`);
  if (failed > 0) log(colors.red, `  ❌ Failed: ${failed}`);
  if (warned > 0) log(colors.yellow, `  ⚠️  Warnings: ${warned}`);

  // Print next steps
  log(colors.blue, '\n📋 Next Steps:\n');

  if (!backendOnline) {
    log(colors.yellow, '  1. Start the backend:');
    log(colors.reset, '     cd server');
    log(colors.reset, '     docker-compose up -d');
    log(colors.reset, '     npm install && npm run db:migrate && npm run db:seed');
    log(colors.reset, '     npm run start:dev\n');
  } else {
    log(colors.green, '  ✅ Backend is running!\n');
  }

  if (!frontendOnline) {
    log(colors.yellow, '  2. Start the frontend:');
    log(colors.reset, '     cd client');
    log(colors.reset, '     npm install && npm run dev\n');
  } else {
    log(colors.green, '  ✅ Frontend is running!\n');
  }

  if (backendOnline && frontendOnline) {
    log(colors.green, '\n  🎉 System is ready for testing!');
    log(colors.reset, '     Frontend: http://localhost:5173');
    log(colors.reset, '     Backend:  http://localhost:3000/api/v1');
    log(colors.reset, '     Swagger:  http://localhost:3000/api/docs\n');

    log(colors.blue, '  📝 Test Credentials:');
    log(colors.reset, '     Username: admin');
    log(colors.reset, '     Password: admin123\n');
  }
}

runTests().catch(console.error);
