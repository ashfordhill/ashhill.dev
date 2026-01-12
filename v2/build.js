const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}

fs.mkdirSync(outDir, { recursive: true });

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

['index.html', 'style.css', 'script.js'].forEach(file => {
  fs.copyFileSync(path.join(__dirname, file), path.join(outDir, file));
});

copyRecursive(path.join(__dirname, 'images'), path.join(outDir, 'images'));

console.log('Build complete! Output in /out directory');
