// copy404.js
import { copyFile } from 'fs/promises';

try {
  await copyFile('dist/index.html', 'dist/404.html');
  console.log('404.html created');
} catch (err) {
  console.error('Failed to copy index.html to 404.html:', err);
}
