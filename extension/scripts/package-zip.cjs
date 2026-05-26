const { execSync } = require('node:child_process');
const { existsSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const version = process.env.npm_package_version || '0.0.0';
const releaseDir = join(process.cwd(), 'release');
const zipPath = join(releaseDir, `prioritask-v${version}.zip`);

if (!existsSync(releaseDir)) {
  mkdirSync(releaseDir, { recursive: true });
}

execSync('npm run build', { stdio: 'inherit' });

const escapedZipPath = zipPath.replace(/\\/g, '/');
execSync(`powershell -NoProfile -Command "Compress-Archive -Path dist/* -DestinationPath '${escapedZipPath}' -Force"`, {
  stdio: 'inherit',
});

console.log(`Created package: ${zipPath}`);
