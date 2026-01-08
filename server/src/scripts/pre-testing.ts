#!/usr/bin/env node

/**
 * NXvms - Pre-Testing Verification Script
 * 
 * Checks the system before starting testing:
 * - Node.js and npm versions
 * - Dependencies installed
 * - Docker availability
 * - Port availability
 * - Database connectivity
 * - File structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';

let testsPassed = 0;
let testsFailed = 0;
let testsWarned = 0;

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const colors = {
    pass: GREEN,
    fail: RED,
    warn: YELLOW,
    info: BLUE,
  };
  const symbols = {
    pass: '✅',
    fail: '❌',
    warn: '⚠️ ',
    info: 'ℹ️ ',
  };
  
  console.log(`[${timestamp}] ${symbols[type]} ${colors[type]}${message}${RESET}`);
}

function section(title) {
  console.log(`\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${BOLD}${BLUE}${title}${RESET}`);
  console.log(`${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);
}

function checkCommand(cmd, name) {
  try {
    const result = execSync(`${cmd} 2>&1`, { encoding: 'utf8' }).trim();
    log(`${name} is installed: ${result}`, 'pass');
    testsPassed++;
    return true;
  } catch {
    log(`${name} is NOT installed or not in PATH`, 'fail');
    testsFailed++;
    return false;
  }
}

function checkFile(filePath, name) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    log(`${name} found (${stats.size} bytes)`, 'pass');
    testsPassed++;
    return true;
  } else {
    log(`${name} NOT found at ${filePath}`, 'fail');
    testsFailed++;
    return false;
  }
}

function checkDirectory(dirPath, name) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath).length;
    log(`${name} found (${files} items)`, 'pass');
    testsPassed++;
    return true;
  } else {
    log(`${name} NOT found at ${dirPath}`, 'fail');
    testsFailed++;
    return false;
  }
}

function checkPort(port, name) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${port} is BUSY (${name})`, 'warn');
        testsWarned++;
        resolve(false);
      } else {
        log(`Port ${port} check error: ${err.message}`, 'fail');
        testsFailed++;
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      log(`Port ${port} is available (${name})`, 'pass');
      testsPassed++;
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
}

async function run() {
  console.log(`${BOLD}${GREEN}
╔═══════════════════════════════════════════════╗
║     NXvms - Pre-Testing Verification Script   ║
║               Let's get ready! 🚀              ║
╚═══════════════════════════════════════════════╝
${RESET}\n`);

  const cwd = process.cwd();
  log(`Working directory: ${cwd}`, 'info');

  // ============================================
  // ENVIRONMENT CHECKS
  // ============================================
  section('🔍 Environment Checks');
  
  checkCommand('node --version', 'Node.js');
  checkCommand('npm --version', 'npm');
  checkCommand('git --version', 'Git');

  // ============================================
  // PROJECT STRUCTURE
  // ============================================
  section('📁 Project Structure');
  
  checkDirectory(path.join(cwd, 'server'), 'Server directory');
  checkDirectory(path.join(cwd, 'client'), 'Client directory');
  checkDirectory(path.join(cwd, 'plans'), 'Documentation (plans)');

  // ============================================
  // SERVER FILES
  // ============================================
  section('🖥️ Server Files');
  
  checkDirectory(path.join(cwd, 'server/src'), 'Server src');
  checkDirectory(path.join(cwd, 'server/src/auth'), 'Auth module');
  checkDirectory(path.join(cwd, 'server/src/cameras'), 'Cameras module');
  checkDirectory(path.join(cwd, 'server/src/playback'), 'Playback module');
  checkDirectory(path.join(cwd, 'server/src/health'), 'Health module');
  
  checkFile(path.join(cwd, 'server/package.json'), 'Server package.json');
  checkFile(path.join(cwd, 'server/tsconfig.json'), 'Server tsconfig.json');
  checkFile(path.join(cwd, 'server/docker-compose.yml'), 'Docker Compose');
  checkFile(path.join(cwd, 'server/.env'), 'Server .env (development)');

  // ============================================
  // CLIENT FILES
  // ============================================
  section('⚛️ Client Files');
  
  checkDirectory(path.join(cwd, 'client/src'), 'Client src');
  checkDirectory(path.join(cwd, 'client/src/auth'), 'Auth pages');
  checkDirectory(path.join(cwd, 'client/src/layout'), 'Layout components');
  checkDirectory(path.join(cwd, 'client/src/live-view'), 'Live View');
  checkDirectory(path.join(cwd, 'client/src/resources'), 'Resources');
  
  checkFile(path.join(cwd, 'client/package.json'), 'Client package.json');
  checkFile(path.join(cwd, 'client/tsconfig.json'), 'Client tsconfig.json');
  checkFile(path.join(cwd, 'client/vite.config.ts'), 'Vite config');

  // ============================================
  // PORTS
  // ============================================
  section('🔌 Port Availability');
  
  await checkPort(3000, 'Backend');
  await checkPort(5173, 'Frontend');
  await checkPort(5432, 'PostgreSQL');
  await checkPort(8080, 'Adminer');

  // ============================================
  // DOCKER
  // ============================================
  section('🐳 Docker Check');
  
  checkCommand('docker --version', 'Docker');
  checkCommand('docker-compose --version', 'Docker Compose');

  // ============================================
  // DEPENDENCIES
  // ============================================
  section('📦 Dependencies Status');
  
  const serverNodeModules = path.join(cwd, 'server/node_modules');
  const clientNodeModules = path.join(cwd, 'client/node_modules');
  
  if (!fs.existsSync(serverNodeModules)) {
    log('Server dependencies NOT installed (run: cd server && npm install)', 'warn');
    testsWarned++;
  } else {
    const count = fs.readdirSync(serverNodeModules).length;
    log(`Server dependencies installed (${count} packages)`, 'pass');
    testsPassed++;
  }

  if (!fs.existsSync(clientNodeModules)) {
    log('Client dependencies NOT installed (run: cd client && npm install)', 'warn');
    testsWarned++;
  } else {
    const count = fs.readdirSync(clientNodeModules).length;
    log(`Client dependencies installed (${count} packages)`, 'pass');
    testsPassed++;
  }

  // ============================================
  // KEY SCRIPTS
  // ============================================
  section('🧪 Available Test Scripts');
  
  try {
    const serverPackage = JSON.parse(
      fs.readFileSync(path.join(cwd, 'server/package.json'), 'utf8')
    );
    const scripts = serverPackage.scripts || {};
    
    const importantScripts = [
      'start:dev',
      'db:migrate',
      'db:seed',
      'script:verify-system',
      'script:health-check',
    ];

    importantScripts.forEach(script => {
      if (scripts[script]) {
        log(`Script available: ${script}`, 'pass');
        testsPassed++;
      } else {
        log(`Script MISSING: ${script}`, 'warn');
        testsWarned++;
      }
    });
  } catch (err) {
    log(`Could not read server package.json: ${err.message}`, 'fail');
    testsFailed++;
  }

  // ============================================
  // SUMMARY
  // ============================================
  section('📊 Test Summary');
  
  console.log(`${GREEN}✅ Passed: ${testsPassed}${RESET}`);
  console.log(`${RED}❌ Failed: ${testsFailed}${RESET}`);
  console.log(`${YELLOW}⚠️  Warned: ${testsWarned}${RESET}\n`);

  // ============================================
  // RECOMMENDATIONS
  // ============================================
  section('💡 Next Steps');

  if (!fs.existsSync(path.join(cwd, 'server/node_modules'))) {
    console.log(`${BOLD}1. Install server dependencies:${RESET}`);
    console.log(`   cd server && npm install\n`);
  }

  if (!fs.existsSync(path.join(cwd, 'client/node_modules'))) {
    console.log(`${BOLD}2. Install client dependencies:${RESET}`);
    console.log(`   cd client && npm install\n`);
  }

  console.log(`${BOLD}3. Start the backend (Terminal 1):${RESET}`);
  console.log(`   cd server`);
  console.log(`   docker-compose up -d`);
  console.log(`   npm run db:migrate`);
  console.log(`   npm run db:seed`);
  console.log(`   npm run start:dev\n`);

  console.log(`${BOLD}4. Start the frontend (Terminal 2):${RESET}`);
  console.log(`   cd client`);
  console.log(`   npm run dev\n`);

  console.log(`${BOLD}5. Run verification (Terminal 3):${RESET}`);
  console.log(`   cd server`);
  console.log(`   npm run script:verify-system\n`);

  console.log(`${BOLD}6. Open in browser:${RESET}`);
  console.log(`   Frontend: http://localhost:5173`);
  console.log(`   Backend API: http://localhost:3000/api/docs`);
  console.log(`   Database UI: http://localhost:8080\n`);

  console.log(`${BOLD}7. Test credentials:${RESET}`);
  console.log(`   Username: ${BLUE}admin${RESET}`);
  console.log(`   Password: ${BLUE}admin123${RESET}\n`);

  // ============================================
  // READ TESTING GUIDE
  // ============================================
  section('📖 Testing Guide');
  
  if (fs.existsSync(path.join(cwd, 'TESTING.md'))) {
    log('TESTING.md found - Read it for detailed testing instructions!', 'pass');
  } else {
    log('TESTING.md not found', 'fail');
  }

  // ============================================
  // FINAL STATUS
  // ============================================
  console.log(`\n${BOLD}${GREEN}╔══════════════════════════════════════════════╗${RESET}`);
  
  if (testsFailed === 0) {
    console.log(`${BOLD}${GREEN}║  ✅ System is ready for testing!             ║${RESET}`);
  } else {
    console.log(`${BOLD}${RED}║  ⚠️  Fix issues above before testing         ║${RESET}`);
  }
  
  console.log(`${BOLD}${GREEN}║  Read TESTING.md for comprehensive guide     ║${RESET}`);
  console.log(`${BOLD}${GREEN}╚══════════════════════════════════════════════╝${RESET}\n`);

  process.exit(testsFailed > 0 ? 1 : 0);
}

run().catch(err => {
  log(`Unexpected error: ${err.message}`, 'fail');
  process.exit(1);
});
