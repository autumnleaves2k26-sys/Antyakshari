import fs from 'node:fs';
import path from 'node:path';

<<<<<<< Updated upstream:.migration-backup/scripts/post-build.mjs
const srcDir = path.resolve('artifacts/antyakshari/dist');
const destDir = path.resolve('dist');
=======
const srcDir = path.resolve('artifacts/antyakshari/dist/public');
const distDir = path.resolve('dist');
const publicDir = path.resolve('public');
>>>>>>> Stashed changes:scripts/post-build.mjs

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
    console.log(`Copying build output from ${srcDir} to ${distDir} and ${publicDir}...`);
    
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
    copyDir(srcDir, distDir);
    
    if (fs.existsSync(publicDir)) {
      fs.rmSync(publicDir, { recursive: true, force: true });
    }
    copyDir(srcDir, publicDir);
    
    console.log('Build output successfully copied to dist and public directories!');
  } else {
    console.warn(`Source build directory ${srcDir} does not exist. Skipping copy.`);
  }
} catch (err) {
  console.error('Failed to copy build output:', err);
  process.exit(1);
}
