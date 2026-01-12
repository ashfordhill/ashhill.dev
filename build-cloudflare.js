const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const activeVersion = process.env.ACTIVE_VERSION || 'v1';

console.log(`Building version: ${activeVersion}`);

const versionDir = path.join(__dirname, activeVersion);
const outDir = path.join(versionDir, 'out');
const rootOutDir = path.join(__dirname, 'out');

if (!fs.existsSync(versionDir)) {
  throw new Error(`Version directory ${activeVersion} does not exist`);
}

try {
  console.log(`Installing dependencies in ${activeVersion}...`);
  execSync('npm install', { cwd: versionDir, stdio: 'inherit' });
  
  console.log(`Building ${activeVersion}...`);
  execSync('npm run build', { cwd: versionDir, stdio: 'inherit' });
  
  if (fs.existsSync(rootOutDir)) {
    fs.rmSync(rootOutDir, { recursive: true, force: true });
  }
  
  console.log(`Copying build output to root...`);
  fs.cpSync(outDir, rootOutDir, { recursive: true });
  
  console.log(`Build completed successfully for ${activeVersion}`);
} catch (error) {
  console.error(`Build failed for ${activeVersion}:`, error.message);
  process.exit(1);
}
