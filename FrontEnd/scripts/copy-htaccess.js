// Script pour copier .htaccess dans dist/ après le build
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const htaccessSource = join(process.cwd(), '.htaccess');
const htaccessDest = join(process.cwd(), 'dist', '.htaccess');

if (existsSync(htaccessSource)) {
  copyFileSync(htaccessSource, htaccessDest);
  console.log('✅ .htaccess copié dans dist/');
} else {
  console.warn('⚠️  .htaccess non trouvé, ignoré');
}
