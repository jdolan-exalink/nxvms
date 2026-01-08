import * as os from 'os';
import * as fs from 'fs';
import axios from 'axios';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  system: {
    uptime: string;
    memory: { rss: string; heap: string; system: string };
    cpu: number;
  };
  database: boolean;
  ffmpeg: boolean;
  storage: { total: string; used: string; available: string };
  cameras: number;
}

async function getHealthStatus(): Promise<HealthStatus> {
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  const token = process.env.API_TOKEN || '';

  try {
    const response = await axios.get(`${baseUrl}/api/v1/health`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch health status:', error.message);
    throw error;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function main() {
  console.log('\n🏥 NXvms Health Check\n');

  try {
    const health = await getHealthStatus();

    const statusEmoji = {
      healthy: '✅',
      degraded: '⚠️',
      unhealthy: '❌',
    };

    console.log(`Status: ${statusEmoji[health.status]} ${health.status.toUpperCase()}`);
    console.log(`Last Updated: ${new Date(health.timestamp).toISOString()}\n`);

    console.log('📊 System Metrics:');
    console.log(`  Uptime: ${health.system.uptime}`);
    console.log(`  Memory: RSS ${health.system.memory.rss}, Heap ${health.system.memory.heap}`);
    console.log(`  System Memory: ${health.system.memory.system}`);
    console.log(`  CPU Usage: ${health.system.cpu.toFixed(2)}%\n`);

    console.log('🔧 Services:');
    console.log(`  Database: ${health.database ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`  FFmpeg: ${health.ffmpeg ? '✅ Available' : '❌ Not Available'}`);
    console.log(`  Cameras: ${health.cameras} active\n`);

    console.log('💾 Storage:');
    console.log(`  Total: ${health.storage.total}`);
    console.log(`  Used: ${health.storage.used}`);
    console.log(`  Available: ${health.storage.available}\n`);

    const allHealthy = health.database && health.ffmpeg;
    if (!allHealthy) {
      console.log('⚠️  Warning: Some services are not healthy. Check logs for details.\n');
    } else {
      console.log('🎉 All systems operational!\n');
    }
  } catch (error) {
    console.error('Health check failed. Make sure the server is running at http://localhost:3000\n');
    process.exit(1);
  }
}

main();
