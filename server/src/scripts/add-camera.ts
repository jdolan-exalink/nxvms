import { Onvif } from 'onvif';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🎬 NXvms Camera Discovery Tool\n');

  const choice = await question('Enter ONVIF camera IP (or "auto" for discovery): ');

  if (choice.toLowerCase() === 'auto') {
    console.log('\n🔍 Starting ONVIF discovery (this may take 5-10 seconds)...\n');
    try {
      const devices = await Onvif.Discovery.probe({ timeout: 5000 });
      if (devices.length === 0) {
        console.log('❌ No ONVIF devices found on network');
      } else {
        console.log(`✅ Found ${devices.length} ONVIF device(s):\n`);
        devices.forEach((device, idx) => {
          console.log(`  [${idx + 1}] ${device.hostname || device.address}`);
          console.log(`     Address: ${device.address}`);
          console.log(`     Scopes: ${device.scopes?.join(', ') || 'N/A'}\n`);
        });
      }
    } catch (error) {
      console.error('❌ Discovery failed:', error.message);
    }
  } else {
    console.log('\n📋 Manual Camera Setup\n');
    const ip = choice;
    const username = await question('Username (default: admin): ') || 'admin';
    const password = await question('Password: ');
    const port = await question('Port (default: 80): ') || '80';

    console.log(`\n📝 Camera configuration ready:`);
    console.log(`  IP: ${ip}`);
    console.log(`  Port: ${port}`);
    console.log(`  Username: ${username}`);
    console.log(`  RTSP URL: rtsp://${username}:${password}@${ip}:554/stream1`);
    console.log(`\n✅ Use these credentials to create a camera in NXvms\n`);
  }

  rl.close();
}

main().catch(console.error);
