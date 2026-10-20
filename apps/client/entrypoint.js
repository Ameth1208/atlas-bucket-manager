const fs = require('fs');
const path = require('path');

const targetApiUrl = (process.env.API_URL || process.env.INTERNAL_API_URL || '').replace(/\/+$/, '');

if (targetApiUrl && targetApiUrl !== 'http://localhost:3001' && targetApiUrl !== 'http://127.0.0.1:3001') {
  console.log(`[Atlas Web] Configuring dynamic backend API proxy -> ${targetApiUrl}`);

  const candidates = [
    path.join(__dirname, 'server.js'),
    path.join(__dirname, '.next/routes-manifest.json'),
    path.join(__dirname, '.next/required-server-files.json'),
    path.join(process.cwd(), 'server.js'),
    path.join(process.cwd(), '.next/routes-manifest.json'),
    path.join(process.cwd(), '.next/required-server-files.json'),
    path.join(process.cwd(), 'apps/client/server.js'),
    path.join(process.cwd(), 'apps/client/.next/routes-manifest.json'),
    path.join(process.cwd(), 'apps/client/.next/required-server-files.json'),
  ];

  const uniqueFiles = Array.from(new Set(candidates));

  for (const file of uniqueFiles) {
    if (fs.existsSync(file)) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('http://localhost:3001')) {
          content = content.split('http://localhost:3001').join(targetApiUrl);
          fs.writeFileSync(file, content, 'utf8');
          console.log(`[Atlas Web] Successfully patched proxy target in ${path.basename(file)}`);
        }
      } catch (err) {
        console.warn(`[Atlas Web] Warning patching ${file}:`, err.message);
      }
    }
  }
} else {
  console.log(`[Atlas Web] Using default backend API proxy: http://localhost:3001`);
}

// Start Next.js standalone server
require('./server.js');
