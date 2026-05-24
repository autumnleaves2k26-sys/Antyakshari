import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('artifacts/antyakshari/dist/public');
const destDir = path.resolve('public');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  if (fs.existsSync(srcDir)) {
    console.log(`Copying build output from ${srcDir} to ${destDir}...`);
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
    }
    copyDir(srcDir, destDir);
    console.log('Build output successfully copied to root public directory!');
  } else {
    console.warn(`Source build directory ${srcDir} does not exist. Skipping copy.`);
  }
} catch (err) {
  console.error('Failed to copy build output:', err);
  process.exit(1);
}
