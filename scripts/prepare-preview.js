/**
 * Script pour préparer le preview local avec le basePath
 * Compatible Windows + Unix
 */

import { mkdirSync, cpSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

const TEMP_DIR = 'temp-serve';
const BASE_PATH = 'Cuisine-artisanale';
const OUT_DIR = 'out';

console.log('📦 Préparation du preview local...\n');

try {
  // Supprimer le dossier temp s'il existe
  if (existsSync(TEMP_DIR)) {
	console.log('🗑️  Nettoyage du dossier temporaire...');
	rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  // Créer la structure temp-serve/Cuisine-artisanale
  const targetDir = join(TEMP_DIR, BASE_PATH);
  console.log(`📁 Création du dossier: ${targetDir}`);
  mkdirSync(targetDir, { recursive: true });

  // Copier le contenu de out/ vers temp-serve/Cuisine-artisanale/
  console.log(`📋 Copie de ${OUT_DIR}/ vers ${targetDir}/`);
  cpSync(OUT_DIR, targetDir, { recursive: true });

  console.log('\n✅ Preview préparé avec succès !');
  console.log(`\n🚀 Lancez maintenant: serve ${TEMP_DIR} -p 3000`);
  console.log(`📱 Puis ouvrez: http://localhost:3000/${BASE_PATH}/\n`);

} catch (error) {
  console.error('❌ Erreur lors de la préparation:', error.message);
  process.exit(1);
}
